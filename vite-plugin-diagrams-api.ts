import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Plugin } from 'vite';

const PYTHON = join(import.meta.dirname, '.venv-diagrams', 'bin', 'python3');
const RUNNER = join(import.meta.dirname, 'scripts', 'diagrams-runner.py');
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

export function diagramsApiPlugin(): Plugin {
  return {
    name: 'diagrams-python-api',
    configureServer(server) {
      server.middlewares.use('/api/render-diagrams', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let dir: string | null = null;
        try {
          const { code } = JSON.parse(await readBody(req));
          if (typeof code !== 'string' || !code.trim()) throw new Error('Falta el código Python');

          dir = await mkdtemp(join(tmpdir(), 'diagrams-'));
          const scriptPath = join(dir, 'user_script.py');
          await writeFile(scriptPath, code, 'utf-8');

          await new Promise<void>((resolve, reject) => {
            execFile(PYTHON, [RUNNER, scriptPath], { cwd: dir!, timeout: 15_000 }, (err, _stdout, stderr) => {
              if (err) reject(new Error(stderr || err.message));
              else resolve();
            });
          });

          const svg = await readFile(join(dir, 'output.svg'), 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ svg }));
        } catch (err) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
        } finally {
          if (dir) await rm(dir, { recursive: true, force: true });
        }
      });
    },
  };
}
