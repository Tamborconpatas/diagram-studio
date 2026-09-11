#!/usr/bin/env node
// Wiring consistency check for the diagram-format adapter pattern:
// 1. every tool registered in DiagramApp.tsx has an i18n label in both
//    languages (Translations.tools is a loose Record<string, ...>, so `tsc`
//    doesn't catch a missing entry — it silently falls back to the raw id).
// 2. every CLI-backed editor's apiPath has a matching renderer registered
//    in vite-plugin-diagrams-api.ts.
// Run: node scripts/check-wiring.mjs
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf-8');

const diagramApp = read('src/DiagramApp.tsx');
const toolIds = [...diagramApp.matchAll(/{ id: '([a-z0-9]+)',/g)].map((m) => m[1]);
assert.ok(toolIds.length > 15, `expected 15+ tools in DiagramApp.tsx's TOOLS array, found ${toolIds.length} — regex may be stale`);

const translations = read('src/i18n/translations.ts');
const langBlocks = { es: translations.split('\n  es: {')[1].split('\n  en: {')[0], en: translations.split('\n  en: {')[1] };
for (const [lang, block] of Object.entries(langBlocks)) {
  const toolsBlock = block.match(/tools: \{([\s\S]*?)\n {4}\},/)?.[1];
  assert.ok(toolsBlock, `couldn't find tools: {...} block in translations.ts[${lang}]`);
  for (const id of toolIds) {
    assert.match(toolsBlock, new RegExp(`\\b${id}: \\{`), `missing tools.${id} in i18n[${lang}] (src/i18n/translations.ts)`);
  }
}

const editorsDir = join(root, 'src/editors');
const apiPaths = [];
for (const file of readdirSync(editorsDir)) {
  if (!file.endsWith('.tsx')) continue;
  const src = readFileSync(join(editorsDir, file), 'utf-8');
  const m = src.match(/apiPath="([a-z0-9]+)"/);
  if (m) apiPaths.push(m[1]);
}
assert.ok(apiPaths.length >= 10, `expected 10+ CLI-backed editors (using CliBackedEditor's apiPath), found ${apiPaths.length}`);

const backend = read('vite-plugin-diagrams-api.ts');
for (const id of apiPaths) {
  assert.match(backend, new RegExp(`\\b${id}\\b`), `no RENDERERS entry for apiPath "${id}" (check vite-plugin-diagrams-api.ts)`);
}

console.log(`OK — ${toolIds.length} tools have i18n labels in es+en, ${apiPaths.length} CLI-backed editors have matching renderers.`);
