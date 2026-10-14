import { app, BrowserWindow, Menu, shell } from 'electron';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFileSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';

// Desktop shell: serves the built app (dist/) plus the same /api/render-*
// endpoints the Vite dev server exposes, on a random 127.0.0.1 port, and
// shows it in a window. Run via `npm run electron:dev` or the installers.

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

type Middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => unknown;

async function startServer(): Promise<number> {
  const appPath = app.getAppPath();
  // electron-builder unpacks the files listed in `asarUnpack` (jars, python
  // runners) next to app.asar, since java/python can't read inside it.
  process.env.DIAGRAM_STUDIO_ROOT = app.isPackaged ? `${appPath}.unpacked` : appPath;
  process.env.DIAGRAM_STUDIO_VENV = join(app.getPath('userData'), 'venv');
  process.env.DIAGRAM_STUDIO_DATA = app.getPath('userData');
  // No node_modules/.bin shims when packaged: run bundled CLIs with Electron
  // itself acting as Node.
  process.env.DIAGRAM_STUDIO_NODE = process.execPath;

  // Imported after the env above: the backend reads it at module load.
  const { mountDiagramsApi } = await import('../vite-plugin-diagrams-api.ts');

  const routes: { path: string; handler: Middleware }[] = [];
  mountDiagramsApi((path, handler) => routes.push({ path, handler: handler as Middleware }));

  const distDir = join(appPath, 'dist');
  let origin = '';

  const server = createServer(async (req, res) => {
    // Another website in the user's browser could otherwise POST code to
    // this local server (it runs Python/LaTeX/...): only accept requests
    // addressed to our own origin (also blocks DNS rebinding).
    if (req.headers.host !== new URL(origin).host || (req.headers.origin && req.headers.origin !== origin)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }

    const url = req.url ?? '/';
    const route = routes.find((r) => url === r.path || url.startsWith(`${r.path}/`) || url.startsWith(`${r.path}?`));
    if (route) {
      req.url = url.slice(route.path.length) || '/';
      route.handler(req, res, () => undefined);
      return;
    }

    try {
      let rel = decodeURIComponent(new URL(url, origin).pathname);
      if (rel.endsWith('/')) rel += 'index.html';
      const file = normalize(join(distDir, rel));
      if (file !== distDir && !file.startsWith(distDir + sep)) throw new Error('outside dist');
      let target = file;
      if ((await stat(file)).isDirectory()) target = join(file, 'index.html');
      const data = await readFile(target);
      res.setHeader('Content-Type', MIME[extname(target).toLowerCase()] ?? 'application/octet-stream');
      res.end(data);
    } catch {
      res.statusCode = 404;
      res.end('Not found');
    }
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as import('node:net').AddressInfo;
  origin = `http://127.0.0.1:${port}`;
  return port;
}

async function createWindow() {
  const port = await startServer();
  const origin = `http://127.0.0.1:${port}`;

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'Diagram Studio',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true },
  });

  // Links to other sites open in the system browser, not inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(origin)) return { action: 'allow' };
    void shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(origin)) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });

  await win.loadURL(origin);
}

// An AppImage can't carry the SUID chrome-sandbox helper, so Chromium's
// sandbox relies on unprivileged user namespaces. Ubuntu 24.04+ restricts
// those through AppArmor and the app would abort at startup; only in that
// case fall back to --no-sandbox (this window only loads our own local pages).
function userNamespacesBlocked(): boolean {
  const blockedWhen: [string, string][] = [
    ['/proc/sys/kernel/apparmor_restrict_unprivileged_userns', '1'],
    ['/proc/sys/kernel/unprivileged_userns_clone', '0'],
    ['/proc/sys/user/max_user_namespaces', '0'],
  ];
  return blockedWhen.some(([file, value]) => {
    try {
      return readFileSync(file, 'utf-8').trim() === value;
    } catch {
      return false;
    }
  });
}

if (process.platform === 'linux' && process.env.APPIMAGE && userNamespacesBlocked()) {
  app.commandLine.appendSwitch('no-sandbox');
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  Menu.setApplicationMenu(null);
  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
  app.whenReady().then(createWindow);
  app.on('window-all-closed', () => app.quit());
}
