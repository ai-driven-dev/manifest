import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const workflowPath = fileURLToPath(
  new URL('../../../.github/workflows/deploy.yml', import.meta.url),
);
const workflow = readFileSync(workflowPath, 'utf8');

describe('deployment workflow', () => {
  it('retries every public endpoint without producing an ambiguous HTTP code', () => {
    expect(workflow).toContain('check_public_endpoint()');
    expect(workflow).toContain('for attempt in $(seq 1 5)');
    expect(workflow).not.toContain('|| echo "000"');

    for (const endpoint of [
      '/healthz',
      '/',
      '/robots.txt',
      '/sitemap.xml',
      '/feed.xml',
      '/.well-known/security.txt',
      '/.well-known/agent-card.json',
      '/${INDEXNOW_KEY}.txt',
    ]) {
      expect(workflow).toContain(`check_public_endpoint "${endpoint}"`);
    }

    expect(workflow).toMatch(
      /check_public_endpoint "\/\$\{INDEXNOW_KEY\}\.txt"\n\n {10}echo "=== IndexNow submission ==="/,
    );
  });
});
