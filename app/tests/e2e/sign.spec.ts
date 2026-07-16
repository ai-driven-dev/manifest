import { expect, test } from '@playwright/test';

// The signature form URL every Sign entry point must reach.
const SIGNATURE_FORM = /github\.com\/.*issues\/new\?template=signature\.yml/;

// Signing ends by opening the GitHub form in a new tab. Capture window.open so
// the tests assert that destination instead of following the real redirect.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __opened: string[] }).__opened = [];
    window.open = (url) => {
      (window as unknown as { __opened: string[] }).__opened.push(String(url ?? ''));
      return null;
    };
  });
});

async function redirectedToSignatureForm(page: import('@playwright/test').Page) {
  const opened = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
  return opened.some((url) => SIGNATURE_FORM.test(url));
}

// Every Sign entry point runs the one shared flow, so assert it once per trigger.
const SIGN_TRIGGERS = [
  { label: 'cover Sign CTA', selector: '.cover-link-primary' },
  { label: 'bottom Sign CTA', selector: '.sign-cta .sign-btn' },
];

test.describe('signature modal', () => {
  for (const trigger of SIGN_TRIGGERS) {
    test(`the ${trigger.label} opens the modal, then redirects to the GitHub signature form`, async ({ page }) => {
      await page.goto('/');

      await page.locator(trigger.selector).click();

      await expect(page.locator('#share-popup')).toHaveJSProperty('open', true);
      expect(new URL(page.url()).pathname).toBe('/'); // the page itself stays put
      await expect.poll(() => redirectedToSignatureForm(page), { timeout: 6000 }).toBe(true);
    });
  }

  test('with JavaScript off, the cover Sign CTA links straight to the GitHub signature form', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.cover-link-primary')).toHaveAttribute('href', SIGNATURE_FORM);
  });
});
