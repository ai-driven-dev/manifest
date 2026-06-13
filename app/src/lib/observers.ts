/**
 * Reveal observer — adds `.seen` once an element is in view, then unobserves.
 */
export function observeReveals(selector = '.reveal, .plate-row'): void {
  const els = document.querySelectorAll(selector);
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) {
        en.target.classList.add('seen');
        io.unobserve(en.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el) => io.observe(el));
}

/**
 * Terminal observer — replays line animations when a `.term` re-enters viewport.
 */
export function observeTerminals(selector = '.term'): void {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const body = en.target.querySelector('.body');
      if (!body) return;
      if (en.isIntersecting) {
        // .play unpauses the CSS line animations (.term .ln defaults to paused);
        // re-setting the animation restarts the type-in on each entry.
        en.target.classList.add('play');
        body.querySelectorAll<HTMLElement>('.ln').forEach((ln) => {
          ln.style.animation = 'none';
          // force reflow
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          ln.offsetHeight;
          ln.style.animation = '';
        });
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll(selector).forEach((t) => io.observe(t));
}

/**
 * Value-art observer — toggles `.on` for CSS reveal, manages v2 cursor cycle.
 */
export function observeValueArt(): void {
  const v2Root = document.querySelector('.value-art[data-anim="v2"]');
  const v2Lines = v2Root ? v2Root.querySelectorAll<HTMLElement>('.va-model-line') : [] as unknown as NodeListOf<HTMLElement>;
  let v2Interval: ReturnType<typeof setInterval> | null = null;
  let v2Timer: ReturnType<typeof setTimeout> | null = null;
  let v2Active = 0;

  const v2Update = () => {
    v2Lines.forEach((el, i) => el.classList.toggle('va-cur', i === v2Active));
  };
  const v2Start = () => {
    if (v2Interval || v2Timer || v2Lines.length === 0) return;
    v2Active = 0;
    v2Timer = setTimeout(() => {
      v2Timer = null;
      v2Update();
      v2Interval = setInterval(() => {
        v2Active = (v2Active + 1) % v2Lines.length;
        v2Update();
      }, 1400);
    }, 2800);
  };
  const v2Stop = () => {
    if (v2Timer) { clearTimeout(v2Timer); v2Timer = null; }
    if (v2Interval) { clearInterval(v2Interval); v2Interval = null; }
    v2Lines.forEach((el) => el.classList.remove('va-cur'));
  };

  const artIO = new IntersectionObserver((entries) => {
    for (const en of entries) {
      const anim = en.target.getAttribute('data-anim');
      if (en.isIntersecting) {
        en.target.classList.add('on');
        if (anim === 'v2') v2Start();
      } else {
        en.target.classList.remove('on');
        if (anim === 'v2') v2Stop();
      }
    }
  }, { threshold: 0.2 });

  document.querySelectorAll('.value-art[data-anim]').forEach((el) => artIO.observe(el));
}

/**
 * Focus band — toggles `.lit` while an element overlaps a reading band near the
 * top-centre of the viewport (the "waterline"). Used to brighten the principle
 * / value currently being read while the others sit slightly dimmed.
 */
export function observeFocusBand(selector = '.principle, .plate-row'): void {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      en.target.classList.toggle('lit', en.isIntersecting);
    }
  }, { rootMargin: '-38% 0px -38% 0px', threshold: 0 });
  els.forEach((el) => io.observe(el));
}

/**
 * Spec index scroll-spy — highlights the sticky table-of-contents link for the
 * section currently in view. No-op if the index isn't present (mobile / absent).
 */
export function observeSpecIndex(): void {
  const links = Array.from(document.querySelectorAll<HTMLElement>('.si-link[data-spy]'));
  if (!links.length) return;
  const ids = links.map((l) => l.getAttribute('data-spy')).filter(Boolean) as string[];
  const sections = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
  if (!sections.length) return;
  let current = '';
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) {
        const id = (en.target as HTMLElement).id;
        if (id && id !== current) {
          current = id;
          links.forEach((l) => l.classList.toggle('active', l.getAttribute('data-spy') === id));
        }
      }
    }
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
  sections.forEach((s) => io.observe(s));
}

/**
 * Hero parallax — drifts the cover watermark with the cursor for a printed-paper feel.
 * No-op if the user has reduced motion preference.
 */
export function attachHeroParallax(): void {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const wm = document.querySelector<HTMLElement>('.cover-watermark');
  if (!wm) return;
  let raf = 0;
  let tx = 0, ty = 0;
  function paint() {
    raf = 0;
    wm!.style.transform = `translate(calc(-50% + 24vw + ${tx}px), calc(-50% - 4vh + ${ty}px))`;
  }
  window.addEventListener('mousemove', (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 24;
    ty = (e.clientY / window.innerHeight - 0.5) * 24;
    if (!raf) raf = requestAnimationFrame(paint);
  }, { passive: true });
}
