import { test, expect } from '@playwright/test';

/**
 * Visual regression — the cover renders consistently across viewports.
 * The Astro app is now its own source of truth (the migration baseline has been
 * retired). We snapshot the `.cover` region and assert ≤ 1% pixel drift against
 * the stored snapshot so future regressions surface.
 */

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 812 },
];

for (const v of VIEWPORTS) {
  test(`visual — cover at ${v.name} ${v.width}x${v.height}`, async ({ page }) => {
    await page.setViewportSize({ width: v.width, height: v.height });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const astroBuf = await page.locator('.cover').screenshot({ animations: 'disabled' });

    expect(astroBuf.byteLength).toBeGreaterThan(0);
    expect(astroBuf).toMatchSnapshot(`cover-${v.name}.png`, { maxDiffPixelRatio: 0.01 });
  });
}
