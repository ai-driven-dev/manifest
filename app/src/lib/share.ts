/**
 * Share popup — confetti rains across the viewport on sign, the user's rank is
 * stamped, an identity statement follows, the share phrase lives in a quotation
 * block (with a clickable link to ai-driven-development.org), then a countdown
 * announces the GitHub PR opening. The action row carries X (sized popup,
 * Twitter pre-fills via ?text=), Copy (clipboard), and LinkedIn — which is
 * always visible. LinkedIn click uses `navigator.share()` when available
 * (reliable pre-fill) or falls back to clipboard-copy + LinkedIn popup + a
 * "paste here" hint (Firefox / older browsers in 2025 still lack Web Share but
 * can Copy → Cmd+V). Message language tracks navigator.language.
 *
 * Extracted verbatim from ClientApp.astro to keep that component within the
 * .astro LOC budget (AC-6). Call initSharePopup() once on island hydration.
 */
const SHARE_URL = 'https://www.ai-driven-development.org/';
const URL_LABEL = 'ai-driven-development.org';
const URL_TOKEN = 'URL';
let shareCountdownInterval: ReturnType<typeof setInterval> | null = null;

function isFrench(lang: string) { return lang.toLowerCase().startsWith('fr'); }

function ordinal(n: number, fr: boolean): string {
  if (fr) return n === 1 ? '1er' : `${n}ème`;
  const j = n % 10, k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

function buildStatement(rank: number, lang: string): string {
  const fr = isFrench(lang);
  const ord = ordinal(rank, fr);
  return fr ? `Vous êtes le ${ord} AI-Driven Developer` : `You are the ${ord} AI-Driven Developer`;
}

function buildMessagePlain(rank: number, lang: string): string {
  const fr = isFrench(lang);
  const line1 = fr
    ? `Je viens de signer le Manifeste de l'AI-Driven Development en tant que signataire n°${rank}.`
    : `I just signed the AI-Driven Development Manifesto as signatory #${rank}.`;
  const line2 = URL_TOKEN;
  return `${line1}\n${line2}`.replaceAll(URL_TOKEN, SHARE_URL);
}

function buildMessageHTML(rank: number, lang: string): string {
  const fr = isFrench(lang);
  const line1 = fr
    ? `Je viens de signer le Manifeste de l'AI-Driven Development en tant que signataire n°${rank}.`
    : `I just signed the AI-Driven Development Manifesto as signatory #${rank}.`;
  const line2 = URL_TOKEN;
  const anchor = `<a class="share-popup-link" href="${SHARE_URL}" target="_blank" rel="noopener noreferrer">${URL_LABEL}</a>`;
  return `${line1}<br>${line2}`.replaceAll(URL_TOKEN, anchor);
}

function resetShareButtons(ready: boolean) {
  const buttons = document.querySelector('.share-popup-buttons');
  if (!buttons) return;
  buttons.setAttribute('data-ready', String(ready));
  document.querySelectorAll<HTMLElement>('.share-popup-btn').forEach((b) => {
    if (b.tagName === 'A') {
      b.setAttribute('aria-disabled', String(!ready));
    } else {
      (b as HTMLButtonElement).disabled = !ready;
    }
  });
}

function renderCountdown(el: HTMLElement, n: number, lang: string) {
  const fr = isFrench(lang);
  const label = fr ? 'Ouverture de votre contribution sur GitHub dans' : 'Opening your contribution on GitHub in';
  el.innerHTML = `${label} <strong>${n}</strong>`;
}

// Confetti emojis — rain across the whole viewport on sign, so the burst
// is visible even with the dialog open (they layer above the scrim).
const CONFETTI_EMOJIS = ['🎉', '✨', '🚀', '💻', '🌟', '💙', '⭐', '🎊', '🔥', '✅'];
function launchConfetti() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const count = 64;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'confetti-emoji';
    el.textContent = CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length];
    // Origin spread across the full top band + a few from each side.
    const fromTop = i % 3 !== 2;
    const startX = fromTop ? Math.random() * vw : (i % 4 === 0 ? -20 : vw + 20);
    const startY = fromTop ? -20 - Math.random() * 40 : Math.random() * vh * 0.6;
    // Drift downward and outward; long flight so the celebration lingers.
    const drift = 60 + Math.random() * 180;
    const dx = (Math.random() - 0.5) * 220;
    const dy = fromTop ? vh * 0.5 + drift : drift * 0.6;
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.setProperty('--dx', `${dx}px`);
    el.style.setProperty('--dy', `${dy}px`);
    el.style.setProperty('--rot', `${Math.random() * 900 - 450}deg`);
    el.style.setProperty('--delay', `${Math.random() * 0.35}s`);
    // Vary size slightly for depth.
    el.style.fontSize = `${28 + Math.random() * 16}px`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }
}

function startShareCountdown(githubUrl: string) {
  const popup = document.getElementById('share-popup') as HTMLDialogElement | null;
  const countdownEl = document.getElementById('share-countdown');
  const rankEl = document.getElementById('share-popup-rank');
  const statementEl = document.getElementById('share-popup-statement');
  const textEl = document.getElementById('share-popup-title');
  const copyFeedback = document.getElementById('share-copy-feedback');

  if (!popup || !countdownEl) return;

  if (shareCountdownInterval) {
    clearInterval(shareCountdownInterval);
    shareCountdownInterval = null;
  }

  const rank = Number(popup.dataset.signatoryRank) || 1;
  const lang = navigator.language || 'en';
  const plain = buildMessagePlain(rank, lang);
  const html = buildMessageHTML(rank, lang);

  if (rankEl) rankEl.textContent = `#${rank}`;
  if (statementEl) statementEl.textContent = buildStatement(rank, lang);
  if (textEl) textEl.innerHTML = html;
  if (copyFeedback) copyFeedback.hidden = true;

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(plain)}`;
  document.getElementById('share-btn-x')?.setAttribute('href', xHref);
  // LinkedIn is a `<button>` (no href) — the click handler decides between
  // `navigator.share()` (pre-fills composer when Web Share is available) and
  // a clipboard + popup fallback (Firefox / older browsers). The button is
  // always visible: a clipboard roundtrip is one Cmd/Ctrl-V away for users
  // whose browser lacks Web Share.
  resetShareButtons(false);

  let countdown = 3;
  renderCountdown(countdownEl, countdown, lang);
  countdownEl.hidden = false;

  popup.showModal();
  launchConfetti();

  shareCountdownInterval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      renderCountdown(countdownEl, countdown, lang);
    } else {
      cleanupShareCountdown();
      window.open(githubUrl, '_blank', 'noopener,noreferrer');
      countdownEl.hidden = true;
      resetShareButtons(true);
    }
  }, 1000);
}

function cleanupShareCountdown() {
  if (shareCountdownInterval) {
    clearInterval(shareCountdownInterval);
    shareCountdownInterval = null;
  }
}

export function initSharePopup(): void {
  // Wire copy-to-clipboard with inline feedback (the Copy pill in the row).
  document.getElementById('share-btn-copy')?.addEventListener('click', async () => {
    const popup = document.getElementById('share-popup') as HTMLDialogElement | null;
    if (!popup) return;
    const rank = Number(popup.dataset.signatoryRank) || 1;
    const lang = navigator.language || 'en';
    const plain = buildMessagePlain(rank, lang);
    const feedback = document.getElementById('share-copy-feedback');
    const fr = isFrench(lang);
    try {
      await navigator.clipboard.writeText(plain);
      if (feedback) {
        feedback.textContent = fr ? 'Message copié' : 'Message copied';
        feedback.hidden = false;
        setTimeout(() => { feedback.hidden = true; }, 1500);
      }
    } catch {
      if (feedback) {
        feedback.textContent = fr ? 'Presse-papier indisponible' : 'Clipboard unavailable';
        feedback.hidden = false;
        setTimeout(() => { feedback.hidden = true; }, 1500);
      }
    }
  });

  const SIGN_TRIGGER = '[data-github-url]';
  document.addEventListener('click', (e) => {
    const signBtn = (e.target as HTMLElement).closest(SIGN_TRIGGER);
    if (signBtn) {
      e.preventDefault();
      const githubUrl = (signBtn as HTMLElement).dataset.githubUrl || '';
      startShareCountdown(githubUrl);
      return;
    }
    // X button — opens in a sized popup, Twitter reliably pre-fills the
    // composer body from the `text=` query param.
    const xLink = (e.target as HTMLElement).closest<HTMLAnchorElement>('#share-btn-x');
    if (xLink && xLink.getAttribute('aria-disabled') !== 'true') {
      e.preventDefault();
      window.open(xLink.getAttribute('href') || '#', 'aidd-share-x', 'noopener,noreferrer,width=750,height=620,scrollbars=yes');
      return;
    }
    // LinkedIn button — LinkedIn has deprecated pre-filling the composer body
    // via URL params (`shareArticle?summary=...` is silently ignored; the
    // official IN/Share plugin exposes only `data-url`). The only path that
    // still reliably pre-fills LinkedIn's composer body in 2025 is the
    // native Web Share API: the OS share sheet carries `text` + `url`, and
    // LinkedIn's share target honors both. Strategy:
    //   1. `navigator.share()` when available (iOS / Android / Chrome / Edge
    //      desktop) → reliable pre-fill via the OS share sheet.
    //   2. Clipboard + LinkedIn popup + a "paste here" hint (Firefox +
    //      older browsers, which still lack Web Share in 2025) → one Cmd/Ctrl-V
    //      away from the composer body being filled.
    // The button stays visible in both cases; the hint only surfaces in the
    // fallback branch, so the common path is unaffected.
    const liLink = (e.target as HTMLElement).closest<HTMLButtonElement>('#share-btn-linkedin');
    if (liLink && !liLink.disabled) {
      e.preventDefault();
      const popup = document.getElementById('share-popup') as HTMLDialogElement | null;
      const rank = popup ? Number(popup.dataset.signatoryRank) || 1 : 1;
      const lang = navigator.language || 'en';
      const fr = isFrench(lang);
      const message = buildMessagePlain(rank, lang);
      const title = fr ? 'Le Manifeste du AI-Driven Development' : 'The Manifesto for AI-Driven Development';
      const nav = navigator as Navigator & { share?: (d: unknown) => Promise<void>; canShare?: (d: unknown) => boolean };
      if (typeof nav.share === 'function' && (typeof nav.canShare !== 'function' || nav.canShare({ text: message, url: SHARE_URL }))) {
        nav.share({ text: message, url: SHARE_URL, title }).catch(() => { /* dismissed */ });
        return;
      }
      // Fallback — copy to clipboard (best-effort), open the LinkedIn popup
      // (url-only), and surface the localized hint so the user knows the
      // body is already in their clipboard, one paste away.
      (async () => {
        let copied = false;
        try { await navigator.clipboard.writeText(message); copied = true; } catch {}
        const features = 'noopener,noreferrer,width=750,height=620,scrollbars=yes';
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`, 'aidd-share-li', features);
        if (copied) {
          const hint = document.getElementById('share-linkedin-hint');
          if (hint) {
            hint.textContent = fr ? 'Message copié — collez-le sur LinkedIn' : 'Message copied — paste it on LinkedIn';
            hint.hidden = false;
            setTimeout(() => { hint.hidden = true; }, 4000);
          }
        }
      })();
    }
  });

  const sharePopup = document.getElementById('share-popup') as HTMLDialogElement | null;
  if (sharePopup) {
    sharePopup.addEventListener('close', cleanupShareCountdown);
  }

  const sharePopupClose = document.getElementById('share-popup-close');
  if (sharePopupClose) {
    sharePopupClose.addEventListener('click', () => {
      sharePopup?.close();
      cleanupShareCountdown();
    });
  }
}
