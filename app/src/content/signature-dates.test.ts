import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const APP_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SIG_DIR = join(APP_DIR, 'src/content/signatories');
const JSON_PATH = join(APP_DIR, 'src/content/signature-dates.json');

function handles(): string[] {
  return readdirSync(SIG_DIR)
    .filter((f) => f.endsWith('.yml'))
    .map((f) => readFileSync(join(SIG_DIR, f), 'utf8').match(/^github:\s*(\S+)/m)?.[1])
    .filter((h): h is string => Boolean(h));
}

describe('signature-dates generator', () => {
  it('derives a valid YYYY-MM-DD for every signatory, keyed by github handle', () => {
    execFileSync('node', ['scripts/gen-signature-dates.mjs'], { cwd: APP_DIR });
    const dates: Record<string, string> = JSON.parse(readFileSync(JSON_PATH, 'utf8'));

    const expected = handles();
    for (const handle of expected) {
      expect(dates[handle], `missing date for ${handle}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    // One entry per signatory file, no orphans.
    expect(Object.keys(dates).sort()).toEqual([...expected].sort());
  });
});
