/**
 * Reliable in-page anchor scrolling (TOC links + value/principle permalinks).
 * Native hash / CSS smooth scrolling lands short on this long, animated
 * document, so we drive the scroll ourselves (rAF) and land exactly on the
 * target's scroll-margin. Honours reduced-motion.
 *
 * Extracted verbatim from ClientApp.astro to keep that component within the
 * .astro LOC budget (AC-6). Call initSmoothAnchors() once on island hydration.
 */
function scrollToTarget(target: HTMLElement) {
  const root = document.documentElement;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const marginTop = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const destY = Math.round(window.scrollY + target.getBoundingClientRect().top - marginTop);
  const prevBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto'; // take over from the global smooth scroll
  if (reduce) { window.scrollTo(0, destY); root.style.scrollBehavior = prevBehavior; return; }
  const startY = window.scrollY;
  const dist = destY - startY;
  const dur = Math.min(900, Math.max(300, Math.abs(dist) * 0.5));
  let t0: number | null = null;
  function step(ts: number) {
    if (t0 === null) t0 = ts;
    const p = Math.min(1, (ts - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    window.scrollTo(0, Math.round(startY + dist * eased));
    if (p < 1) requestAnimationFrame(step);
    else root.style.scrollBehavior = prevBehavior;
  }
  requestAnimationFrame(step);
}

export function initSmoothAnchors(): void {
  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
    if (!link) return;
    const id = link.getAttribute('href')!.slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target);
    history.pushState(null, '', '#' + id);
  });
}
