export interface TermLine {
  /** HTML content of the line */
  t: string;
  /** Animation delay in ms */
  d: number;
}

export interface Term {
  title: string;
  lines: TermLine[];
}

export const TERMS: Term[] = [
  {
    title: "demo · release ritual",
    lines: [
      { t: '<span class="prompt">$</span> ship <span class="arg">one-verified-slice</span>', d: 0 },
      { t: '<span class="dim">contract</span>  <span class="ok">✓ written</span>', d: 350 },
      { t: '<span class="dim">plan</span>      <span class="ok">✓ accepted</span>', d: 650 },
      { t: '<span class="dim">change</span>    <span class="ok">✓ reviewed</span>', d: 950 },
      { t: '<span class="dim">checks</span>    <span class="ok">✓ green</span>', d: 1250 },
      { t: '<span class="dim">aidd-dev:00-sdlc keeps the loop honest.</span><span class="cursor"></span>', d: 1550 },
    ],
  },
  {
    title: "demo · testable contract",
    lines: [
      { t: '<span class="prompt">$</span> turn idea into <span class="arg">contract</span>', d: 0 },
      { t: '<span class="tree">├── actor</span>       <span class="ok">✓ named</span>', d: 400 },
      { t: '<span class="tree">├── outcome</span>     <span class="ok">✓ observable</span>', d: 750 },
      { t: '<span class="tree">├── acceptance</span>  <span class="ok">✓ testable</span>', d: 1100 },
      { t: '<span class="tree">└── non-goals</span>    <span class="ok">✓ bounded</span>', d: 1450 },
      { t: '<span class="dim">aidd-pm:04-spec before generation.</span><span class="cursor"></span>', d: 1800 },
    ],
  },
  {
    title: "demo · planned generation",
    lines: [
      { t: '<span class="prompt">$</span> map path <span class="arg">before-model-writes</span>', d: 0 },
      { t: '<span class="dim">phase 1</span> data shape       <span class="ok">✓</span>', d: 400 },
      { t: '<span class="dim">phase 2</span> user journey     <span class="ok">✓</span>', d: 750 },
      { t: '<span class="dim">phase 3</span> failure states   <span class="ok">✓</span>', d: 1100 },
      { t: '<span class="dim">gate</span>    review criteria   <span class="ok">✓</span>', d: 1450 },
      { t: '<span class="dim">aidd-dev:01-plan writes judgment down.</span><span class="cursor"></span>', d: 1800 },
    ],
  },
  {
    title: "demo · delegable scope",
    lines: [
      { t: '<span class="prompt">$</span> task <span class="arg">split</span> "change billing owner"', d: 0 },
      { t: '<span class="tree">├── api</span>      <span class="dim">PATCH /billing/owner</span>', d: 450 },
      { t: '<span class="tree">├── auth</span>     <span class="dim">permission boundary</span>', d: 800 },
      { t: '<span class="tree">├── audit</span>    <span class="dim">owner-change log</span>', d: 1150 },
      { t: '<span class="tree">└── tests</span>    <span class="dim">unit + e2e</span>', d: 1500 },
      { t: '<span class="ok">4 leaves</span> · each safe to delegate<span class="cursor"></span>', d: 1850 },
    ],
  },
  {
    title: "demo · crafted context",
    lines: [
      { t: '<span class="prompt">$</span> write <span class="arg">context-as-carefully-as-code</span>', d: 0 },
      { t: '<span class="tree">├── spec.md</span>     <span class="ok">✓ precise</span>', d: 400 },
      { t: '<span class="tree">├── rules.md</span>    <span class="ok">✓ usable</span>', d: 750 },
      { t: '<span class="tree">├── memory.md</span>   <span class="ok">✓ current</span>', d: 1100 },
      { t: '<span class="tree">└── skills/</span>     <span class="ok">✓ reusable</span>', d: 1450 },
      { t: '<span class="dim">aidd-context:02 keeps context engineered.</span><span class="cursor"></span>', d: 1800 },
    ],
  },
  {
    title: "demo · reusable learning",
    lines: [
      { t: '<span class="prompt">$</span> capture <span class="arg">what-worked</span>', d: 0 },
      { t: '<span class="dim">decision</span>  token strategy        <span class="ok">✓</span>', d: 450 },
      { t: '<span class="dim">rule</span>      no hidden UI          <span class="ok">✓</span>', d: 850 },
      { t: '<span class="dim">skill</span>     release checklist     <span class="ok">✓</span>', d: 1250 },
      { t: '<span class="dim">team reuse</span>                  <span class="ok">✓</span>', d: 1650 },
      { t: '<span class="dim">aidd-context:05-learn makes it durable.</span><span class="cursor"></span>', d: 2000 },
    ],
  },
  {
    title: "demo · human ownership",
    lines: [
      { t: '<span class="dim">diff --generated src/billing.ts</span>', d: 0 },
      { t: '<span class="diff"><span class="plus">+ transferOwner(account, user)</span></span>', d: 450 },
      { t: '<span class="prompt">$</span> review <span class="arg">as-maintainer</span>', d: 900 },
      { t: '<span class="dim">human approval</span>    <span class="ok">✓</span>', d: 1250 },
      { t: '<span class="dim">maintainer</span>        <span class="ok">✓ assigned</span>', d: 1600 },
      { t: '<span class="dim">aidd-dev:05-review makes ownership explicit.</span><span class="cursor"></span>', d: 1950 },
    ],
  },
  {
    title: "demo · evaluation gate",
    lines: [
      { t: '<span class="prompt">$</span> evaluate <span class="arg">before-delegate</span>', d: 0 },
      { t: '<span class="dim">read output</span>       <span class="ok">✓</span>', d: 400 },
      { t: '<span class="dim">tradeoffs</span>         <span class="ok">✓ understood</span>', d: 750 },
      { t: '<span class="dim">tests</span>             <span class="ok">✓ passed</span>', d: 1100 },
      { t: '<span class="dim">review</span>            <span class="ok">✓ accepted</span>', d: 1450 },
      { t: '<span class="dim">assert + review prove judgment, not faith.</span><span class="cursor"></span>', d: 1800 },
    ],
  },
  {
    title: "demo · system first",
    lines: [
      { t: '<span class="prompt">$</span> improve <span class="arg">before-forcing-model</span>', d: 0 },
      { t: '<span class="tree">├── boundary</span>     <span class="ok">✓ clearer</span>', d: 400 },
      { t: '<span class="tree">├── naming</span>       <span class="ok">✓ simpler</span>', d: 750 },
      { t: '<span class="tree">├── tests</span>        <span class="ok">✓ closer</span>', d: 1100 },
      { t: '<span class="tree">└── prompt</span>       <span class="ok">✓ shorter</span>', d: 1450 },
      { t: '<span class="dim">aidd-dev:07-refactor improves the shape.</span><span class="cursor"></span>', d: 1800 },
    ],
  },
  {
    title: "demo · clean restart",
    lines: [
      { t: '<span class="dim">tokens</span>    <span class="warn">██████████████░</span> <span class="warn">91%</span>', d: 0 },
      { t: '<span class="dim">coherence</span> <span class="err">drifting</span>', d: 450 },
      { t: '<span class="prompt">$</span> save plan.md      <span class="ok">✓</span>', d: 900 },
      { t: '<span class="prompt">$</span> load memory.md    <span class="ok">✓</span>', d: 1300 },
      { t: '<span class="prompt">$</span> restart clean     <span class="ok">✓</span>', d: 1600 },
      { t: '<span class="dim">same intent, fresh working set.</span><span class="cursor"></span>', d: 1950 },
    ],
  },
  {
    title: "demo · failure signal",
    lines: [
      { t: '<span class="dim">model stalled</span> <span class="warn">scope unclear</span>', d: 0 },
      { t: '<span class="prompt">$</span> debug <span class="arg">hypothesis</span>', d: 450 },
      { t: '<span class="prompt">$</span> challenge <span class="arg">plan.md</span>', d: 900 },
      { t: '<span class="dim">assumption</span>   <span class="warn">too broad</span>', d: 1300 },
      { t: '<span class="dim">next step</span>     <span class="ok">split scope</span>', d: 1600 },
      { t: '<span class="dim">aidd-dev:08-debug turns failure into data.</span><span class="cursor"></span>', d: 1950 },
    ],
  },
  {
    title: "demo · transferable practice",
    lines: [
      { t: '<span class="prompt">$</span> capture <span class="arg">team-practice</span>', d: 0 },
      { t: '<span class="dim">decision</span> review ritual       <span class="ok">✓</span>', d: 450 },
      { t: '<span class="dim">release</span>  v1.1                <span class="ok">✓</span>', d: 900 },
      { t: '<span class="dim">code style</span> shared by team     <span class="ok">✓</span>', d: 1350 },
      { t: '<span class="dim">tools rotate:</span> codex · claude · next', d: 1750 },
      { t: '<span class="dim">aidd-vcs leaves a shared trail.</span><span class="cursor"></span>', d: 2100 },
    ],
  },
];
