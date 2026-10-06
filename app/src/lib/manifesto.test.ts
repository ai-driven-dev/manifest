import { describe, expect, it } from 'vitest';
import { getHomeJsonLd, getManifestoJson, getManifestoMarkdown } from './manifesto';
import { SITE } from './site';

describe('manifesto data helpers', () => {
  it('shares the definition-led summary across manifesto metadata', () => {
    expect(SITE.description).toBe(
      'AI-driven development (AIDD) means building software with AI as a deliberate partner. Explore the manifesto’s four values and twelve principles.'
    );
    expect(getManifestoJson().description).toBe(SITE.description);
    expect(getManifestoMarkdown()).toContain(SITE.description);
    for (const entity of getHomeJsonLd().slice(0, 3)) {
      expect(entity.description).toBe(SITE.description);
    }
  });

  it('exports the canonical values and principles as structured data', () => {
    const data = getManifestoJson();

    expect(data.url).toBe('https://www.ai-driven-development.org/');
    expect(data.version).toBe('1.1.1');
    expect(data.values).toHaveLength(4);
    expect(data.principles).toHaveLength(12);
    expect(data.relatedPractices).toEqual([
      'AI-assisted development',
      'AI pair programming',
      'agentic coding',
      'spec-driven development',
      'context engineering',
    ]);
    expect(data.values[0]).toMatchObject({
      id: 'V-1',
      preferred: 'Method',
      weighedAgainst: 'Model',
    });
    expect(data.values[3]).toMatchObject({
      preferred: 'Outcome',
      weighedAgainst: 'Output',
      quadrant: 'Outcome',
    });
  });

  it('exports raw Markdown source for agents and alternate routes', () => {
    const markdown = getManifestoMarkdown();

    expect(markdown).toContain('# The Manifesto for AI-Driven Development');
    expect(markdown).toContain('Version 1.1.1');
    expect(markdown).toContain('## Preamble');
    expect(markdown).toContain('Related practices: AI-assisted development');
    expect(markdown).not.toContain('Also known as:');
    expect(markdown).not.toContain('prompt-driven development');
    expect(markdown).toContain('## Value 1: Method over Model');
    expect(markdown).toContain('## Principle 12');
    expect(markdown).toContain('Canonical URL: https://www.ai-driven-development.org/');
  });
});
