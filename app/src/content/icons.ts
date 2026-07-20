/**
 * Hand-drawn editorial line icons — one per value (V-1…V-4) and one per
 * principle (01…12). Same visual register as the fleuron in `Values.astro` and
 * the wavy `strike`/`und` SVGs: thin `currentColor` stroke, slightly irregular
 * curves, no closed-perfect circles. Rendered inline by `Icon.astro`.
 *
 * Drawing conventions (keep new icons consistent):
 * - The `paths` string is the *inner* markup of a `viewBox="0 0 32 32"` svg.
 * - Stroke is inherited from the `<svg>` (currentColor, width 1.4, round caps).
 *   Do NOT set `stroke`, `stroke-width`, or any hex/hsl/rgb colour here.
 * - Every drawn `<path>`/`<circle>` carries `pathLength="100"` so the CSS
 *   dash-draw reveal (dasharray:100 → dashoffset 100→0) is uniform per shape.
 * - A small solid dot may use `fill="currentColor"` (echoes the fleuron centre);
 *   no other fills.
 * - Prefer C/Q curves with 0.5–1.5u wobble over straight lines; leave arcs open
 *   for the "drawn by hand" feel.
 */
export type ValueIconKey = 'V-1' | 'V-2' | 'V-3' | 'V-4';
export type PrincipleIconKey =
  | '01' | '02' | '03' | '04' | '05' | '06'
  | '07' | '08' | '09' | '10' | '11' | '12';
export type IconKey = ValueIconKey | PrincipleIconKey;

export interface IconDef {
  /** Accessible/diagnostic label — not rendered (svg is aria-hidden). */
  label: string;
  /** Inner markup of the 0 0 32 32 svg. */
  paths: string;
}

export const ICONS: Record<IconKey, IconDef> = {
  // ── Values ────────────────────────────────────────────────────────────
  // V-1 Method — a looping workflow path (the road, not the vehicle).
  'V-1': {
    label: 'Method — a recurring loop with a forward arrow',
    paths: `
      <path pathLength="100" d="M9 11 C 4 12, 4 21, 10 22 C 16 23, 17 13, 23 14 C 28 15, 28 23, 23 23.4" fill="none"/>
      <path pathLength="100" d="M20 21 L 23.4 23.6 L 25.6 20" fill="none"/>
      <circle pathLength="100" cx="9" cy="11" r="1.4" fill="currentColor" stroke="none"/>`,
  },
  // V-2 Ownership — a nib/pen signing a wavy line (the human sign-off).
  'V-2': {
    label: 'Ownership — a pen nib signing a line',
    paths: `
      <path pathLength="100" d="M19 6 L 24.5 11.5 L 14 22 L 9.5 23.5 L 11 18.5 Z" fill="none"/>
      <path pathLength="100" d="M12.5 20.5 L 15.5 17.5" fill="none"/>
      <path pathLength="100" d="M5 26 C 9 24, 12 28, 16 26 C 20 24, 23 27.5, 27 25.5" fill="none"/>`,
  },
  // V-3 Understanding — an open eye, drawn by hand (echoes the fleuron centre).
  'V-3': {
    label: 'Understanding — an open eye',
    paths: `
      <path pathLength="100" d="M4 16 C 10 9, 22 9, 28 16" fill="none"/>
      <path pathLength="100" d="M4 16 C 10 23, 22 23, 28 16" fill="none"/>
      <path pathLength="100" d="M16 12.5 C 12 12.5, 12 19.5, 16 19.5 C 20 19.5, 20 12.5, 16 12.5" fill="none"/>
      <circle pathLength="100" cx="16" cy="16" r="1.5" fill="currentColor" stroke="none"/>`,
  },
  // V-4 Outcome — a target with an arrow planted at the centre.
  'V-4': {
    label: 'Outcome — an arrow striking the centre of a target',
    paths: `
      <path pathLength="100" d="M16 5.5 C 10 5.5, 5.5 10, 5.5 16 C 5.5 22, 10 26.5, 16 26.5 C 22 26.5, 26.5 22, 26.5 16 C 26.5 11, 23 6.5, 18 5.7" fill="none"/>
      <path pathLength="100" d="M16 11 C 13.2 11, 11 13.2, 11 16 C 11 18.8, 13.2 21, 16 21 C 18.6 21, 20.8 19, 21 16.4" fill="none"/>
      <path pathLength="100" d="M24 8 L 16 16" fill="none"/>
      <path pathLength="100" d="M24 8 L 24.5 11.5 L 21 11" fill="none"/>
      <circle pathLength="100" cx="16" cy="16" r="1.3" fill="currentColor" stroke="none"/>`,
  },

  // ── Principles ────────────────────────────────────────────────────────
  // 01 Verified increments — release path with checks.
  '01': {
    label: 'A release path with verified checkpoints',
    paths: `
      <path pathLength="100" d="M7 8 C 12 7, 20 7, 25 8" fill="none"/>
      <path pathLength="100" d="M8 14 C 13 13, 19 13, 24 14" fill="none"/>
      <path pathLength="100" d="M8 20 C 13 19, 19 19, 24 20" fill="none"/>
      <path pathLength="100" d="M9 26 C 14 25, 20 25, 25 26" fill="none"/>
      <path pathLength="100" d="M9 13 L 11 15 L 14 11" fill="none"/>
      <path pathLength="100" d="M9 19 L 11 21 L 14 17" fill="none"/>
      <path pathLength="100" d="M20 23 L 25 26 L 20 29" fill="none"/>`,
  },
  // 02 Clear spec — a pen making the contract inspectable.
  '02': {
    label: 'A pen tracing a testable specification',
    paths: `
      <path pathLength="100" d="M22 5 L 27 10 L 14 23 L 9 24.5 L 10.5 19.5 Z" fill="none"/>
      <path pathLength="100" d="M6 8 C 10 7, 15 7, 19 8" fill="none"/>
      <path pathLength="100" d="M6 13 C 9 12, 13 12, 16 13" fill="none"/>
      <path pathLength="100" d="M5 27 C 10 25, 16 28, 22 26" fill="none"/>`,
  },
  // 03 Plan before generation — a route with a human gate.
  '03': {
    label: 'A planned route passing through a gate',
    paths: `
      <path pathLength="100" d="M6 24 C 9 15, 14 18, 16 10 C 18 4, 24 6, 27 9" fill="none"/>
      <path pathLength="100" d="M13 12 L 20 12" fill="none"/>
      <path pathLength="100" d="M13 16 L 20 16" fill="none"/>
      <circle pathLength="100" cx="6.5" cy="24" r="1.4" fill="currentColor" stroke="none"/>
      <circle pathLength="100" cx="27" cy="9" r="1.4" fill="currentColor" stroke="none"/>`,
  },
  // 04 Decompose until delegable — one square splitting into leaves.
  '04': {
    label: 'A task decomposing into smaller delegable leaves',
    paths: `
      <path pathLength="100" d="M6 6 L 13 6 L 13 13 L 6 13 Z" fill="none"/>
      <path pathLength="100" d="M19 19 L 26 19 L 26 26 L 19 26 Z" fill="none"/>
      <path pathLength="100" d="M19 6 L 26 6 L 26 13" fill="none"/>
      <path pathLength="100" d="M6 19 L 6 26 L 13 26" fill="none"/>
      <path pathLength="100" d="M13.5 9.5 L 18.5 9.5" fill="none" stroke-dasharray="0.5 2.5"/>
      <path pathLength="100" d="M9.5 13.5 L 9.5 18.5" fill="none" stroke-dasharray="0.5 2.5"/>`,
  },
  // 05 Craft context with code-level care — stacked strata.
  '05': {
    label: 'Stacked context artifacts crafted with code-level care',
    paths: `
      <path pathLength="100" d="M5 11 C 11 8, 21 8, 27 11 C 21 14, 11 14, 5 11" fill="none"/>
      <path pathLength="100" d="M6 16.5 C 12 14, 20 14, 26 16.5" fill="none"/>
      <path pathLength="100" d="M7 21.5 C 12 19.5, 20 19.5, 25 21.5" fill="none"/>
      <path pathLength="100" d="M8 25.5 C 12 24.5, 20 24.5, 24 25.5" fill="none"/>`,
  },
  // 06 Learning for reuse — a note becoming shared memory.
  '06': {
    label: 'A lesson captured into reusable memory',
    paths: `
      <path pathLength="100" d="M8 7 C 12 5.5, 19 5.5, 23 7 L 23 15 C 19 13.5, 12 13.5, 8 15 Z" fill="none"/>
      <path pathLength="100" d="M9 19 C 13 17.5, 19 17.5, 23 19" fill="none"/>
      <path pathLength="100" d="M10 23 C 14 21.8, 18 21.8, 22 23" fill="none"/>
      <path pathLength="100" d="M20 10 C 24 12, 25 16, 22 20" fill="none"/>
      <path pathLength="100" d="M22 20 L 25 19 L 24 16" fill="none"/>`,
  },
  // 07 Own every shipped change — a balanced review scale.
  '07': {
    label: 'A balanced scale for owning generated code',
    paths: `
      <path pathLength="100" d="M16 6.5 L 16 23" fill="none"/>
      <path pathLength="100" d="M7 11 C 11 9, 21 9, 25 11" fill="none"/>
      <path pathLength="100" d="M4 11 C 4 16, 10 16, 10 11" fill="none"/>
      <path pathLength="100" d="M22 11 C 22 16, 28 16, 28 11" fill="none"/>
      <path pathLength="100" d="M11 25.5 C 13.5 23, 18.5 23, 21 25.5" fill="none"/>
      <circle pathLength="100" cx="16" cy="6.5" r="1.3" fill="currentColor" stroke="none"/>`,
  },
  // 08 Evaluate before delegating — target with evidence check.
  '08': {
    label: 'A target with an evidence check mark',
    paths: `
      <path pathLength="100" d="M16 5.5 C 10 5.5, 5.5 10, 5.5 16 C 5.5 22, 10 26.5, 16 26.5 C 22 26.5, 26.5 22, 26.5 16 C 26.5 11, 23 6.5, 18 5.7" fill="none"/>
      <path pathLength="100" d="M16 11 C 13.2 11, 11 13.2, 11 16 C 11 18.8, 13.2 21, 16 21 C 18.6 21, 20.8 19, 21 16.4" fill="none"/>
      <path pathLength="100" d="M10 17 L 14 21 L 23 11" fill="none"/>
      <circle pathLength="100" cx="16" cy="16" r="1.3" fill="currentColor" stroke="none"/>`,
  },
  // 09 Improve the system before forcing the model — reshaping the work.
  '09': {
    label: 'A work shape being clarified before forcing the model',
    paths: `
      <path pathLength="100" d="M7 9 C 11 7, 18 7, 22 9" fill="none"/>
      <path pathLength="100" d="M7 16 C 11 14, 18 14, 22 16" fill="none"/>
      <path pathLength="100" d="M7 23 C 11 21, 18 21, 22 23" fill="none"/>
      <path pathLength="100" d="M24 8 C 27 12, 27 19, 24 23" fill="none"/>
      <path pathLength="100" d="M24 23 L 27 21.5 L 26 18" fill="none"/>
      <path pathLength="100" d="M10 12 L 13 15 L 10 18" fill="none"/>`,
  },
  // 10 Rebuild context when coherence drops — restart from clean memory.
  '10': {
    label: 'A refresh loop rebuilding context from memory',
    paths: `
      <path pathLength="100" d="M23 10 C 18 5, 9 7, 7 14 C 5 21, 12 27, 19 25 C 23.5 23.7, 25.5 19.5, 25 16" fill="none"/>
      <path pathLength="100" d="M23 5.5 L 23.5 10.5 L 18.5 10" fill="none"/>
      <path pathLength="100" d="M11 16 C 14 14.5, 19 14.5, 22 16" fill="none"/>
      <path pathLength="100" d="M12 20 C 15 19, 18 19, 21 20" fill="none"/>`,
  },
  // 11 AI failure as signal — a small flag on a wavy mast.
  '11': {
    label: 'A signal flag marking a failed AI run',
    paths: `
      <path pathLength="100" d="M9 26 C 8.5 19, 9.5 12, 9 5" fill="none"/>
      <path pathLength="100" d="M9 6 C 14 4, 19 9, 24 7 C 23 11, 25 14, 24 16 C 19 14, 14 18, 9 16" fill="none"/>
      <path pathLength="100" d="M5 27 C 7 26, 11 26, 13 27" fill="none"/>`,
  },
  // 12 Transferable practice — a branching history with a shared standard.
  '12': {
    label: 'A transferable practice recorded as a shared standard',
    paths: `
      <path pathLength="100" d="M9 6 L 9 25" fill="none"/>
      <path pathLength="100" d="M9 13 C 15 13, 16 8, 23 8" fill="none"/>
      <path pathLength="100" d="M9 20 C 15 20, 17 25, 24 25" fill="none"/>
      <path pathLength="100" d="M19 5 L 26 5 L 26 11 L 19 11 Z" fill="none"/>
      <circle pathLength="100" cx="9" cy="6" r="1.4" fill="currentColor" stroke="none"/>
      <circle pathLength="100" cx="9" cy="25" r="1.4" fill="currentColor" stroke="none"/>`,
  },
};
