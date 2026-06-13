export interface Principle {
  /** Principle number (display, e.g. "01") */
  n: string;
  /** Roman / index ref (e.g. "1") */
  r: string;
  /** Hue in degrees for oklch */
  hue: number;
  /** HTML lead string (contains <span class="hl"> markers) */
  lead: string;
  /** HTML sub paragraph */
  sub: string;
  /** Long-form essay paragraphs (HTML), shown in focus overlay (optional) */
  essay?: string[];
}

export const PRINCIPLES: Principle[] = [
  { n: "01", r: "1", hue: 28, lead: 'We deliver working software to production, faster and <span class="hl">without debt.</span>', sub: 'Speed and quality are not in conflict. They are the same discipline, practiced twice.' },
  { n: "02", r: "2", hue: 50, lead: 'Planning is our <span class="hl">first act of collaboration</span> with AI.', sub: 'The quality of our plan determines the quality of our output. Everything downstream inherits it.' },
  { n: "03", r: "3", hue: 80, lead: 'We break complexity down until it can be <span class="hl">delegated cleanly.</span>', sub: 'Clarity of scope is clarity of output. Ambiguity compounds; decomposition dissolves it.' },
  { n: "04", r: "4", hue: 120, lead: 'Context is our <span class="hl">primary asset.</span>', sub: 'We invest in it, maintain it, and protect it from noise. A polluted context produces polluted code.' },
  { n: "05", r: "5", hue: 160, lead: 'We apply the same standards to AI-generated code as to <span class="hl">any code we write by hand.</span>', sub: 'There is no lower bar for generated work. Review, test, reject — the same rituals apply.' },
  { n: "06", r: "6", hue: 200, lead: 'We are <span class="hl">the architects.</span> Every line that ships is our line — regardless of what produced it.', sub: 'Authorship is not about the keystroke. It is about the judgment that sent the keystroke.' },
  { n: "07", r: "7", hue: 240, lead: 'We use AI to go further in <span class="hl">what we already understand.</span>', sub: 'We do not delegate what we have not mastered. Competence first; acceleration second.' },
  { n: "08", r: "8", hue: 270, lead: 'When a session loses coherence, <span class="hl">we restart.</span>', sub: 'A clean context is always cheaper than a compacted one. Fresh starts are not failures — they are hygiene.' },
  { n: "09", r: "9", hue: 300, lead: 'We choose a consistent methodology over <span class="hl">a collection of tools.</span>', sub: 'The method outlasts any model. Tools rotate; practice accrues.' },
  { n: "10", r: "10", hue: 330, lead: 'What one of us discovers, <span class="hl">all of us adopt.</span>', sub: 'The community is our compound learning machine. Hoarded technique decays; shared technique compounds.' },
  { n: "11", r: "11", hue: 10, lead: 'We recognize AI\'s limits as <span class="hl">signals</span> — not walls to push through, but invitations to decompose further.', sub: 'When the model stalls, the prompt is wrong. When the prompt is wrong, the scope is wrong.' },
  { n: "12", r: "12", hue: 28, lead: 'We do not stop learning because AI can code. <span class="hl">We learn faster because it can.</span>', sub: 'The leverage is real. What it multiplies is up to us.' },
];
