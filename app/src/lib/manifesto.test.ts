import { describe, expect, it } from 'vitest';
import { getManifestoJson, getManifestoMarkdown } from './manifesto';

describe('manifesto data helpers', () => {
  it('exports the canonical values and principles as structured data', () => {
    const data = getManifestoJson();

    expect(data.url).toBe('https://www.ai-driven-development.org/');
    expect(data.version).toBe('1.1.1');
    expect(data.values).toHaveLength(4);
    expect(data.principles).toHaveLength(12);
    expect(data.values[0]).toMatchObject({
      id: 'V-1',
      preferred: 'Method',
      weighedAgainst: 'Model',
    });
  });

  it('exports raw Markdown source for agents and alternate routes', () => {
    const markdown = getManifestoMarkdown();

    expect(markdown).toContain('# The Manifesto for AI-Driven Development');
    expect(markdown).toContain('Version 1.1.1');
    expect(markdown).toContain('## Value 1: Method over Model');
    expect(markdown).toContain('## Principle 12');
    expect(markdown).toContain('Canonical URL: https://www.ai-driven-development.org/');
  });
});
