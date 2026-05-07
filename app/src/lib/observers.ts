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
 * Hero parallax — moves `.cover-seal` slightly with mouse position.
 */
export function attachHeroParallax(): void {
  const gal = document.querySelector<HTMLElement>('.cover-seal');
  if (!gal) return;
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;
    gal.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  });
}
