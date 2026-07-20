/**
 * Each "value" pairs a left (preferred) concept with a right (devalued) concept,
 * shown in the values plate. The four values are the core of the manifesto, laid
 * out as a 2×2 quadrant (see `Quadrant.astro`) that builds up the new shape of a
 * developer's value: Method · Ownership · Understanding · Outcome. Visual ASCII art
 * is rendered inline (see `ValueArt.astro`). This file holds the structured content.
 */
export interface ValueEntry {
  /** 1-based folio */
  n: number;
  /** Anim id used by the ASCII art (`v1` … `v4`) */
  anim: "v1" | "v2" | "v3" | "v4";
  /** Left (preferred) noun */
  left: string;
  /** Right (devalued) noun */
  right: string;
  /** Quadrant cell label — the essence word shown in the 2×2 grid */
  quad: string;
  /** Short note rendered under the pair (HTML allowed) */
  note: string;
  /** Long-form description of the principle (plain text / light HTML) */
  body: string;
  /** Stable id (kept for anchors and reveal targeting) */
  id: string;
}

export const VALUES: ValueEntry[] = [
  {
    n: 1,
    anim: "v1",
    id: "V-1",
    left: "Method",
    right: "Model",
    quad: "Method",
    note: 'The method <em class="emph">endures<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 4 Q 30 2, 55 5 T 98 3"/></svg></em>. The model <em class="emph">fades<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 5 Q 30 3, 52 6 T 98 4"/></svg></em>.',
    body: "<strong>Bet on the method, not the model — every LLM release will fade</strong>.<br> Your method endures and standardizes your team’s practices across models, vendors, and versions.",
  },
  {
    n: 2,
    anim: "v2",
    id: "V-2",
    left: "Ownership",
    right: "Delegation",
    quad: "Ownership",
    note: 'You <em class="emph">own<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 4 Q 32 2, 56 5 T 98 4"/></svg></em> it. You don’t just <em class="emph">delegate<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 5 Q 30 3, 54 6 T 98 3"/></svg></em> it.',
    body: "<strong>You own what you ship — even what the AI wrote</strong>.<br>Every commit is signed by a human; the AI accelerates, you decide.",
  },
  {
    n: 3,
    anim: "v3",
    id: "V-3",
    left: "Understanding",
    right: "Acceptance",
    quad: "Understanding",
    note: 'You <em class="emph">understand<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 4 Q 30 2, 55 5 T 98 3"/></svg></em> before you <em class="emph">accept<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 5 Q 30 3, 52 6 T 98 4"/></svg></em>.',
    body: "<strong>Don’t accept what you don’t understand</strong>.<br>The AI is your collaborator — not your replacement.",
  },
  {
    n: 4,
    anim: "v4",
    id: "V-4",
    left: "Outcome",
    right: "Output",
    quad: "Outcome",
    note: 'Ship <em class="emph">outcomes<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 4 Q 32 2, 56 5 T 98 4"/></svg></em>. Not <em class="emph">output<svg class="und" aria-hidden="true" viewBox="0 0 100 7" preserveAspectRatio="none"><path d="M2 5 Q 30 3, 54 6 T 98 3"/></svg></em>.',
    body: "<strong>Writing code is easy. Creating useful outcomes is not</strong>.<br>Ship small, learn quickly, and measure results for users, product reliability, and the business — not lines, tokens, or commits.",
  },
];
