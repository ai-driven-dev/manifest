// Lexicon — the dictionary entry for "AI-Driven Development", adjacent
// practices, and the AIDD vs vibe coding contrast. Editorial content; rendered
// by sections/Definition.astro.
// HTML is allowed in `def` (kept minimal, only <em>).

export interface LexiconEntry {
  /** The defined headword. */
  headword: string;
  /** Short form / acronym. */
  abbr: string;
  /** IPA-style pronunciation. */
  pron: string;
  /** Part of speech. */
  pos: string;
  /** The definition (HTML allowed). */
  def: string;
}

export const ENTRY: LexiconEntry = {
  headword: "AI-Driven Development",
  abbr: "AIDD",
  pron: "/ˌeɪ.aɪ ˈdrɪv.ən dɪˈvɛl.əp.mənt/",
  pos: "noun",
  def: "A way of building software in which a developer works <em>with AI as a deliberate partner</em> — planning, decomposing, and reviewing every change — while remaining the architect accountable for what ships.",
};

/** Practices that overlap with AIDD without being equivalent to it. */
export const RELATED_PRACTICES: string[] = [
  "AI-assisted development",
  "AI pair programming",
  "agentic coding",
  "spec-driven development",
  "context engineering",
];

/** Shared comparison for the homepage and its Markdown representations. */
export const VERSUS_SUMMARY =
  "Vibe coding optimizes for shipping speed without making code quality a requirement. " +
  "AI-Driven Development keeps the same acceleration while building quality, review, " +
  "and maintainability into the delivery process.";
