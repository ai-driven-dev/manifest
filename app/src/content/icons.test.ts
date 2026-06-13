import { describe, expect, it } from 'vitest';
import { ICONS, type IconKey } from './icons';
import { VALUES } from './values';
import { PRINCIPLES } from './principles';

describe('icons', () => {
  it('has one icon per value and per principle (16 total)', () => {
    expect(Object.keys(ICONS)).toHaveLength(16);
    for (const v of VALUES) expect(ICONS[v.id as IconKey]).toBeDefined();
    for (const p of PRINCIPLES) expect(ICONS[p.n as IconKey]).toBeDefined();
  });

  for (const [key, def] of Object.entries(ICONS)) {
    describe(key, () => {
      it('has a non-empty label and paths', () => {
        expect(def.label.length).toBeGreaterThan(0);
        expect(def.paths.trim().length).toBeGreaterThan(0);
      });

      it('tags every drawn shape with pathLength="100"', () => {
        const shapes = def.paths.match(/<(path|circle)\b/g) ?? [];
        const tagged = def.paths.match(/pathLength="100"/g) ?? [];
        expect(shapes.length).toBeGreaterThan(0);
        expect(tagged).toHaveLength(shapes.length);
      });

      it('uses only token-safe colours (no hex/hsl/rgb, fill is none or currentColor)', () => {
        expect(def.paths).not.toMatch(/#[0-9a-fA-F]{3,}/);
        expect(def.paths).not.toMatch(/hsl\(|rgb\(/);
        for (const fill of def.paths.match(/fill="([^"]*)"/g) ?? []) {
          expect(['fill="none"', 'fill="currentColor"']).toContain(fill);
        }
      });
    });
  }
});
