/**
 * Tweaks panel — live theming written onto documentElement (accent hue, paper
 * palette, serif scale, rainbow principle colors), synced with the parent
 * iframe edit-mode bridge.
 *
 * Extracted from ClientApp.astro to keep that component within the .astro LOC
 * budget (AC-6). The TWEAK_DEFAULTS literal — and its EDITMODE sentinel — stays
 * in ClientApp.astro and is passed in here, so the parent-iframe editor keeps
 * finding the markers verbatim. Call initTweaks(defaults) once on hydration.
 */
export interface TweakState {
  accentHue: number;
  paper: string;
  serifScale: number;
  rainbow: boolean;
}

export function initTweaks(defaults: TweakState): void {
  let state: TweakState = { ...defaults };

  function applyPrincipleColors() {
    document.querySelectorAll<HTMLElement>('.principle').forEach((el) => {
      const hueAttr = (el.style as CSSStyleDeclaration).getPropertyValue('--p-hue');
      if (state.rainbow) {
        const h = hueAttr ? parseInt(hueAttr, 10) : state.accentHue;
        el.style.setProperty('--p-color', `oklch(0.5 0.18 ${h})`);
      } else {
        el.style.removeProperty('--p-color');
      }
    });
  }

  function applyState() {
    const root = document.documentElement.style;
    root.setProperty('--accent', `oklch(0.54 0.246 ${state.accentHue})`);
    root.setProperty('--accent-soft', `oklch(0.54 0.246 ${state.accentHue} / 0.10)`);
    // Three light papers. Default ("ice") matches tokens.css :root (#eef2ff).
    if (state.paper === 'warm') {
      root.setProperty('--paper', 'oklch(0.972 0.012 80)');
      root.setProperty('--paper-2', 'oklch(0.955 0.014 78)');
      root.setProperty('--paper-3', 'oklch(0.918 0.016 76)');
      root.setProperty('--ink', 'oklch(0.20 0.04 60)');
      root.setProperty('--ink-2', 'oklch(0.40 0.03 62)');
      root.setProperty('--ink-3', 'oklch(0.56 0.025 64)');
      root.setProperty('--rule', 'oklch(0.86 0.016 70)');
    } else if (state.paper === 'slate') {
      root.setProperty('--paper', 'oklch(0.95 0.008 250)');
      root.setProperty('--paper-2', 'oklch(0.93 0.010 250)');
      root.setProperty('--paper-3', 'oklch(0.895 0.012 250)');
      root.setProperty('--ink', 'oklch(0.22 0.05 258)');
      root.setProperty('--ink-2', 'oklch(0.42 0.04 260)');
      root.setProperty('--ink-3', 'oklch(0.58 0.03 262)');
      root.setProperty('--rule', 'oklch(0.85 0.014 256)');
    } else {
      root.setProperty('--paper', 'oklch(0.962 0.018 275)');
      root.setProperty('--paper-2', 'oklch(0.945 0.016 274)');
      root.setProperty('--paper-3', 'oklch(0.910 0.018 272)');
      root.setProperty('--ink', 'oklch(0.181 0.117 266)');
      root.setProperty('--ink-2', 'oklch(0.385 0.075 268)');
      root.setProperty('--ink-3', 'oklch(0.560 0.045 270)');
      root.setProperty('--rule', 'oklch(0.855 0.025 272)');
    }
    document.documentElement.style.fontSize = (16 * state.serifScale) + 'px';
    document.querySelectorAll<HTMLElement>('#swatches .swatch').forEach((b) => {
      const selected = Number(b.dataset.hue) === state.accentHue;
      b.classList.toggle('on', selected);
      b.setAttribute('aria-pressed', String(selected));
    });
    const ps = document.getElementById('paperSel') as HTMLSelectElement | null; if (ps) ps.value = state.paper;
    const ss = document.getElementById('serifScale') as HTMLInputElement | null; if (ss) ss.value = String(state.serifScale);
    const rb = document.getElementById('rainbowToggle') as HTMLInputElement | null; if (rb) rb.checked = !!state.rainbow;
    applyPrincipleColors();
  }

  function persist(patch: Partial<TweakState>) {
    state = { ...state, ...patch };
    applyState();
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*'); } catch {}
  }

  window.addEventListener('message', (e) => {
    const d: any = e.data || {};
    if (d.type === '__activate_edit_mode') document.getElementById('tweaks')?.classList.add('on');
    if (d.type === '__deactivate_edit_mode') document.getElementById('tweaks')?.classList.remove('on');
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch {}

  document.getElementById('swatches')?.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.swatch'); if (!b) return;
    persist({ accentHue: Number(b.dataset.hue) });
  });
  document.getElementById('paperSel')?.addEventListener('change', (e) => persist({ paper: (e.target as HTMLSelectElement).value }));
  document.getElementById('serifScale')?.addEventListener('input', (e) => persist({ serifScale: Number((e.target as HTMLInputElement).value) }));
  document.getElementById('rainbowToggle')?.addEventListener('change', (e) => persist({ rainbow: (e.target as HTMLInputElement).checked }));
  applyState();
}
