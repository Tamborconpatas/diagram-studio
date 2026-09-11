#!/usr/bin/env node
// Wiring consistency check for the diagram-format adapter pattern:
// 1. every tool (CUSTOM_TOOLS in DiagramApp.tsx + CLI_BACKED_FORMATS in
//    cliBackedFormats.ts) has an i18n label in both languages
//    (Translations.tools is a loose Record<string, ...>, so `tsc` doesn't
//    catch a missing entry — it silently falls back to the raw id).
// 2. every CLI_BACKED_FORMATS id has a matching renderer registered in
//    vite-plugin-diagrams-api.ts, and a matching Translations.cliFormats
//    entry (its examples menu labels).
// Run: node scripts/check-wiring.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf-8');
const ids = (src, re) => [...src.matchAll(re)].map((m) => m[1]);

const diagramApp = read('src/DiagramApp.tsx');
const customToolIds = ids(diagramApp, /{ id: '([a-z0-9]+)',/g);
assert.ok(customToolIds.length > 5, `expected several CUSTOM_TOOLS in DiagramApp.tsx, found ${customToolIds.length} — regex may be stale`);

const cliFormats = read('src/cliBackedFormats.ts');
const cliFormatIds = ids(cliFormats, /^\s*id: '([a-z0-9]+)',/gm);
assert.ok(cliFormatIds.length >= 10, `expected 10+ CLI_BACKED_FORMATS in cliBackedFormats.ts, found ${cliFormatIds.length}`);

const allToolIds = [...customToolIds, ...cliFormatIds];

const translations = read('src/i18n/translations.ts');
const langBlocks = { es: translations.split('\n  es: {')[1].split('\n  en: {')[0], en: translations.split('\n  en: {')[1] };
for (const [lang, block] of Object.entries(langBlocks)) {
  const toolsBlock = block.match(/tools: \{([\s\S]*?)\n {4}\},/)?.[1];
  assert.ok(toolsBlock, `couldn't find tools: {...} block in translations.ts[${lang}]`);
  for (const id of allToolIds) {
    assert.match(toolsBlock, new RegExp(`\\b${id}: \\{`), `missing tools.${id} in i18n[${lang}] (src/i18n/translations.ts)`);
  }

  const cliFormatsBlock = block.match(/cliFormats: \{([\s\S]*?)\n {4}\},/)?.[1];
  assert.ok(cliFormatsBlock, `couldn't find cliFormats: {...} block in translations.ts[${lang}]`);
  for (const id of cliFormatIds) {
    assert.match(cliFormatsBlock, new RegExp(`\\b${id}: \\{`), `missing cliFormats.${id} in i18n[${lang}] (src/i18n/translations.ts)`);
  }
}

const backend = read('vite-plugin-diagrams-api.ts');
for (const id of cliFormatIds) {
  assert.match(backend, new RegExp(`\\b${id}\\b`), `no RENDERERS entry for "${id}" (check vite-plugin-diagrams-api.ts)`);
}

console.log(
  `OK — ${allToolIds.length} tools (${customToolIds.length} custom + ${cliFormatIds.length} CLI-backed) have i18n labels in es+en, ` +
    `and all ${cliFormatIds.length} CLI-backed formats have matching renderers + cliFormats labels.`,
);
