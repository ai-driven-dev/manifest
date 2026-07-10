export const SITE = {
  origin: 'https://www.ai-driven-development.org',
  lang: 'en',
  locale: 'en_US',
  dir: 'ltr',
  name: 'The Manifesto for AI-Driven Development',
  shortName: 'AIDD Manifesto',
  description:
    'Four values and twelve principles for developers who build software with AI as a deliberate partner.',
  repoUrl: 'https://github.com/ai-driven-dev/manifest',
  signUrl:
    'https://github.com/ai-driven-dev/manifest/new/main/app/src/content/signatories',
  publishedDate: '2026-05-08',
  modifiedDate: '2026-05-31',
  indexNowKey: 'a1f401c8d1e64cb99fbe0d7f4a462026',
  themeLight: 'oklch(0.972 0.008 82)',
  themeDark: 'oklch(0.16 0.012 60)',
};

export const PUBLIC_PAGES = [
  {
    path: '/',
    title: SITE.name,
    description: SITE.description,
    priority: '1.0',
    changefreq: 'monthly',
  },
  {
    path: '/privacy',
    title: `Privacy | ${SITE.shortName}`,
    description:
      'Privacy policy for the AI-Driven Development manifesto site, including signatory data and third-party requests.',
    priority: '0.3',
    changefreq: 'yearly',
  },
  {
    path: '/index.md',
    title: `${SITE.name} Markdown`,
    description: 'Raw Markdown source for the manifesto.',
    priority: '0.7',
    changefreq: 'monthly',
  },
] as const;

export const MACHINE_ENDPOINTS = [
  '/llms.txt',
  '/llms-full.txt',
  '/manifesto.json',
  '/schema/home.jsonld',
  '/schemamap.xml',
  '/sitemap.xml',
  '/feed.xml',
  '/.well-known/api-catalog',
  '/a1f401c8d1e64cb99fbe0d7f4a462026.txt',
] as const;

export function absoluteUrl(path = '/'): string {
  return new URL(path, SITE.origin).toString();
}

export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
