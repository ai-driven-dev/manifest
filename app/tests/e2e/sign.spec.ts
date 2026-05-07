import { test, expect } from '@playwright/test';

test('sign flow: opens dialog, submits, count increments', async ({ page, request }) => {
  // baseline count
  const before = await (await request.get('/api/signatures')).json();
  const beforeCount = before.count as number;

  await page.goto('/');

  // Sign button in the signature section opens the dialog
  await page.locator('#signOpen').click();
  await expect(page.locator('#signDialog')).toBeVisible();

  await page.locator('#dialogSignName').fill('UI Tester');
  await page.locator('#signDialogForm button[type=submit]').click();

  // dialog closes
  await expect(page.locator('#signDialog')).toBeHidden({ timeout: 5000 });

  // count incremented server-side
  const after = await (await request.get('/api/signatures')).json();
  expect(after.count).toBeGreaterThan(beforeCount);
});
