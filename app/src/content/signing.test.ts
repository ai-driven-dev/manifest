import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SIGNING } from './signing';
import { getManifestoJson, getManifestoMarkdown } from '~/lib/manifesto';
import { SITE } from '~/lib/site';

describe('public signing instructions', () => {
  it('points to the signature Issue Form that exists in the repository', () => {
    const url = new URL(SIGNING.url);
    expect(`${url.origin}${url.pathname}`).toBe(`${SITE.repoUrl}/issues/new`);
    const template = url.searchParams.get('template');
    expect(template).toBe('signature.yml');
    const form = readFileSync(new URL(`../../../.github/ISSUE_TEMPLATE/${template}`, import.meta.url), 'utf8');
    expect(form).toContain('signature-request');
  });

  it('keeps the request and publication steps consistent in alternate formats', () => {
    const markdown = getManifestoMarkdown();
    expect(getManifestoJson().signing).toEqual(SIGNING);
    expect(markdown).toContain(SIGNING.description);
    expect(markdown).toContain(SIGNING.url);
    for (const step of SIGNING.steps) expect(markdown).toContain(step);
    expect(markdown).not.toContain('One YAML file, one pull request, no backend.');
  });
});
