/**
 * Each "value" pairs a left (preferred) concept with a right (devalued) concept,
 * shown in the values plate. Visual ASCII art is rendered inline in the page
 * (see `Values.astro`). This file holds the structured editorial content.
 */
export interface ValueEntry {
  /** 1-based folio */
  n: number;
  /** Anim id used by the original (`v1` … `v4`) */
  anim: 'v1' | 'v2' | 'v3' | 'v4';
  /** Left (preferred) noun */
  left: string;
  /** Right (devalued) noun */
  right: string;
  /** Short note rendered under the pair (HTML allowed) */
  note: string;
  /** Stable id used by API targets (vote/feedback) */
  id: string;
}

export const VALUES: ValueEntry[] = [
  {
    n: 1,
    anim: 'v1',
    id: 'V-1',
    left: 'Direction',
    right: 'drift',
    note: 'We <em class="emph">steer<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 4 Q 30 2, 55 5 T 98 3"/></svg></em>. We are not <em class="emph">carried<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 5 Q 28 3, 52 6 T 98 4"/></svg></em>.',
  },
  {
    n: 2,
    anim: 'v2',
    id: 'V-2',
    left: 'Methods',
    right: 'models',
    note: 'The method <em class="emph">stays<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 4 Q 32 2, 56 5 T 98 4"/></svg></em>. Models <em class="emph">rotate<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 5 Q 30 3, 54 6 T 98 3"/></svg></em>.',
  },
  {
    n: 3,
    anim: 'v3',
    id: 'V-3',
    left: 'Evolution',
    right: 'perfection',
    note: 'Code is <em class="emph">never final<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 4 Q 30 2, 55 5 T 98 3"/></svg></em>. Why ship it <em class="emph">frozen<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 5 Q 30 3, 52 6 T 98 4"/></svg></em>?',
  },
  {
    n: 4,
    anim: 'v4',
    id: 'V-4',
    left: 'Learning',
    right: 'shortcut',
    note: 'Ease <em class="emph">gifted<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 4 Q 32 2, 56 5 T 98 4"/></svg></em>. Growth <em class="emph">earned<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 5 Q 30 3, 54 6 T 98 3"/></svg></em>.',
  },
];
