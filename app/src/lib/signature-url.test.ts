import { describe, expect, it } from 'vitest';
import { SIGNATURE_ISSUE_URL } from './signature-url';

describe('signature contribution URL', () => {
  it('opens the GitHub signature issue form instead of the fork-backed file editor', () => {
    const url = new URL(SIGNATURE_ISSUE_URL);

    expect(url.origin).toBe('https://github.com');
    expect(url.pathname).toBe('/ai-driven-dev/manifest/issues/new');
    expect(url.searchParams.get('template')).toBe('signature.yml');
    expect(url.pathname).not.toContain('/new/main/');
    expect(url.pathname).not.toContain('/fork');
    expect(url.searchParams.has('filename')).toBe(false);
  });
});
