import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { ANALYTICS } from '../../src/lib/analytics';

const SITE_ORIGIN = 'https://www.ai-driven-development.org';
const tracker = readFileSync(new URL('./fixtures/umami-v3.2.0.js', import.meta.url), 'utf8')
  .replaceAll('__COLLECT_API_HOST__', '')
  .replaceAll('__COLLECT_API_ENDPOINT__', '/api/send');

interface CollectedEvent {
  type: string;
  payload: { url: string; referrer: string; website: string; name?: string };
}

async function interceptAnalytics(page: Page, baseURL: string) {
  const events: CollectedEvent[] = [];
  const trackerRequests: string[] = [];
  await page.route(`${SITE_ORIGIN}/**`, async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({ url: `${baseURL}${url.pathname}${url.search}` });
    await route.fulfill({ response });
  });
  await page.route(`${ANALYTICS.origin}/**`, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/script.js') {
      trackerRequests.push(url.pathname);
      await route.fulfill({ contentType: 'application/javascript', body: tracker });
      return;
    }
    if (url.pathname === '/api/send' && route.request().method() === 'POST') {
      events.push(route.request().postDataJSON());
    }
    await route.fulfill({
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': SITE_ORIGIN,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-umami-website-id, x-umami-hostname, x-umami-cache',
      },
      body: JSON.stringify({}),
    });
  });
  await page.context().route('https://github.com/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<h1>GitHub signature form</h1>' })
  );
  return { events, trackerRequests };
}

test('tracks sanitized visits and only the actual GitHub signature departure', async ({ page, baseURL }) => {
  const { events, trackerRequests } = await interceptAnalytics(page, baseURL!);
  const violations: string[] = [];
  await page.exposeFunction('recordCspViolation', (directive: string) => violations.push(directive));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      (window as Window & { recordCspViolation?: (directive: string) => void })
        .recordCspViolation?.(event.violatedDirective);
    });
    Object.defineProperty(document, 'referrer', {
      get: () => 'https://referrer.example/private/alex?email=alex@example.com#secret',
    });
  });
  const response = await page.goto(`${SITE_ORIGIN}/?email=alex@example.com#secret`);
  const csp = response!.headers()['content-security-policy'];
  expect(csp).toContain(`script-src 'self' ${ANALYTICS.origin}`);
  expect(csp).toContain(`connect-src 'self' ${ANALYTICS.origin}`);
  expect(csp.split('; ').filter((directive) => directive.includes(ANALYTICS.origin))).toHaveLength(2);
  await expect.poll(() => events.length).toBe(1);
  expect(trackerRequests).toEqual(['/script.js']);
  expect(events[0]).toMatchObject({
    type: 'event',
    payload: { website: ANALYTICS.websiteId, url: '/', referrer: 'https://referrer.example' },
  });
  expect(JSON.stringify(events)).not.toMatch(/alex|private|secret|email/);

  await page.locator('.cover-link-primary').click();
  await expect(page.locator('#sign-dialog')).toHaveJSProperty('open', true);
  expect(events.map((event) => event.payload.name)).toEqual([undefined]);
  await page.locator('#sign-dialog .sign-dialog-cancel').click();
  expect(events).toHaveLength(1);

  await page.locator('.cover-link-primary').click();
  const popup = page.waitForEvent('popup');
  await page.locator('#sign-dialog-continue').click();
  const github = await popup;
  await expect(github).toHaveURL(/github\.com\/ai-driven-dev\/manifest\/issues\/new\?template=signature\.yml/);
  await github.close();
  await expect.poll(() => events.length).toBe(2);
  expect(events[1].payload).toMatchObject({ url: '/', name: 'signature_started' });
  await expect(page.locator('#sign-dialog')).toHaveJSProperty('open', false);
  expect(violations).toEqual([]);
});

for (const signal of ['GPC browser', 'DNT browser', 'Sec-GPC header', 'DNT header', 'Umami opt-out']) {
  test(`honors ${signal} without loading the tracker or sending events`, async ({ page, baseURL }) => {
    const { events, trackerRequests } = await interceptAnalytics(page, baseURL!);
    if (signal === 'Sec-GPC header') await page.setExtraHTTPHeaders({ 'Sec-GPC': '1' });
    if (signal === 'DNT header') await page.setExtraHTTPHeaders({ DNT: '1' });
    await page.addInitScript((setting) => {
      if (setting === 'GPC browser') Object.defineProperty(navigator, 'globalPrivacyControl', { value: true });
      if (setting === 'DNT browser') Object.defineProperty(navigator, 'doNotTrack', { value: '1' });
      if (setting === 'Umami opt-out') localStorage.setItem('umami.disabled', '1');
    }, signal);
    await page.goto(SITE_ORIGIN);
    await page.locator('.cover-link-primary').click();
    await expect(page.locator('#sign-dialog')).toHaveJSProperty('open', true);
    const popup = page.waitForEvent('popup');
    await page.locator('#sign-dialog-continue').click();
    await (await popup).close();
    expect(trackerRequests).toEqual([]);
    expect(events).toEqual([]);
  });
}

test('does not track local preview or unknown paths', async ({ page, baseURL }) => {
  const { events, trackerRequests } = await interceptAnalytics(page, baseURL!);
  await page.goto('/');
  await page.locator('.cover-link-primary').click();
  await expect(page.locator('#sign-dialog')).toHaveJSProperty('open', true);
  await page.goto(`${SITE_ORIGIN}/alex@example.com?email=secret`);
  await expect(page.locator('h1')).toHaveText('Not found');
  expect(trackerRequests).toEqual([]);
  expect(events).toEqual([]);
});

test('privacy page explains the actual collection and opt-outs', async ({ page, baseURL }) => {
  const { events } = await interceptAnalytics(page, baseURL!);
  await page.goto(`${SITE_ORIGIN}/privacy?email=alex@example.com#secret`);
  await expect(page.locator('main')).toContainText('self-hosted Umami');
  await expect(page.locator('main')).toContainText('A departure does not mean a signature has been published.');
  await expect(page.locator('main')).toContainText('Global Privacy Control and Do Not Track');
  await expect.poll(() => events.length).toBe(1);
  expect(events[0].payload.url).toBe('/privacy');
  expect(JSON.stringify(events)).not.toMatch(/alex|secret|email/);
});
