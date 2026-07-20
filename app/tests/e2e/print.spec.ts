import { expect, test } from '@playwright/test';

test.describe('print rendering', () => {
  test('homepage keeps manifesto content visible in print media', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    for (const selector of ['.cover', '#preamble', '#definition', '#values', '#principles', '#sign', 'footer.doc-footer']) {
      await expect(page.locator(selector), `${selector} should render for print`).toBeVisible();
    }

    await expect(page.locator('h1.cover-title')).toContainText(/AI-Driven\s+Development\s+Manifesto/);
    await expect(page.locator('#preamble')).toContainText('As AI-Driven Developers');
    await expect(page.locator('#definition')).toContainText('A way of building software');
    await expect(page.locator('#values')).toContainText('Bet on the method, not the model');
    await expect(page.locator('#principles')).toContainText('Do not delegate what you cannot evaluate');
    await expect(page.locator('#sign')).toContainText('Public signature registry');
    await expect(page.locator('#sign')).toContainText(/signator(y|ies)/);
    await expect(page.locator('footer.doc-footer')).toContainText('github.com/ai-driven-dev/manifest');

    await expect(page.locator('.plate-row')).toHaveCount(4);
    await expect(page.locator('.principle')).toHaveCount(12);
    await expect(page.locator('.sig-card').first()).toBeVisible();

    const printState = await page.evaluate(() => {
      const css = (selector: string) => getComputedStyle(document.querySelector(selector)!);

      return {
        bodyOverflowX: css('body').overflowX,
        coverCtaDisplay: css('.cover-cta').display,
        docLayoutDisplay: css('.doc-layout').display,
        firstRevealOpacity: css('.reveal').opacity,
        firstRevealTransform: css('.reveal').transform,
        htmlOverflowX: css('html').overflowX,
        signCtaDisplay: css('.sign-cta').display,
        specIndexDisplay: css('.spec-index').display,
        valueLineOpacity: css('.value-art .va-l').opacity,
        valueLineTransform: css('.value-art .va-l').transform,
      };
    });

    expect(printState).toEqual({
      bodyOverflowX: 'visible',
      coverCtaDisplay: 'none',
      docLayoutDisplay: 'block',
      firstRevealOpacity: '1',
      firstRevealTransform: 'none',
      htmlOverflowX: 'visible',
      signCtaDisplay: 'none',
      specIndexDisplay: 'none',
      valueLineOpacity: '1',
      valueLineTransform: 'none',
    });
  });
});
