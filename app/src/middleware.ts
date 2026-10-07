import { defineMiddleware } from 'astro:middleware';
import { Readable } from 'node:stream';
import { createBrotliCompress, createGzip } from 'node:zlib';
import { absoluteUrl } from '~/lib/site';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const TEXT_TYPES = [
  'text/',
  'application/json',
  'application/ld+json',
  'application/linkset+json',
  'application/manifest+json',
  'application/xml',
  'application/rss+xml',
  'application/javascript',
  'image/svg+xml',
];

function isLocalHost(hostname: string): boolean {
  return LOCAL_HOSTS.has(hostname);
}

function isCompressible(contentType: string | null): boolean {
  return !!contentType && TEXT_TYPES.some((type) => contentType.includes(type));
}

function appendHeader(headers: Headers, name: string, value: string): void {
  const existing = headers.get(name);
  headers.set(name, existing ? `${existing}, ${value}` : value);
}

function buildCsp(isLocal: boolean): string {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://github.com https://avatars.githubusercontent.com",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "frame-ancestors 'none'",
    "form-action 'self' https://github.com",
  ];

  if (!isLocal) directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

function applySecurityHeaders(headers: Headers, isLocal: boolean): void {
  headers.set('Content-Security-Policy', buildCsp(isLocal));
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()'
  );
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  if (!isLocal) {
    headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
}

function applyCacheHeaders(headers: Headers, pathname: string, contentType: string | null): void {
  if (pathname.startsWith('/_astro/') || pathname.startsWith('/fonts/') || /\.(?:png|svg|ico|woff2)$/i.test(pathname)) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return;
  }

  if (contentType?.includes('text/html')) {
    headers.set('Cache-Control', 'no-cache');
    headers.set(
      'No-Vary-Search',
      'params=("utm_source" "utm_medium" "utm_campaign" "utm_term" "utm_content" "gclid" "fbclid")'
    );
    return;
  }

  headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
}

function applyLinkHeader(headers: Headers, pathname: string): void {
  appendHeader(headers, 'Link', `<${absoluteUrl('/llms.txt')}>; rel="llms"; type="text/plain"`);
  appendHeader(headers, 'Link', `<${absoluteUrl('/llms-full.txt')}>; rel="llms-full"; type="text/markdown"`);
  appendHeader(headers, 'Link', `<${absoluteUrl('/sitemap.xml')}>; rel="sitemap"; type="application/xml"`);
  appendHeader(headers, 'Link', `<${absoluteUrl('/feed.xml')}>; rel="alternate"; type="application/rss+xml"; title="AIDD Manifesto feed"`);
  appendHeader(headers, 'Link', `<${absoluteUrl('/.well-known/api-catalog')}>; rel="api-catalog"; type="application/linkset+json"`);
  if (pathname === '/') {
    appendHeader(headers, 'Link', `<${absoluteUrl('/schema/home.jsonld')}>; rel="describedby"; type="application/ld+json"`);
  }
  appendHeader(headers, 'Link', `<${absoluteUrl('/mcp')}>; rel="mcp"; type="application/json"`);
  appendHeader(headers, 'Link', `<${absoluteUrl('/ask')}>; rel="nlweb"; type="application/json"`);
}

function compressedResponse(response: Response, request: Request): Response {
  const acceptEncoding = request.headers.get('Accept-Encoding') || '';
  const contentType = response.headers.get('Content-Type');

  if (!response.body || response.headers.has('Content-Encoding') || !isCompressible(contentType)) {
    return response;
  }

  const headers = new Headers(response.headers);
  let encoder: ReturnType<typeof createBrotliCompress> | ReturnType<typeof createGzip>;

  if (acceptEncoding.includes('br')) {
    encoder = createBrotliCompress();
    headers.set('Content-Encoding', 'br');
  } else if (acceptEncoding.includes('gzip')) {
    encoder = createGzip();
    headers.set('Content-Encoding', 'gzip');
  } else {
    return response;
  }

  headers.delete('Content-Length');
  appendHeader(headers, 'Vary', 'Accept-Encoding');

  const nodeBody = Readable.fromWeb(response.body as unknown as import('node:stream/web').ReadableStream);
  const body = Readable.toWeb(nodeBody.pipe(encoder)) as unknown as BodyInit;

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const forwardedProto = context.request.headers.get('x-forwarded-proto');
  const url = new URL(context.request.url);
  const isLocal = isLocalHost(url.hostname);

  if (!isLocal && forwardedProto === 'http') {
    url.protocol = 'https:';
    return Response.redirect(url, 308);
  }

  const response = await next();
  const headers = response.headers;
  const contentType = headers.get('Content-Type');

  applySecurityHeaders(headers, isLocal);
  applyCacheHeaders(headers, url.pathname, contentType);
  applyLinkHeader(headers, url.pathname);

  if (context.request.headers.get('Sec-GPC') === '1') {
    headers.set('Preference-Applied', 'Sec-GPC');
    appendHeader(headers, 'Vary', 'Sec-GPC');
  }

  if (response.status >= 400) {
    headers.set('X-Robots-Tag', 'noindex, follow');
  }

  return compressedResponse(response, context.request);
});
