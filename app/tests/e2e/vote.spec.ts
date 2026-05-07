import { test, expect } from '@playwright/test';

test('+1 vote increments score visibly', async ({ page }) => {
  await page.goto('/');
  const widget = page.locator('.vote-widget[data-vote-target-id="P-1"]').first();
  await widget.scrollIntoViewIfNeeded();
  const score = widget.locator('[data-vote-score]');
  await widget.locator('[data-vote-action=up]').click();
  await expect(score).not.toHaveText('0', { timeout: 5000 });
});

test('-1 click opens downvote dialog and submitting feedback closes it', async ({ page }) => {
  await page.goto('/');
  const widget = page.locator('.vote-widget[data-vote-target-id="P-1"]').first();
  await widget.scrollIntoViewIfNeeded();
  await widget.locator('[data-vote-action=down]').click();
  await expect(page.locator('#downvoteDialog')).toBeVisible();
  await page.locator('#dvReason').fill('Not clear enough.');
  await page.locator('#dvAlternative').fill('Add an example.');
  await page.locator('#downvoteForm button[type=submit]').click();
  await expect(page.locator('#downvoteDialog')).toBeHidden({ timeout: 5000 });
});
