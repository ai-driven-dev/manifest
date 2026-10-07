import { describe, expect, it } from 'vitest';
import { GET as getMarkdown } from '../pages/index.md';
import { GET as getFullMarkdown } from '../pages/llms-full.txt';
import { GET as getDiscovery } from '../pages/llms.txt';
import { GET as getSitemap } from '../pages/sitemap.xml';
import { GET as getCatalog } from '../pages/.well-known/api-catalog';
import { GET as getSchema } from '../pages/schema/home.jsonld';
import { GET as getFeed } from '../pages/feed.xml';
import { getManifestoMarkdown } from './manifesto';
import { absoluteUrl, MACHINE_ENDPOINTS } from './site';

const machineRoutes = {
  '/llms-full.txt': getFullMarkdown,
  '/schema/home.jsonld': getSchema,
  '/feed.xml': getFeed,
  '/.well-known/api-catalog': getCatalog,
};

describe('machine-readable catalog', () => {
  it.each(Object.entries(machineRoutes))('advertises the response media type for %s', async (path, get) => {
    const catalog = await getCatalog().json();
    const item = catalog.linkset[0].item.find(({ href }: { href: string }) => href === absoluteUrl(path));
    const response = get();

    expect(response.status).toBe(200);
    expect(item?.type).toBe(response.headers.get('Content-Type')?.split(';')[0]);
    expect(catalog.linkset[0].item.map(({ href }: { href: string }) => href)).toEqual(MACHINE_ENDPOINTS.map(absoluteUrl));
  });
});

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
