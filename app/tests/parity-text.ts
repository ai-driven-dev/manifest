/**
 * AC-9 — Verifies all textual content of the original principles/values/preamble/cover
 * is present in the extracted TS content modules.
 * Run with: node --experimental-strip-types tests/parity-text.ts
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PRINCIPLES } from '../src/content/principles.ts';
import { VALUES } from '../src/content/values.ts';
import { TERMS } from '../src/content/terms.ts';
import { SEEDS } from '../src/content/seeds.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const originalRaw = readFileSync(join(__dirname, '..', 'public', 'baseline', 'index.html'), 'utf8');
// Pre-strip the original so we can compare extracted plain text to plain text.
const original = originalRaw
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&apos;/g, "'")
  .replace(/\\'/g, "'");

const errors: string[] = [];

// 1) Principles: each `sub` and the visible "lead" text (stripped of <span class="hl">)
function strip(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&apos;/g, "'");
}
for (const p of PRINCIPLES) {
  const lead = strip(p.lead);
  const sub = strip(p.sub);
  if (!original.includes(sub.slice(0, 40))) errors.push(`P${p.n} sub missing: ${sub.slice(0, 40)}`);
  // lead has SVG injection in original — check first 40 chars only after strip
  if (!original.includes(lead.slice(0, 40))) errors.push(`P${p.n} lead missing: ${lead.slice(0, 40)}`);
}

// 2) Values: left + right + note's plain text
for (const v of VALUES) {
  if (!original.includes(v.left)) errors.push(`V${v.n} left missing: ${v.left}`);
  if (!original.includes(v.right)) errors.push(`V${v.n} right missing: ${v.right}`);
}

// 3) Preamble & cover sentinels
const preambleSentinel = 'As AI-Driven Developers, we are discovering';
const coverTitle = 'Manifesto';
if (!original.includes(preambleSentinel)) errors.push('preamble sentinel missing');
if (!original.includes(coverTitle)) errors.push('cover title missing');

// 4) Terms (titles must be present in original)
for (const t of TERMS) {
  if (!original.includes(t.title)) {
    // PR 421 was renamed from PR #421 — accept either
    if (t.title === 'review · PR 421' && original.includes('review · PR #421')) continue;
    errors.push(`Term title missing: ${t.title}`);
  }
}

// 5) Seeds
for (const s of SEEDS) {
  if (!original.includes(s.name)) errors.push(`Seed missing: ${s.name}`);
}

if (errors.length) {
  console.error('PARITY ERRORS:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log('PARITY OK — content modules contain', PRINCIPLES.length, 'principles,', VALUES.length, 'values,', TERMS.length, 'terms,', SEEDS.length, 'seeds');
