import { expect, test } from '@playwright/test';

const SIGNATURE_FORM = /github\.com\/.*issues\/new\?template=signature\.yml/;

const SIGN_TRIGGERS = [
  { label: 'cover Sign CTA', selector: '.cover-link-primary' },
  { label: 'bottom Sign CTA', selector: '.sign-cta .sign-btn' },
];

test.describe('public signature preflight', () => {
  for (const trigger of SIGN_TRIGGERS) {
    test(`the ${trigger.label} explains the GitHub publication flow before continuing`, async ({ page }) => {
      await page.goto('/');

      await page.locator(trigger.selector).click();

      const dialog = page.locator('#sign-dialog');
      await expect(dialog).toHaveJSProperty('open', true);
      await expect(dialog).toContainText('Continue on GitHub');
      await expect(dialog).toContainText('only after the pull request is reviewed and merged');
      await expect(dialog).not.toContainText('You signed');
      await expect(dialog).not.toContainText('signatory #');

      const continueLink = dialog.locator('#sign-dialog-continue');
      await expect(continueLink).toHaveAttribute('href', SIGNATURE_FORM);
      await expect(continueLink).toHaveAttribute('target', '_blank');
      expect(new URL(page.url()).pathname).toBe('/');

      await dialog.locator('[data-sign-dialog-close]').first().click();
      await expect(dialog).toHaveJSProperty('open', false);
    });
  }
});
