#!/usr/bin/env node
// Renders every bundled example of every CLI-backed format (src/cliBackedFormats.ts)
// through the real running dev server and checks it actually produces an SVG.
// `npm run check` only checks static wiring (labels/renderer registration exist) —
// this one catches content bugs in the examples themselves (bad LaTeX, wrong package
// API, etc.) that only show up by actually rendering.
//
// Needs `npm run dev` running first (it POSTs to /api/render-<id> on :5173).
// Run: npm run check-examples
import ts from 'typescript';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEV_SERVER = 'http://localhost:5173';

async function loadFormats() {
  const source = readFileSync(join(root, 'src/cliBackedFormats.ts'), 'utf-8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  // Icons and i18n types aren't needed here — stub them out rather than
  // dragging React/lucide-react into a plain Node script.
  const patched = outputText
    .replace(/require\("lucide-react"\)/g, '({})')
    .replace(/require\("\.\/i18n\/types"\)/g, '({})');
  const tmpFile = join(root, 'scripts', '.check-examples-compiled.cjs');
  writeFileSync(tmpFile, patched);
  try {
    const mod = await import(`file://${tmpFile}?t=${Date.now()}`);
    return mod.CLI_BACKED_FORMATS;
  } finally {
    unlinkSync(tmpFile);
  }
}

async function main() {
  try {
    await fetch(DEV_SERVER, { signal: AbortSignal.timeout(2000) });
  } catch {
    console.error(`Can't reach ${DEV_SERVER} — run \`npm run dev\` in another terminal first.`);
    process.exit(1);
  }

  const formats = await loadFormats();
  let total = 0;
  let fails = 0;
  const failures = [];

  for (const format of formats) {
    const seen = new Set();
    for (const lang of ['es', 'en']) {
      for (const [key, code] of Object.entries(format.examples[lang])) {
        const dedupeKey = `${key}:${code}`;
        if (seen.has(dedupeKey)) continue; // es/en share identical content for most formats
        seen.add(dedupeKey);
        total++;
        const res = await fetch(`${DEV_SERVER}/api/render-${format.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (data.svg) {
          console.log(`${format.id}.${key} OK`);
        } else {
          fails++;
          failures.push({ id: format.id, key, error: data.error });
          console.log(`${format.id}.${key} FAIL`);
        }
      }
    }
  }

  console.log(`\n${total - fails}/${total} examples OK`);
  for (const f of failures) {
    console.log(`\n=== ${f.id}.${f.key} ===`);
    console.log(f.error?.slice(-500));
  }
  process.exit(fails === 0 ? 0 : 1);
}

main();
