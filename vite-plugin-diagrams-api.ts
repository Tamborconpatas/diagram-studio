import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Connect, Plugin, ViteDevServer } from 'vite';

const PYTHON = join(
  import.meta.dirname,
  '.venv-diagrams',
  process.platform === 'win32' ? 'Scripts' : 'bin',
  process.platform === 'win32' ? 'python.exe' : 'python3',
);
const RUNNER = join(import.meta.dirname, 'scripts', 'diagrams-runner.py');
const BLOCKDIAG_RUNNER = join(import.meta.dirname, 'scripts', 'blockdiag-runner.py');
const DBML_RENDERER = join(
  import.meta.dirname,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'dbml-renderer.cmd' : 'dbml-renderer',
);
const SMC_JAR = join(import.meta.dirname, 'tools', 'Smc.jar');
const MAX_BODY_BYTES = 200_000;

async function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error('Código demasiado largo');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

const MIME_BY_EXT: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml' };

// graphviz's SVG output references node icons (aws/gcp/azure PNGs) by absolute
// filesystem path; the browser can't load those, so inline them as data URIs.
async function inlineLocalImages(svg: string): Promise<string> {
  const hrefRe = /xlink:href="(\/[^"]+\.(?:png|jpe?g|svg))"/g;
  let result = svg;
  for (const [full, path] of svg.matchAll(hrefRe)) {
    try {
      const data = await readFile(path);
      const mime = MIME_BY_EXT[path.split('.').pop()!.toLowerCase()] ?? 'application/octet-stream';
      result = result.replace(full, `xlink:href="data:${mime};base64,${data.toString('base64')}"`);
    } catch {
      // leave the original href if the file can't be read
    }
  }
  return result;
}

function run(command: string, args: string[], cwd: string, timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    // .cmd/.bat shims (e.g. node_modules/.bin on Windows) aren't real PE
    // executables; execFile needs shell:true to run them there (EINVAL/ENOENT
    // otherwise), unlike Unix where the file itself is directly executable.
    const shell = process.platform === 'win32' && /\.(cmd|bat)$/i.test(command);
    execFile(command, args, { cwd, timeout, shell }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || stdout || err.message));
      else resolve();
    });
  });
}

type Handler = (code: string, dir: string) => Promise<string>;

function jsonEndpoint(server: ViteDevServer, path: string, tmpPrefix: string, handler: Handler) {
  server.middlewares.use(path, (async (req: Connect.IncomingMessage, res) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end('Method Not Allowed');
      return;
    }

    let dir: string | null = null;
    try {
      const { code } = JSON.parse(await readBody(req));
      if (typeof code !== 'string' || !code.trim()) throw new Error('Falta el código');

      dir = await mkdtemp(join(tmpdir(), tmpPrefix));
      const svg = await handler(code, dir);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ svg }));
    } catch (err) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
    } finally {
      if (dir) await rm(dir, { recursive: true, force: true });
    }
  }) as Connect.NextHandleFunction);
}

async function renderDiagrams(code: string, dir: string): Promise<string> {
  const scriptPath = join(dir, 'user_script.py');
  await writeFile(scriptPath, code, 'utf-8');
  await run(PYTHON, [RUNNER, scriptPath], dir, 15_000);
  const rawSvg = await readFile(join(dir, 'output.svg'), 'utf-8');
  return inlineLocalImages(rawSvg);
}

const TIKZ_LIBRARIES = 'arrows.meta,positioning,shapes.geometric,calc,decorations.pathmorphing,patterns';

async function renderTikz(code: string, dir: string): Promise<string> {
  const doc = code.includes('\\documentclass')
    ? code
    : `\\documentclass[tikz,dvisvgm,border=2pt]{standalone}\n\\usetikzlibrary{${TIKZ_LIBRARIES}}\n\\begin{document}\n${code}\n\\end{document}`;
  await writeFile(join(dir, 'doc.tex'), doc, 'utf-8');
  await run('latex', ['-interaction=nonstopmode', '-halt-on-error', 'doc.tex'], dir, 20_000);
  await run('dvisvgm', ['doc.dvi', '-o', 'doc.svg'], dir, 20_000);
  return readFile(join(dir, 'doc.svg'), 'utf-8');
}

// ditaa only ever produces a raster PNG (no real SVG output), so wrap it in a
// minimal SVG <image> to reuse the app's existing SVG-based render/export path.
function pngDimensions(png: Buffer): { width: number; height: number } {
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

async function renderDitaa(code: string, dir: string): Promise<string> {
  await writeFile(join(dir, 'input.ditaa'), code, 'utf-8');
  await run('ditaa', ['input.ditaa', 'output.png', '-o'], dir, 15_000);
  const png = await readFile(join(dir, 'output.png'));
  const { width, height } = pngDimensions(png);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image width="${width}" height="${height}" xlink:href="data:image/png;base64,${png.toString('base64')}"/></svg>`;
}

// Most CLI-backed renderers are: write the code to one input file, run one or
// more commands against it, read back output.svg. `runner` builds a Handler
// from that shape so adding a new single/multi-step CLI renderer (e.g. the
// blockdiag family, or D2) is one map entry below instead of a new function.
type CmdStep = { command: string; args: string[]; timeout: number };

function runner(inputFile: string, outputFile: string, steps: CmdStep[]): Handler {
  return async (code, dir) => {
    await writeFile(join(dir, inputFile), code, 'utf-8');
    for (const step of steps) await run(step.command, step.args, dir, step.timeout);
    return readFile(join(dir, outputFile), 'utf-8');
  };
}

const RENDERERS: Record<string, Handler> = {
  diagrams: renderDiagrams,
  tikz: renderTikz,
  ditaa: renderDitaa,
  dbml: runner('input.dbml', 'output.svg', [
    { command: DBML_RENDERER, args: ['-i', 'input.dbml', '-o', 'output.svg'], timeout: 15_000 },
  ]),
  ...Object.fromEntries(
    (['blockdiag', 'seqdiag', 'actdiag', 'nwdiag', 'packetdiag', 'rackdiag'] as const).map((family) => [
      family,
      runner('input.diag', 'output.svg', [
        { command: PYTHON, args: [BLOCKDIAG_RUNNER, family, '-Tsvg', 'input.diag', '-o', 'output.svg'], timeout: 15_000 },
      ]),
    ]),
  ),
  smc: runner('input.sm', 'output.svg', [
    { command: 'java', args: ['-jar', SMC_JAR, '-graph', '-glevel', '1', 'input.sm'], timeout: 15_000 },
    { command: 'dot', args: ['-Tsvg', 'input_sm.dot', '-o', 'output.svg'], timeout: 10_000 },
  ]),
};

export function diagramsApiPlugin(): Plugin {
  return {
    name: 'diagrams-python-api',
    configureServer(server) {
      for (const [id, handler] of Object.entries(RENDERERS)) {
        jsonEndpoint(server, `/api/render-${id}`, `${id}-`, handler);
      }
    },
  };
}
