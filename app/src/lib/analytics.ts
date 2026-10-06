export const ANALYTICS = {
  origin: 'https://stats.ai-driven-dev.fr',
  websiteId: 'ef333c9a-9efe-4abb-9b97-256478a9d636',
  domains: ['ai-driven-development.org', 'www.ai-driven-development.org'],
  paths: ['/', '/privacy'],
} as const;

interface AnalyticsPayload {
  website?: string;
  hostname?: string;
  language?: string;
  screen?: string;
  title?: string;
  url?: string;
  referrer?: string;
  name?: string;
}

declare global {
  interface Window {
    aiddBeforeSend?: (type: string, payload: AnalyticsPayload) => AnalyticsPayload | false;
  }
}

function hasPrivacyOptOut(): boolean {
  const browser = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  const legacyDnt = (window as Window & { doNotTrack?: string }).doNotTrack;
  const dnt = legacyDnt || browser.doNotTrack || browser.msDoNotTrack;
  if (browser.globalPrivacyControl || dnt === '1' || dnt === 'yes') return true;
  if (document.documentElement.hasAttribute('data-analytics-disabled')) return true;
  try {
    return !!localStorage.getItem('umami.disabled');
  } catch {
    return false;
  }
}

function referrerOrigin(referrer = ''): string {
  try {
    const url = new URL(referrer);
    return ['http:', 'https:'].includes(url.protocol) ? url.origin : '';
  } catch {
    return '';
  }
}

export function initAnalytics(): void {
  if (hasPrivacyOptOut()) return;
  if (!ANALYTICS.domains.some((domain) => domain === location.hostname)) return;
  if (!ANALYTICS.paths.some((path) => path === location.pathname)) return;

  window.aiddBeforeSend = (type, payload) => {
    if (hasPrivacyOptOut() || type !== 'event') return false;
    if (payload.name && payload.name !== 'signature_started') return false;
    if (!ANALYTICS.paths.some((path) => path === location.pathname)) return false;
    // Keep only standard aggregate fields: no query, fragment, identity, or event data.
    return {
      website: payload.website,
      hostname: payload.hostname,
      language: payload.language,
      screen: payload.screen,
      title: payload.title,
      url: location.pathname,
      referrer: referrerOrigin(payload.referrer),
      ...(payload.name ? { name: payload.name } : {}),
    };
  };

  const script = document.createElement('script');
  script.src = `${ANALYTICS.origin}/script.js`;
  script.async = true;
  script.dataset.websiteId = ANALYTICS.websiteId;
  script.dataset.domains = ANALYTICS.domains.join(',');
  script.dataset.doNotTrack = 'true';
  script.dataset.excludeSearch = 'true';
  script.dataset.excludeHash = 'true';
  script.dataset.beforeSend = 'aiddBeforeSend';
  document.head.append(script);
}
