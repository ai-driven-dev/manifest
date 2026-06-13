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
  // V-4 Impact — a target with an arrow planted at the centre.
  'V-4': {
    label: 'Impact — an arrow striking the centre of a target',
    paths: `
      <path pathLength="100" d="M16 5.5 C 10 5.5, 5.5 10, 5.5 16 C 5.5 22, 10 26.5, 16 26.5 C 22 26.5, 26.5 22, 26.5 16 C 26.5 11, 23 6.5, 18 5.7" fill="none"/>
      <path pathLength="100" d="M16 11 C 13.2 11, 11 13.2, 11 16 C 11 18.8, 13.2 21, 16 21 C 18.6 21, 20.8 19, 21 16.4" fill="none"/>
      <path pathLength="100" d="M24 8 L 16 16" fill="none"/>
      <path pathLength="100" d="M24 8 L 24.5 11.5 L 21 11" fill="none"/>
      <circle pathLength="100" cx="16" cy="16" r="1.3" fill="currentColor" stroke="none"/>`,
  },

  // ── Principles ────────────────────────────────────────────────────────
  // 01 Ship to production, fast, without debt — paper plane + clean trail.
  '01': {
    label: 'A paper plane leaving a clean trail',
    paths: `
      <path pathLength="100" d="M26 6 L 6 14.5 L 14 17.5 L 26 6 Z" fill="none"/>
      <path pathLength="100" d="M14 17.5 L 14.5 25 L 18 20.5" fill="none"/>
      <path pathLength="100" d="M4 26 C 7 24.5, 9 27, 12 25.5" fill="none"/>`,
  },
  // 02 Planning is the first act of collaboration — pencil drawing a plan.
  '02': {
    label: 'A pencil tracing a dotted plan on ruled paper',
    paths: `
      <path pathLength="100" d="M22 5 L 27 10 L 14 23 L 9 24.5 L 10.5 19.5 Z" fill="none"/>
      <path pathLength="100" d="M5 27 L 8 24" fill="none" stroke-dasharray="0.5 3"/>
      <path pathLength="100" d="M11 27.5 L 27 27.5" fill="none" stroke-dasharray="0.5 3"/>`,
  },
  // 03 Decompose until cleanly delegable — one square splitting into four.
  '03': {
    label: 'A square decomposing into four smaller squares',
    paths: `
      <path pathLength="100" d="M6 6 L 13 6 L 13 13 L 6 13 Z" fill="none"/>
      <path pathLength="100" d="M19 19 L 26 19 L 26 26 L 19 26 Z" fill="none"/>
      <path pathLength="100" d="M19 6 L 26 6 L 26 13" fill="none"/>
      <path pathLength="100" d="M6 19 L 6 26 L 13 26" fill="none"/>
      <path pathLength="100" d="M13.5 9.5 L 18.5 9.5" fill="none" stroke-dasharray="0.5 2.5"/>
      <path pathLength="100" d="M9.5 13.5 L 9.5 18.5" fill="none" stroke-dasharray="0.5 2.5"/>`,
  },
  // 04 Context is the primary asset — stacked strata, the top one protected.
  '04': {
    label: 'Stacked context strata with the top layer underlined',
    paths: `
      <path pathLength="100" d="M5 11 C 11 8, 21 8, 27 11 C 21 14, 11 14, 5 11" fill="none"/>
      <path pathLength="100" d="M6 16.5 C 12 14, 20 14, 26 16.5" fill="none"/>
      <path pathLength="100" d="M7 21.5 C 12 19.5, 20 19.5, 25 21.5" fill="none"/>
      <path pathLength="100" d="M8 25.5 C 12 24.5, 20 24.5, 24 25.5" fill="none"/>`,
  },
  // 05 Same standards for AI code — a balanced scale.
  '05': {
    label: 'A balanced two-pan scale',
    paths: `
      <path pathLength="100" d="M16 6.5 L 16 23" fill="none"/>
      <path pathLength="100" d="M7 11 C 11 9, 21 9, 25 11" fill="none"/>
      <path pathLength="100" d="M4 11 C 4 16, 10 16, 10 11" fill="none"/>
      <path pathLength="100" d="M22 11 C 22 16, 28 16, 28 11" fill="none"/>
      <path pathLength="100" d="M11 25.5 C 13.5 23, 18.5 23, 21 25.5" fill="none"/>
      <circle pathLength="100" cx="16" cy="6.5" r="1.3" fill="currentColor" stroke="none"/>`,
  },
  // 06 We are the architects — a drafting compass tracing an arc.
  '06': {
    label: 'A drafting compass tracing an arc',
    paths: `
      <path pathLength="100" d="M16 6 L 9 24" fill="none"/>
      <path pathLength="100" d="M16 6 L 23 24" fill="none"/>
      <path pathLength="100" d="M16 6 C 14.5 7.5, 17.5 7.5, 16 6" fill="none"/>
      <path pathLength="100" d="M7 26.5 C 13 22.5, 19 22.5, 25 26.5" fill="none"/>
      <circle pathLength="100" cx="16" cy="6" r="1.4" fill="currentColor" stroke="none"/>`,
  },
  // 07 Go further in what we understand — arrow crossing a milestone, then dotted.
  '07': {
    label: 'A solid arrow crossing a milestone then continuing dotted',
    paths: `
      <path pathLength="100" d="M4 16 C 8 15, 12 17, 15 16" fill="none"/>
      <path pathLength="100" d="M15 9 L 15 23" fill="none"/>
      <path pathLength="100" d="M17 16 C 21 15, 25 17, 28 16" fill="none" stroke-dasharray="0.5 3"/>
      <path pathLength="100" d="M25 13 L 28.5 16 L 25 19" fill="none"/>`,
  },
  // 08 Lost coherence → restart — an irregular refresh loop with a spark.
  '08': {
    label: 'A refresh loop with a restart spark',
    paths: `
      <path pathLength="100" d="M23 10 C 18 5, 9 7, 7 14 C 5 21, 12 27, 19 25 C 23.5 23.7, 25.5 19.5, 25 16" fill="none"/>
      <path pathLength="100" d="M23 5.5 L 23.5 10.5 L 18.5 10" fill="none"/>
      <path pathLength="100" d="M16 13 L 13.5 17 L 17 17 L 14.5 21" fill="none"/>`,
  },
  // 09 Methodology over a pile of tools — an open book above scattered dots.
  '09': {
    label: 'An open book above scattered tool dots',
    paths: `
      <path pathLength="100" d="M16 9 C 12 6, 6 6.5, 5 8 L 5 19 C 6 17.5, 12 17, 16 20" fill="none"/>
      <path pathLength="100" d="M16 9 C 20 6, 26 6.5, 27 8 L 27 19 C 26 17.5, 20 17, 16 20" fill="none"/>
      <path pathLength="100" d="M16 9 L 16 20" fill="none"/>
      <circle pathLength="100" cx="9" cy="25" r="1.3" fill="currentColor" stroke="none"/>
      <circle pathLength="100" cx="16" cy="26.5" r="1.3" fill="currentColor" stroke="none"/>
      <circle pathLength="100" cx="23" cy="25" r="1.3" fill="currentColor" stroke="none"/>`,
  },
  // 10 What one discovers, all adopt — three linked nodes (community).
  '10': {
    label: 'Three linked nodes forming a community',
    paths: `
      <path pathLength="100" d="M9 9 C 13 12, 13 18, 9 21" fill="none"/>
      <path pathLength="100" d="M11 8 C 16 7, 21 9, 23 12" fill="none"/>
      <path pathLength="100" d="M23 14 C 22 18, 17 22, 11 22" fill="none"/>
      <circle pathLength="100" cx="8" cy="8" r="2.4" fill="none"/>
      <circle pathLength="100" cx="24" cy="12" r="2.4" fill="none"/>
      <circle pathLength="100" cx="10" cy="23" r="2.4" fill="none"/>`,
  },
  // 11 AI's limits are signals — a small flag on a wavy mast.
  '11': {
    label: 'A signal flag on a wavy mast',
    paths: `
      <path pathLength="100" d="M9 26 C 8.5 19, 9.5 12, 9 5" fill="none"/>
      <path pathLength="100" d="M9 6 C 14 4, 19 9, 24 7 C 23 11, 25 14, 24 16 C 19 14, 14 18, 9 16" fill="none"/>
      <path pathLength="100" d="M5 27 C 7 26, 11 26, 13 27" fill="none"/>`,
  },
  // 12 Learn faster because AI can code — an ascending sprout/spiral.
  '12': {
    label: 'An ascending sprout with two leaves',
    paths: `
      <path pathLength="100" d="M16 27 C 15 22, 15 15, 17 9 C 17.5 7, 17 6, 16 5" fill="none"/>
      <path pathLength="100" d="M16 16 C 11 16, 8 13, 8 9 C 12 9, 15 11, 16 15" fill="none"/>
      <path pathLength="100" d="M17 12 C 21 11, 24 8, 24 5 C 20.5 5.5, 18 7.5, 17 11" fill="none"/>
      <path pathLength="100" d="M11 27 C 14 26, 18 26, 21 27" fill="none"/>`,
  },
};
