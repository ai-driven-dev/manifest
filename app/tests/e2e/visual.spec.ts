import { test, expect } from '@playwright/test';

/**
 * Visual regression — the cover renders consistently across viewports.
 * The Astro app is now its own source of truth (the migration baseline has been
 * retired). Playwright projects own the viewport matrix; this spec owns only the
 * visual assertion so snapshots do not cross desktop/mobile project contexts.
 */

const COVER_SCREENSHOT_STYLE = `
  html {
    scrollbar-gutter: stable !important;
  }

  body {
    overflow-y: scroll !important;
  }

  *, *::before, *::after {
    caret-color: transparent !important;
  }
`;

test('visual — cover', async ({ page }, testInfo) => {
  await page.goto('/');

  const cover = page.locator('.cover');
  await expect(cover).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  await expect(cover).toHaveScreenshot(`cover-${testInfo.project.name}.png`, {
    animations: 'disabled',
    maxDiffPixelRatio: 0.01,
    style: COVER_SCREENSHOT_STYLE,
  });
});
