import { expect, test } from '@playwright/test';

// Both the cover CTA and the bottom button open the modal via the same
// [data-github-url] click delegation in share.ts.
test.describe('sign flow', () => {
  // The share flow ends by opening the GitHub form in a new tab after a 3 s
  // countdown. Stub it so the tests assert the modal, not the external redirect.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.open = () => null;
    });
  });

  test('cover Sign opens the share modal instead of scrolling to #sign', async ({ page }) => {
    await page.goto('/');

    const cover = page.locator('.cover-link-primary');
    await expect(cover).toBeVisible();
    // It is a real anchor to the GitHub form (works with JS off).
    await expect(cover).toHaveAttribute('href', /github\.com\/.*issues\/new\?template=signature\.yml/);

    const popup = page.locator('#share-popup');
    await expect(popup).not.toHaveJSProperty('open', true);

    await cover.click();

    // JS intercepted the anchor: modal opens and the page did not scroll/navigate.
    await expect(popup).toHaveJSProperty('open', true);
    expect(new URL(page.url()).pathname).toBe('/');
  });

  test('bottom Sign button still opens the same modal', async ({ page }) => {
    await page.goto('/');

    const popup = page.locator('#share-popup');
    await page.locator('.sign-cta .sign-btn').click();

    await expect(popup).toHaveJSProperty('open', true);
  });
});
