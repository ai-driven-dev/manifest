#!/usr/bin/env node
// Derive each signatory's signature date from git — the committer date of the
// commit that ADDED their YAML file. This is the non-falsifiable source of
// truth: a contributor cannot backdate a signature by editing a YAML field,
// because the date comes from the commit that lands on `main`.
//
// Output: app/src/content/signature-dates.json  { "<github-handle>": "YYYY-MM-DD" }
// keyed by the `github` handle (NOT the filename — they can differ).
//
// Runs wherever `.git` is available (local dev via predev/prebuild, and in CI).
// Inside the Docker build `.git` is excluded, so the generator reuses the JSON
// already materialized in the build context (the CI step generates it first).

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REL_DIR = 'src/content/signatories';
const SIG_DIR = join(APP_DIR, REL_DIR);
const OUT = join(SIG_DIR, '..', 'signature-dates.json');

function gitAvailable() {
  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: APP_DIR,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

function handleOf(file) {
  const text = readFileSync(join(SIG_DIR, file), 'utf8');
  const match = text.match(/^github:\s*(\S+)/m);
  if (!match) throw new Error(`No \`github\` handle found in ${file}`);
  return match[1];
}

// Committer date (%cI) of the commit that first added the file. With several
// `A` commits (e.g. file removed then re-added) we keep the oldest = last line.
function addedDate(file) {
  const out = execFileSync(
    'git',
    ['log', '--follow', '--diff-filter=A', '--format=%cI', '--', join(REL_DIR, file)],
    { cwd: APP_DIR, encoding: 'utf8' }
  ).trim();
  const lines = out.split('\n').filter(Boolean);
  const oldest = lines.at(-1);
  return oldest ? oldest.slice(0, 10) : null;
}

const files = readdirSync(SIG_DIR)
  .filter((f) => f.endsWith('.yml'))
  .sort();

if (!gitAvailable()) {
  if (existsSync(OUT)) {
    console.log('[sig-dates] git unavailable — reusing existing signature-dates.json');
    process.exit(0);
  }
  console.error(
    '[sig-dates] git unavailable AND no existing signature-dates.json — cannot derive dates'
  );
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const dates = {};

for (const file of files) {
  const handle = handleOf(file);
  let date = addedDate(file);
  if (!date) {
    // File staged but not yet committed (local dev only). On `main` every file
    // is committed, so this branch never runs in CI.
    date = today;
    console.warn(`[sig-dates] ${file} not committed yet — using today (${today})`);
  }
  dates[handle] = date;
}

writeFileSync(OUT, `${JSON.stringify(dates, null, 2)}\n`);
console.log(`[sig-dates] wrote ${Object.keys(dates).length} signature dates → ${OUT}`);
