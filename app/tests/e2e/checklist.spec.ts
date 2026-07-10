import { expect, test } from '@playwright/test';

const routeChecks = [
  ['/robots.txt', 200, 'text/plain'],
  ['/sitemap.xml', 200, 'application/xml'],
  ['/sitemap-index.xml', 200, 'application/xml'],
  ['/feed.xml', 200, 'application/rss+xml'],
  ['/a1f401c8d1e64cb99fbe0d7f4a462026.txt', 200, 'text/plain'],
  ['/llms.txt', 200, 'text/plain'],
  ['/llms-full.txt', 200, 'text/markdown'],
  ['/index.md', 200, 'text/markdown'],
  ['/manifesto.json', 200, 'application/json'],
  ['/schema/home.jsonld', 200, 'application/ld+json'],
  ['/schemamap.xml', 200, 'application/xml'],
  ['/sw.js', 200, 'javascript'],
  ['/.well-known/security.txt', 200, 'text/plain'],
  ['/.well-known/api-catalog', 200, 'application/linkset+json'],
  ['/.well-known/webfinger?resource=acct:manifest@ai-driven-development.org', 200, 'application/json'],
  ['/.well-known/apple-app-site-association', 200, 'application/json'],
  ['/.well-known/assetlinks.json', 200, 'application/json'],
  ['/.well-known/nodeinfo', 200, 'application/json'],
  ['/nodeinfo/2.1', 200, 'application/json'],
  ['/.well-known/traffic-advice', 200, 'application/json'],
  ['/.well-known/agent-card.json', 200, 'application/json'],
  ['/.well-known/agent-skills.json', 200, 'application/json'],
  ['/mcp', 200, 'application/json'],
  ['/ask', 200, 'application/json'],
] as const;

test.describe('web checklist surface', () => {
  test('homepage has required document head, semantics, and security headers', async ({ page, request }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    const headers = response!.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers.link).toContain('rel="llms"');
    expect(headers.link).toContain('rel="api-catalog"');
    expect(headers.link).toContain('rel="nlweb"');
    expect(headers['cache-control']).toBe('no-cache');
    expect(headers['no-vary-search']).toContain('utm_source');
    expect(headers['set-cookie']).toBeUndefined();

    const raw = await (await request.get('/')).text();
    expect(raw.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(raw.slice(0, 1024)).toContain('<meta charset="utf-8">');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('head > title')).toHaveCount(1);
    await expect(page).toHaveTitle(/Manifesto for AI-Driven Development/);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      'content',
      /width=device-width/
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /developers/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://www.ai-driven-development.org/'
    );
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate icon"]')).toHaveAttribute('href', '/favicon.ico');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2);
    await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute('content', 'light dark');
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:url"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);

    await expect(page.locator('body > .skip-link').first()).toHaveAttribute('href', '#main');
    await expect(page.locator('main#main')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h2')).toHaveCount(3);
    await expect(page.locator('#V-1')).toHaveCount(1);
    await expect(page.locator('#P-01')).toHaveCount(1);

    const accessibilityFailures = await page.evaluate(() => {
      const failures: string[] = [];
      document.querySelectorAll('img').forEach((img, index) => {
        if (!img.hasAttribute('alt')) failures.push(`img ${index} missing alt`);
        if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
          failures.push(`img ${index} missing dimensions`);
        }
      });
      document.querySelectorAll('button, a').forEach((el, index) => {
        const label =
          el.getAttribute('aria-label') ||
          el.textContent?.trim() ||
          el.querySelector('img')?.getAttribute('alt') ||
          '';
        if (!label) failures.push(`${el.tagName.toLowerCase()} ${index} missing accessible name`);
      });
      document.querySelectorAll('input, select, textarea').forEach((el) => {
        const id = el.getAttribute('id');
        const hasLabel = !!id && !!document.querySelector(`label[for="${id}"]`);
        if (!hasLabel && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) {
          failures.push(`${el.tagName.toLowerCase()}#${id ?? 'no-id'} missing label`);
        }
      });
      return failures;
    });
    expect(accessibilityFailures).toEqual([]);

    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();

    const externalStyleOrScript = await page.evaluate(() =>
      [...document.querySelectorAll('script[src], link[rel="stylesheet"]')]
        .map((el) => (el as HTMLScriptElement | HTMLLinkElement).src || (el as HTMLLinkElement).href)
        .filter((url) => url && !url.startsWith(location.origin))
    );
    expect(externalStyleOrScript).toEqual([]);
    const unloadHandlers = await page.evaluate(() => ({
      hasUnloadAttribute: !!document.querySelector('[onunload], [onbeforeunload]'),
      mentionsUnload: [...document.scripts].some((script) =>
        /beforeunload|addEventListener\(['"]unload/.test(script.textContent || '')
      ),
    }));
    expect(unloadHandlers).toEqual({ hasUnloadAttribute: false, mentionsUnload: false });
    expect(consoleErrors.filter((message) => message.includes('Content Security Policy'))).toEqual([]);
  });

  test('machine-readable, social, well-known, and resilience routes respond', async ({ request }) => {
    for (const [path, status, type] of routeChecks) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(status);
      expect(response.headers()['content-type'], path).toContain(type);
    }

    await expect((await request.get('/robots.txt')).text()).resolves.toContain('Content-Signal');
    await expect((await request.get('/robots.txt')).text()).resolves.toContain('GPTBot');
    await expect((await request.get('/sitemap.xml')).text()).resolves.toContain('xhtml:link');
    await expect((await request.get('/sitemap.xml')).text()).resolves.toContain('image:image');
    await expect((await request.get('/feed.xml')).text()).resolves.toContain('atom:link');
    await expect((await request.get('/feed.xml')).text()).resolves.toContain('sy:updatePeriod');
    await expect((await request.get('/a1f401c8d1e64cb99fbe0d7f4a462026.txt')).text()).resolves.toBe(
      'a1f401c8d1e64cb99fbe0d7f4a462026\n'
    );
    const gpc = await request.get('/', { headers: { 'Sec-GPC': '1' } });
    expect(gpc.headers()['preference-applied']).toBe('Sec-GPC');
    expect(gpc.headers().vary).toContain('Sec-GPC');

    const missing = await request.get('/does-not-exist');
    expect(missing.status()).toBe(404);
    expect(missing.headers()['x-robots-tag']).toContain('noindex');

    const maintenance = await request.get('/maintenance');
    expect(maintenance.status()).toBe(503);
    expect(maintenance.headers()['retry-after']).toBe('3600');

    const compressed = await request.get('/robots.txt', {
      headers: { 'Accept-Encoding': 'gzip' },
    });
    expect(compressed.headers()['content-encoding']).toBe('gzip');
  });

  test('JSON-RPC agent endpoints expose and call manifesto tools', async ({ request }) => {
    const list = await request.post('/mcp', {
      data: { jsonrpc: '2.0', id: 1, method: 'tools/list' },
    });
    await expect(list.json()).resolves.toMatchObject({
      result: { tools: expect.arrayContaining([expect.objectContaining({ name: 'get_manifesto' })]) },
    });

    const call = await request.post('/mcp', {
      data: {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'search_manifesto', arguments: { query: 'ownership' } },
      },
    });
    const body = await call.json();
    expect(body.result.content.values.length + body.result.content.principles.length).toBeGreaterThan(0);

    const ask = await request.post('/ask', {
      data: { jsonrpc: '2.0', id: 3, method: 'ask', params: { question: 'context' } },
    });
    await expect(ask.json()).resolves.toMatchObject({ jsonrpc: '2.0', id: 3 });
  });
});
