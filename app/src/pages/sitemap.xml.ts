import { PUBLIC_PAGES, SITE, absoluteUrl } from '~/lib/site';
import { textResponse } from '~/lib/response';

export function GET() {
  const urls = PUBLIC_PAGES.map(
    (page) => `  <url>
    <loc>${absoluteUrl(page.path)}</loc>
    <lastmod>${SITE.modifiedDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${absoluteUrl(page.path)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(page.path)}" />
    <image:image>
      <image:loc>${absoluteUrl(page.path === '/' ? '/og-image-2026-09.png' : '/icon-512.png')}</image:loc>
      <image:title>${page.title}</image:title>
    </image:image>
  </url>`
  ).join('\n');

  return textResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`,
    'application/xml; charset=utf-8'
  );
}
