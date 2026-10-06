import { describe, expect, it } from 'vitest';
import { FRAMEWORK } from './framework';
import { getManifestoJson, getManifestoMarkdown } from '~/lib/manifesto';

describe('framework onboarding content', () => {
  it('keeps the practical guide consistent in machine-readable alternatives', () => {
    const markdown = getManifestoMarkdown();
    expect(getManifestoJson().framework).toEqual(FRAMEWORK);
    expect(markdown).toContain(FRAMEWORK.title);
    expect(markdown).toContain(FRAMEWORK.description);
    expect(markdown).toContain(FRAMEWORK.compatibility);
    expect(markdown).toContain(FRAMEWORK.safety);
    for (const step of FRAMEWORK.steps) {
      expect(markdown).toContain(step.title);
      expect(markdown).toContain(step.description);
      expect(markdown).toContain(step.link.url);
      if (step.command) expect(markdown).toContain(step.command);
    }
  });

  it('links setup and first-use instructions to the official framework', () => {
    for (const step of FRAMEWORK.steps) {
      const url = new URL(step.link.url);
      expect(url.protocol).toBe('https:');
      expect(url.hostname).toBe('github.com');
      expect(url.pathname).toMatch(/^\/ai-driven-dev\/framework(?:\/|$)/);
    }
    expect(FRAMEWORK.steps.find((step) => step.command?.includes('00-onboard'))).toBeDefined();
    expect(FRAMEWORK.steps.find((step) => step.command?.includes('01-sdlc'))).toBeDefined();
  });
});
