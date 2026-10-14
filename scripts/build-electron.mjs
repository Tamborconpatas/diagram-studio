// Bundles the Electron main process (and the dbml-renderer CLI, which has no
// node_modules/.bin shim inside the packaged app) into electron/.
import { build } from 'esbuild';

await build({
  entryPoints: ['electron/main.ts'],
  outfile: 'electron/main.mjs',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  external: ['electron'],
  logLevel: 'info',
});

await build({
  entryPoints: ['node_modules/@softwaretechnik/dbml-renderer/lib/index.js'],
  outfile: 'electron/dbml.cjs',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  logLevel: 'info',
});
