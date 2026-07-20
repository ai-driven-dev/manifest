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

/** One axis of the AIDD vs vibe coding contrast. */
export interface VersusRow {
  axis: string;
  aidd: string;
  vibe: string;
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

export const VERSUS: VersusRow[] = [
  {
    axis: "Posture",
    aidd: "Deliberate partnership",
    vibe: "Improvisation — “give in to the vibes”",
  },
  {
    axis: "Authorship",
    aidd: "You are the architect; every line is yours",
    vibe: "The model drives; you forget the code exists",
  },
  {
    axis: "Review",
    aidd: "Same standards as hand-written — review, test, reject",
    vibe: "Accept the output and move on",
  },
  {
    axis: "Planning",
    aidd: "The first act of collaboration",
    vibe: "Prompt and pray",
  },
  {
    axis: "Understanding",
    aidd: "Extends what you already understand",
    vibe: "Ships what you don’t",
  },
  {
    axis: "When it stalls",
    aidd: "A signal to decompose further",
    vibe: "Regenerate until it runs",
  },
  {
    axis: "Output",
    aidd: "Production software, without debt",
    vibe: "Quick experiments, demos, throwaways",
  },
  {
    axis: "Best for",
    aidd: "Software meant to last",
    vibe: "Prototypes you’ll discard",
  },
];
