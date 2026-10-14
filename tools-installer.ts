import { execFile, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, chmod, copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import type { Connect } from 'vite';

// Detects which external tools the CLI-backed formats need and installs the
// missing ones on request (UI: src/ToolsPanel.tsx). Windows goes through
// winget (same package ids as install.ps1); Linux through the distro package
// manager via pkexec (graphical password prompt), or a pinned download for D2.

type UseMiddleware = (path: string, handler: Connect.NextHandleFunction) => unknown;

export interface ToolPaths {
  /** Per-user folder for things we download/build ourselves (d2, svgbob, ...). */
  dataDir: string;
  venv: string;
  python: string;
  wireviz: string;
}

interface InstallCtx {
  log: (line: string) => void;
  sh: (command: string, args: string[], opts?: { timeoutMs?: number; cwd?: string }) => Promise<void>;
}

interface Tool {
  id: string;
  label: string;
  check: () => Promise<boolean>;
  install: (ctx: InstallCtx) => Promise<void>;
}

const IS_WIN = process.platform === 'win32';

// Which tools each CLI-backed format needs (ids of RENDERERS in
// vite-plugin-diagrams-api.ts). Formats not listed here need nothing.
const FORMAT_TOOLS: Record<string, string[]> = {
  diagrams: ['python-env', 'graphviz'],
  blockdiag: ['python-env'],
  seqdiag: ['python-env'],
  actdiag: ['python-env'],
  nwdiag: ['python-env'],
  packetdiag: ['python-env'],
  rackdiag: ['python-env'],
  wireviz: ['python-env', 'graphviz'],
  tikz: ['latex'],
  circuitikz: ['latex'],
  feynman: ['latex'],
  chemfig: ['latex'],
  skak: ['latex'],
  metapost: ['latex'],
  ditaa: ['java'],
  smc: ['java', 'graphviz'],
  d2: ['d2'],
  gnuplot: ['gnuplot'],
  lilypond: ['lilypond'],
  svgbob: ['svgbob'],
};

function exec(command: string, args: string[], timeoutMs = 8000): Promise<{ ok: boolean; missing: boolean; out: string }> {
  return new Promise((resolve) => {
    const shell = IS_WIN && /\.(cmd|bat)$/i.test(command);
    execFile(command, args, { timeout: timeoutMs, shell }, (err, stdout, stderr) => {
      const code = (err as NodeJS.ErrnoException | null)?.code;
      resolve({ ok: !err, missing: code === 'ENOENT', out: `${stdout}${stderr}` });
    });
  });
}

// A command counts as installed as long as it can be spawned; some tools
// print their version with a non-zero exit code.
async function hasCommand(command: string, versionArg: string): Promise<boolean> {
  return !(await exec(command, [versionArg])).missing;
}

// winget (and rustup) update the PATH in the registry, not in this running
// process: re-read it so a tool installed a moment ago is found right away.
async function refreshWindowsPath(binDir: string) {
  if (!IS_WIN) return;
  const { out } = await exec('powershell', [
    '-NoProfile',
    '-Command',
    "[Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')",
  ]);
  if (out.trim()) process.env.PATH = `${binDir};${out.trim()}`;
}

type PackageManager = 'apt' | 'dnf' | 'pacman';

async function detectPackageManager(): Promise<PackageManager | null> {
  for (const pm of ['apt-get', 'dnf', 'pacman'] as const) {
    if (await hasCommand(pm, '--version')) return pm === 'apt-get' ? 'apt' : pm;
  }
  return null;
}

type Packages = Partial<Record<PackageManager, string[]>> & { winget?: string };

// Installs system packages for the current platform (UAC prompt via winget on
// Windows, polkit password dialog via pkexec on Linux).
async function installSystemPackages(ctx: InstallCtx, label: string, pkgs: Packages, binDir: string) {
  if (IS_WIN) {
    if (!pkgs.winget) throw new Error(`No hay paquete de winget para ${label}`);
    if (!(await hasCommand('winget', '--version'))) {
      throw new Error('Falta winget (App Installer de Microsoft Store). Instala ' + label + ' a mano.');
    }
    ctx.log(`winget install ${pkgs.winget}`);
    await ctx
      .sh('winget', ['install', '--id', pkgs.winget, '-e', '--silent', '--accept-source-agreements', '--accept-package-agreements'], {
        timeoutMs: 30 * 60_000,
      })
      .catch((err: Error) => {
        // 0x8A15002B: already installed / no applicable upgrade — not a failure.
        if (!/-1978335189|already installed|ya está instalado/i.test(err.message)) throw err;
      });
    await refreshWindowsPath(binDir);
    return;
  }

  if (process.platform !== 'linux') throw new Error(`Instalación automática no soportada en ${process.platform}`);
  const pm = await detectPackageManager();
  const list = pm ? pkgs[pm] : undefined;
  if (!pm || !list) {
    throw new Error(
      `No sé instalar ${label} con tu gestor de paquetes. Instálalo a mano` +
        (pkgs.apt ? ` (Debian/Ubuntu: sudo apt install ${pkgs.apt.join(' ')})` : '') +
        '.',
    );
  }
  const script: Record<PackageManager, string> = {
    apt: 'apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y "$@"',
    dnf: 'dnf install -y "$@"',
    pacman: 'pacman -S --noconfirm --needed "$@"',
  };
  const asRoot = typeof process.getuid === 'function' && process.getuid() === 0;
  if (!asRoot && !(await hasCommand('pkexec', '--version'))) {
    throw new Error(`Falta pkexec para pedir permisos. Instala a mano: sudo ${pm} install ${list.join(' ')}`);
  }
  ctx.log(`${asRoot ? '' : 'pkexec '}${pm} install ${list.join(' ')}`);
  const sh = ['sh', '-c', script[pm], 'sh', ...list];
  await ctx.sh(asRoot ? sh[0] : 'pkexec', asRoot ? sh.slice(1) : sh, { timeoutMs: 60 * 60_000 });
}

// Pinned release with SHA-256 from the official SHA256SUMS of that release.
const D2_VERSION = 'v0.9.0';
const D2_ASSETS: Record<string, { file: string; sha256: string }> = {
  'linux-x64': { file: `d2-${D2_VERSION}-linux-amd64.tar.gz`, sha256: '5669ddc46b99e942cc96078f4a4e36d5e62103348f4c05179ede27802fdd87a9' },
  'linux-arm64': { file: `d2-${D2_VERSION}-linux-arm64.tar.gz`, sha256: 'ac2c028697199479acb321db1e3d68caee9f2ba492ed73caa3cd13f3829bf913' },
};

async function installD2Linux(ctx: InstallCtx, paths: ToolPaths) {
  const asset = D2_ASSETS[`${process.platform}-${process.arch}`];
  if (!asset) throw new Error(`No hay binario de D2 para ${process.platform}-${process.arch}`);
  const url = `https://github.com/terrastruct/d2/releases/download/${D2_VERSION}/${asset.file}`;
  ctx.log(`Descargando ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Descarga de D2 falló: HTTP ${res.status}`);
  const data = Buffer.from(await res.arrayBuffer());
  if (createHash('sha256').update(data).digest('hex') !== asset.sha256) {
    throw new Error('El archivo de D2 descargado no coincide con el SHA-256 esperado; no se instala.');
  }
  ctx.log('SHA-256 verificado');

  const work = await mkdtemp(join(tmpdir(), 'd2-'));
  try {
    const tarball = join(work, asset.file);
    await writeFile(tarball, data);
    await ctx.sh('tar', ['-xzf', tarball, '-C', work]);
    const binDir = join(paths.dataDir, 'tools', 'bin');
    await mkdir(binDir, { recursive: true });
    const target = join(binDir, 'd2');
    await copyFile(join(work, `d2-${D2_VERSION}`, 'bin', 'd2'), target);
    await chmod(target, 0o755);
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function buildTools(paths: ToolPaths): Tool[] {
  const binDir = join(paths.dataDir, 'tools', 'bin');
  const pipPackages = [['diagrams'], ['setuptools<81', 'blockdiag', 'seqdiag', 'actdiag', 'nwdiag'], ['wireviz']];

  return [
    {
      id: 'java',
      label: 'Java (JRE)',
      check: () => hasCommand('java', '-version'),
      install: (ctx) =>
        installSystemPackages(
          ctx,
          'Java',
          { winget: 'EclipseAdoptium.Temurin.21.JRE', apt: ['default-jre-headless'], dnf: ['java-latest-openjdk-headless'], pacman: ['jre-openjdk-headless'] },
          binDir,
        ),
    },
    {
      id: 'graphviz',
      label: 'Graphviz',
      check: () => hasCommand('dot', '-V'),
      install: (ctx) =>
        installSystemPackages(ctx, 'Graphviz', { winget: 'Graphviz.Graphviz', apt: ['graphviz'], dnf: ['graphviz'], pacman: ['graphviz'] }, binDir),
    },
    {
      id: 'gnuplot',
      label: 'Gnuplot',
      check: () => hasCommand('gnuplot', '--version'),
      install: (ctx) =>
        installSystemPackages(ctx, 'Gnuplot', { winget: 'gnuplot.gnuplot', apt: ['gnuplot-nox'], dnf: ['gnuplot'], pacman: ['gnuplot'] }, binDir),
    },
    {
      id: 'lilypond',
      label: 'LilyPond',
      check: () => hasCommand('lilypond', '--version'),
      install: (ctx) =>
        installSystemPackages(ctx, 'LilyPond', { winget: 'LilyPond.LilyPond', apt: ['lilypond'], dnf: ['lilypond'], pacman: ['lilypond'] }, binDir),
    },
    {
      id: 'latex',
      label: 'LaTeX (TikZ, MetaPost, dvisvgm)',
      check: async () => (await hasCommand('latex', '--version')) && (await hasCommand('dvisvgm', '--version')),
      install: async (ctx) => {
        await installSystemPackages(
          ctx,
          'LaTeX',
          {
            winget: 'MiKTeX.MiKTeX',
            apt: ['texlive-latex-base', 'texlive-pictures', 'texlive-latex-extra', 'texlive-science', 'texlive-games', 'texlive-metapost', 'texlive-binaries', 'dvisvgm'],
          },
          binDir,
        );
        if (!IS_WIN) return;
        // Same MiKTeX setup as install.ps1: without these, compilations hang
        // waiting for a confirmation prompt or fail with "not checked for updates".
        await ctx.sh('initexmf', ['--set-config-value=[MPM]AutoInstall=1']).catch(() => undefined);
        await ctx
          .sh('initexmf', [`--set-config-value=[MPM]LastUserUpdateCheck=${Math.floor(Date.now() / 1000)}`])
          .catch(() => undefined);
        // Warm-up compile so MiKTeX fetches standalone/xkeyval/tikz libraries now, not on first use.
        const work = await mkdtemp(join(tmpdir(), 'tikz-warmup-'));
        try {
          await writeFile(
            join(work, 'doc.tex'),
            '\\documentclass[tikz,dvisvgm,border=2pt]{standalone}\n\\usetikzlibrary{arrows.meta,positioning,shapes.geometric,calc,decorations.pathmorphing,patterns}\n\\begin{document}\\begin{tikzpicture}\\draw (0,0) -- (1,1);\\end{tikzpicture}\\end{document}\n',
          );
          ctx.log('Precalentando paquetes LaTeX (puede tardar)');
          await ctx.sh('latex', ['-interaction=nonstopmode', '-halt-on-error', 'doc.tex'], { cwd: work, timeoutMs: 20 * 60_000 }).catch(() => undefined);
        } finally {
          await rm(work, { recursive: true, force: true });
        }
      },
    },
    {
      id: 'd2',
      label: 'D2',
      check: () => hasCommand('d2', '--version'),
      install: async (ctx) => {
        if (IS_WIN) return installSystemPackages(ctx, 'D2', { winget: 'Terrastruct.D2' }, binDir);
        return installD2Linux(ctx, paths);
      },
    },
    {
      id: 'svgbob',
      label: 'Svgbob (compila con Rust, tarda varios minutos)',
      check: () => hasCommand('svgbob_cli', '--version'),
      install: async (ctx) => {
        if (!(await hasCommand('cargo', '--version'))) {
          await installSystemPackages(ctx, 'Rust (cargo)', { winget: 'Rustlang.Rustup', apt: ['cargo'], dnf: ['cargo'], pacman: ['rust'] }, binDir);
          if (IS_WIN) await ctx.sh('rustup', ['default', 'stable'], { timeoutMs: 30 * 60_000 });
        }
        ctx.log('cargo install svgbob_cli (compilando)');
        await ctx.sh('cargo', ['install', 'svgbob_cli', '--root', join(paths.dataDir, 'tools')], { timeoutMs: 60 * 60_000 });
      },
    },
    {
      id: 'python-env',
      label: 'Python + paquetes (diagrams, blockdiag, WireViz)',
      check: async () => (await exists(paths.wireviz)) && (await exec(paths.python, ['-c', 'import diagrams, blockdiag'])).ok,
      install: async (ctx) => {
        const candidates = IS_WIN ? [['py', '-3'], ['python']] : [['python3']];
        const findPython = async () => {
          for (const [cmd, ...rest] of candidates) if (await hasCommand(cmd, '--version')) return [cmd, ...rest];
          return null;
        };
        let py = await findPython();
        if (!py) {
          await installSystemPackages(
            ctx,
            'Python 3',
            { winget: 'Python.Python.3.12', apt: ['python3', 'python3-venv'], dnf: ['python3'], pacman: ['python'] },
            binDir,
          );
          py = await findPython();
        }
        if (!py) throw new Error('No se encontró Python 3 tras instalarlo; reinicia la app e inténtalo de nuevo.');

        await rm(paths.venv, { recursive: true, force: true });
        const makeVenv = () => ctx.sh(py![0], [...py!.slice(1), '-m', 'venv', paths.venv]);
        try {
          await makeVenv();
        } catch (err) {
          if (IS_WIN) throw err;
          // Debian/Ubuntu ship venv separately from python3.
          ctx.log('Falta python3-venv, instalándolo');
          await installSystemPackages(ctx, 'python3-venv', { apt: ['python3-venv'] }, binDir);
          await rm(paths.venv, { recursive: true, force: true });
          await makeVenv();
        }
        await ctx.sh(paths.python, ['-m', 'pip', 'install', '--quiet', '--upgrade', 'pip'], { timeoutMs: 10 * 60_000 });
        for (const pkgs of pipPackages) {
          ctx.log(`pip install ${pkgs.join(' ')}`);
          await ctx.sh(paths.python, ['-m', 'pip', 'install', '--quiet', ...pkgs], { timeoutMs: 20 * 60_000 });
        }
      },
    },
  ];
}

interface Job {
  ids: string[];
  state: 'running' | 'done' | 'error';
  log: string[];
  error?: string;
}

const MAX_LOG_LINES = 60;

export function mountToolsApi(use: UseMiddleware, paths: ToolPaths) {
  const tools = buildTools(paths);
  const byId = new Map(tools.map((t) => [t.id, t]));
  const binDir = join(paths.dataDir, 'tools', 'bin');
  // Tools we install ourselves (d2, svgbob) live here; spawned children see it.
  process.env.PATH = `${binDir}${delimiter}${process.env.PATH ?? ''}`;
  let job: Job | null = null;

  const sendJson = (res: import('node:http').ServerResponse, status: number, body: unknown) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
  };

  // The install endpoint triggers system package installs: only accept
  // requests that come from our own page (browsers always send Origin on
  // cross-site POSTs, so another website can't trigger it).
  const sameOrigin = (req: import('node:http').IncomingMessage) => {
    const origin = req.headers.origin;
    if (!origin) return false;
    try {
      return new URL(origin).host === req.headers.host;
    } catch {
      return false;
    }
  };

  async function runJob(current: Job) {
    const log = (line: string) => {
      current.log.push(line);
      if (current.log.length > MAX_LOG_LINES) current.log.splice(0, current.log.length - MAX_LOG_LINES);
    };
    const ctx: InstallCtx = {
      log,
      sh: (command, args, opts = {}) =>
        new Promise<void>((resolve, reject) => {
          const shell = IS_WIN && /\.(cmd|bat)$/i.test(command);
          const child = spawn(command, args, { cwd: opts.cwd, shell, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
          const timer = setTimeout(() => child.kill(), opts.timeoutMs ?? 10 * 60_000);
          let tail = '';
          const onData = (chunk: Buffer) => {
            const text = chunk.toString('utf-8');
            tail = (tail + text).slice(-2000);
            for (const line of text.split(/\r?\n/)) if (line.trim()) log(line.trim().slice(0, 300));
          };
          child.stdout.on('data', onData);
          child.stderr.on('data', onData);
          child.on('error', (err) => {
            clearTimeout(timer);
            reject(err);
          });
          child.on('close', (code) => {
            clearTimeout(timer);
            if (code === 0) resolve();
            else reject(new Error(`${command} terminó con código ${code}\n${tail.trim().split('\n').slice(-4).join('\n')}`));
          });
        }),
    };

    try {
      for (const id of current.ids) {
        const tool = byId.get(id)!;
        log(`== ${tool.label}`);
        await tool.install(ctx);
        if (!(await tool.check())) throw new Error(`${tool.label}: se instaló pero no se detecta todavía. Reinicia la app.`);
      }
      current.state = 'done';
    } catch (err) {
      current.state = 'error';
      current.error = err instanceof Error ? err.message : String(err);
    }
  }

  use('/api/tools/status', (async (_req, res) => {
    const installed = await Promise.all(tools.map((t) => t.check()));
    sendJson(res, 200, {
      tools: tools.map((t, i) => ({ id: t.id, label: t.label, installed: installed[i] })),
      formats: FORMAT_TOOLS,
      job,
    });
  }) as Connect.NextHandleFunction);

  use('/api/tools/install', (async (req, res) => {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' });
    if (!sameOrigin(req)) return sendJson(res, 403, { error: 'Forbidden' });
    if (job?.state === 'running') return sendJson(res, 409, { error: 'Ya hay una instalación en curso' });

    let ids: unknown;
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      ids = JSON.parse(Buffer.concat(chunks).toString('utf-8')).ids;
    } catch {
      return sendJson(res, 400, { error: 'JSON inválido' });
    }
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === 'string' && byId.has(id))) {
      return sendJson(res, 400, { error: 'Herramientas desconocidas' });
    }

    job = { ids: ids as string[], state: 'running', log: [] };
    void runJob(job);
    sendJson(res, 202, { started: true });
  }) as Connect.NextHandleFunction);
}
