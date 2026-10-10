import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { ANALYTICS } from '../../src/lib/analytics';
import { coverSignExperiment } from '../../src/content/experiments';

const SITE_ORIGIN = 'https://www.ai-driven-development.org';
const tracker = readFileSync(new URL('./fixtures/umami-v3.2.0.js', import.meta.url), 'utf8')
  .replaceAll('__COLLECT_API_HOST__', '')
  .replaceAll('__COLLECT_API_ENDPOINT__', '/api/send');

interface CollectedEvent {
  type: string;
  payload: { url: string; referrer: string; website: string; name?: string; tag?: string };
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
    localStorage.setItem('aidd:experiment:manifest-cover-sign-01', 'a');
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
    payload: { website: ANALYTICS.websiteId, url: '/', referrer: 'https://referrer.example', tag: `${coverSignExperiment.id}-a` },
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
  expect(events[1].payload).toMatchObject({ url: '/', name: 'signature_started', tag: `${coverSignExperiment.id}-a` });
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
    await expect(page.locator('html')).not.toHaveAttribute('data-manifest-experiment');
    await expect(page.locator('.cover-link-primary')).toHaveAccessibleName(coverSignExperiment.labels.a);
    expect(await page.evaluate((key) => localStorage.getItem(key), coverSignExperiment.storageKey)).toBeNull();
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
  expect(events[0].payload.tag).toBeUndefined();
  await expect(page.locator('html')).not.toHaveAttribute('data-manifest-experiment');
  expect(JSON.stringify(events)).not.toMatch(/alex|secret|email/);
});

for (const variant of ['a', 'b'] as const) {
  test(`keeps cohort ${variant} through reloads, tabs, and the unchanged GitHub journey`, async ({ page, baseURL }) => {
    const { events } = await interceptAnalytics(page, baseURL!);
    await page.addInitScript(({ key, selected }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, selected);
    }, { key: coverSignExperiment.storageKey, selected: variant });
    await page.goto(SITE_ORIGIN);
    const cta = page.locator('.cover-link-primary');
    await expect(cta).toHaveAccessibleName(coverSignExperiment.labels[variant]);
    await expect(cta).toHaveAttribute('href', /github\.com\/ai-driven-dev\/manifest\/issues\/new\?template=signature\.yml/);
    await expect.poll(() => events.length).toBe(1);
    expect(events[0].payload.tag).toBe(`${coverSignExperiment.id}-${variant}`);
    await page.reload();
    await expect(cta).toHaveAccessibleName(coverSignExperiment.labels[variant]);
    await expect.poll(() => events.length).toBe(2);
    const otherTab = await page.context().newPage();
    const other = await interceptAnalytics(otherTab, baseURL!);
    await otherTab.goto(SITE_ORIGIN);
    await expect(otherTab.locator('.cover-link-primary')).toHaveAccessibleName(coverSignExperiment.labels[variant]);
    await expect.poll(() => other.events.length).toBe(1);
    expect(other.events[0].payload.tag).toBe(`${coverSignExperiment.id}-${variant}`);
    await otherTab.close();
    await cta.click();
    await expect(page.locator('#sign-dialog')).toHaveJSProperty('open', true);
    expect(events).toHaveLength(2);
    const popup = page.waitForEvent('popup');
    await page.locator('#sign-dialog-continue').click();
    await (await popup).close();
    await expect.poll(() => events.length).toBe(3);
    expect(events[2].payload).toMatchObject({ name: 'signature_started', tag: `${coverSignExperiment.id}-${variant}` });
    await page.goto(`${SITE_ORIGIN}/privacy`);
    await expect.poll(() => events.length).toBe(4);
    expect(events[3].payload.tag).toBeUndefined();
  });
}

for (const [random, expected] of [[0.4999, 'a'], [0.5, 'b']] as const) {
  test(`uses an even split at random=${random}`, async ({ page, baseURL }) => {
    await interceptAnalytics(page, baseURL!);
    await page.addInitScript((value) => { Math.random = () => value; }, random);
    await page.goto(SITE_ORIGIN);
    await expect(page.locator('html')).toHaveAttribute('data-manifest-variant', expected);
    await expect(page.locator('.cover-link-primary')).toHaveAccessibleName(coverSignExperiment.labels[expected]);
    expect(await page.evaluate((key) => localStorage.getItem(key), coverSignExperiment.storageKey)).toBe(expected);
  });
}

test('selects B before first paint without waiting for the deferred application script', async ({ page, baseURL }) => {
  await interceptAnalytics(page, baseURL!);
  await page.route('**/_astro/Page.astro*', (route) => route.abort());
  await page.addInitScript((key) => {
    localStorage.setItem(key, 'b');
    new PerformanceObserver((list) => {
      if (list.getEntries().some((entry) => entry.name === 'first-contentful-paint')) {
        (window as Window & { firstPaintVariant?: string }).firstPaintVariant = document.documentElement.dataset.manifestVariant;
      }
    }).observe({ type: 'paint', buffered: true });
  }, coverSignExperiment.storageKey);
  await page.goto(SITE_ORIGIN);
  await expect(page.locator('.cover-link-primary')).toHaveAccessibleName(coverSignExperiment.labels.b);
  await expect.poll(() => page.evaluate(() => (window as Window & { firstPaintVariant?: string }).firstPaintVariant)).toBe('b');
  const script = page.locator('head script[data-experiment]');
  await expect(script).toHaveAttribute('src', /^\/_astro\/cover-experiment\..*\.js$/);
  await expect(script).not.toHaveAttribute('async');
  await expect(script).not.toHaveAttribute('defer');
  await expect(script).not.toHaveAttribute('type', 'module');
});

for (const failure of ['read', 'write'] as const) {
  test(`blocked storage ${failure} keeps A outside cohorts`, async ({ page, baseURL }) => {
    const { events } = await interceptAnalytics(page, baseURL!);
    await page.addInitScript((operation) => {
      Storage.prototype[operation === 'read' ? 'getItem' : 'setItem'] = () => {
        throw new DOMException('Storage disabled', 'SecurityError');
      };
    }, failure);
    await page.goto(SITE_ORIGIN);
    await expect(page.locator('.cover-link-primary')).toHaveAccessibleName(coverSignExperiment.labels.a);
    await expect(page.locator('html')).not.toHaveAttribute('data-manifest-experiment');
    if (failure === 'write') await expect.poll(() => events.length).toBe(1);
    expect(events.every((event) => event.payload.tag === undefined)).toBe(true);
  });
}

test('an opt-out after assignment stops further collection', async ({ page, baseURL }) => {
  const { events } = await interceptAnalytics(page, baseURL!);
  await page.goto(SITE_ORIGIN);
  await expect.poll(() => events.length).toBe(1);
  await page.evaluate(() => localStorage.setItem('umami.disabled', '1'));
  await page.locator('.cover-link-primary').click();
  const popup = page.waitForEvent('popup');
  await page.locator('#sign-dialog-continue').click();
  await (await popup).close();
  expect(events).toHaveLength(1);
  await page.reload();
  await expect(page.locator('.cover-link-primary')).toHaveAccessibleName(coverSignExperiment.labels.a);
  await expect(page.locator('html')).not.toHaveAttribute('data-manifest-experiment');
});

test('derives cohort tags and rejects unknown events and raw payload data', async ({ page, baseURL }) => {
  await interceptAnalytics(page, baseURL!);
  await page.addInitScript((key) => localStorage.setItem(key, 'b'), coverSignExperiment.storageKey);
  await page.goto(SITE_ORIGIN);
  await page.waitForFunction(() => !!window.aiddBeforeSend);
  const sanitized = await page.evaluate(() => {
    const callback = window.aiddBeforeSend!;
    return {
      allowed: callback('event', { name: 'signature_started', url: '/?email=private', referrer: 'https://referrer.example/private', tag: 'arbitrary' }),
      unknown: callback('event', { name: 'unknown', tag: 'manifest-cover-sign-01-b' }),
      identity: callback('identify', { tag: 'manifest-cover-sign-01-b' }),
    };
  });
  expect(sanitized.allowed).toMatchObject({ url: '/', referrer: 'https://referrer.example', name: 'signature_started', tag: `${coverSignExperiment.id}-b` });
  expect(JSON.stringify(sanitized)).not.toMatch(/private|arbitrary/);
  expect(sanitized.unknown).toBe(false);
  expect(sanitized.identity).toBe(false);
});

test('keeps the direct A link usable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const { trackerRequests, events } = await interceptAnalytics(page, baseURL!);
  await page.goto(SITE_ORIGIN);
  await expect(page.locator('.cover-link-primary')).toHaveAccessibleName(coverSignExperiment.labels.a);
  const popup = page.waitForEvent('popup');
  await page.locator('.cover-link-primary').click();
  await expect(await popup).toHaveURL(/github\.com\/ai-driven-dev\/manifest\/issues\/new\?template=signature\.yml/);
  expect(trackerRequests).toEqual([]);
  expect(events).toEqual([]);
  await context.close();
});
