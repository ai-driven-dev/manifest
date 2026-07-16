import { expect, test } from '@playwright/test';

const SIGNATURE_FORM = /github\.com\/.*issues\/new\?template=signature\.yml/;

// Capture window.open so the tests assert the redirect target instead of
// following it into a real new tab.
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
      expect(new URL(page.url()).pathname).toBe('/');
      await expect.poll(() => redirectedToSignatureForm(page), { timeout: 6000 }).toBe(true);
    });
  }

});

test.describe('signature fallback without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the cover Sign CTA is a plain link to the GitHub signature form and opens no modal', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.cover-link-primary')).toHaveAttribute('href', SIGNATURE_FORM);
    await expect(page.locator('#share-popup')).toHaveJSProperty('open', false);
  });
});
