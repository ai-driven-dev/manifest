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
  /** Compact framework trace associated with the principle */
  proof: string;
  /** Long-form essay paragraphs (HTML), shown in focus overlay (optional) */
  essay?: string[];
}

export const PRINCIPLES: Principle[] = [
  { n: "01", r: "1", hue: 28, lead: 'Ship in <span class="hl">verified increments.</span>', sub: 'Working software is the output of spec, plan, tests, review, and release.', proof: 'aidd-dev:00-sdlc' },
  { n: "02", r: "2", hue: 50, lead: 'Start from a <span class="hl">clear spec.</span>', sub: 'A story, PRD, or spec gives AI work a contract humans can inspect.', proof: 'aidd-pm:04-spec' },
  { n: "03", r: "3", hue: 80, lead: 'Plan before <span class="hl">generation.</span>', sub: 'The plan is the handoff between human judgment and agent execution.', proof: 'aidd-dev:01-plan' },
  { n: "04", r: "4", hue: 120, lead: 'Decompose until <span class="hl">delegable.</span>', sub: 'Small tasks survive async work, model changes, and team handoffs.', proof: 'aidd-dev:10-todo + 02-implement' },
  { n: "05", r: "5", hue: 160, lead: 'Craft context with the <span class="hl">care we give code.</span>', sub: 'Specs, markdown, rules, skills, and memory deserve the same quality bar as software.', proof: 'aidd-context:02-project-memory' },
  { n: "06", r: "6", hue: 200, lead: 'Capture learning for <span class="hl">reuse.</span>', sub: 'Each lesson becomes memory, a rule, a decision, or a skill others can use.', proof: 'aidd-context:10-learn' },
  { n: "07", r: "7", hue: 240, lead: 'Own every <span class="hl">shipped change.</span>', sub: 'AI may produce it; humans approve, merge, and maintain it.', proof: 'aidd-dev:05-review' },
  { n: "08", r: "8", hue: 270, lead: 'Do not delegate what you <span class="hl">cannot evaluate.</span>', sub: 'Use AI where you can judge tradeoffs, read the output, and prove behavior.', proof: 'aidd-dev:03-assert + 05-review' },
  { n: "09", r: "9", hue: 300, lead: 'Improve the system before <span class="hl">forcing the model.</span>', sub: 'When output degrades, clarify boundaries, names, tests, and context before asking harder.', proof: 'aidd-dev:07-refactor' },
  { n: "10", r: "10", hue: 330, lead: 'Rebuild context when <span class="hl">coherence drops.</span>', sub: 'Reset from memory, docs, rules, and the current plan instead of improvising.', proof: 'aidd-context:02-project-memory' },
  { n: "11", r: "11", hue: 10, lead: 'Treat AI failure as <span class="hl">a signal.</span>', sub: 'When the model stalls, inspect scope, context, assumptions, and tests before pushing harder.', proof: 'aidd-dev:08-debug + aidd-refine:02-challenge' },
  { n: "12", r: "12", hue: 28, lead: 'Make the practice <span class="hl">transferable.</span>', sub: 'A shared method lets different people produce the same quality of code across tools.', proof: 'aidd-vcs:01-commit + 02-pull-request + 03-release-tag' },
];
