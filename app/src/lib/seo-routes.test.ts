import { describe, expect, it } from 'vitest';
import { GET as getMarkdown } from '../pages/index.md';
import { GET as getFullMarkdown } from '../pages/llms-full.txt';
import { GET as getDiscovery } from '../pages/llms.txt';
import { GET as getSitemap } from '../pages/sitemap.xml';
import { getManifestoMarkdown } from './manifesto';
import { absoluteUrl } from './site';

describe('canonical content routes', () => {
  it.each([
    ['/index.md', getMarkdown],
    ['/llms-full.txt', getFullMarkdown],
  ] as const)('%s serves the full manifesto with a canonical homepage link', async (_path, get) => {
    const response = get();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('Link')).toBe(`<${absoluteUrl('/')}>; rel="canonical"`);
    expect(await response.text()).toBe(getManifestoMarkdown());
  });

  it('lists only canonical HTML pages in the sitemap', async () => {
    const response = getSitemap();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/xml; charset=utf-8');
    const sitemap = await response.text();
    expect([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])).toEqual([
      absoluteUrl('/'),
      absoluteUrl('/privacy'),
    ]);
  });

  it('keeps the Markdown alternatives discoverable', async () => {
    const response = getDiscovery();

    expect(response.status).toBe(200);
    const discovery = await response.text();
    expect(discovery).toContain(absoluteUrl('/index.md'));
    expect(discovery).toContain(absoluteUrl('/llms-full.txt'));
  });
});
