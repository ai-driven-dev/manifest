import { MACHINE_ENDPOINTS, SITE, absoluteUrl } from '~/lib/site';
import { jsonResponse } from '~/lib/response';

const mediaTypes: Record<(typeof MACHINE_ENDPOINTS)[number], string> = {
  '/llms.txt': 'text/plain',
  '/llms-full.txt': 'text/markdown',
  '/manifesto.json': 'application/json',
  '/schema/home.jsonld': 'application/ld+json',
  '/schemamap.xml': 'application/xml',
  '/sitemap.xml': 'application/xml',
  '/feed.xml': 'application/rss+xml',
  '/.well-known/api-catalog': 'application/linkset+json',
  '/a1f401c8d1e64cb99fbe0d7f4a462026.txt': 'text/plain',
};

export function GET() {
  return jsonResponse(
    {
      linkset: [
        {
          anchor: SITE.origin,
          item: MACHINE_ENDPOINTS.map((path) => ({
            href: absoluteUrl(path),
            type: mediaTypes[path],
          })),
        },
      ],
    },
    { headers: { 'Content-Type': 'application/linkset+json; charset=utf-8' } }
  );
}
