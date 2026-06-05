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
  // 01 — Deliver fast (tests · lint · build · prod)
  {
    title: "~/app · ship pipeline",
    lines: [
      { t: '<span class="prompt">$</span> <span class="arg">ship</span> "invoice-export"', d: 0 },
      { t: '<span class="dim">›</span> tests   <span class="ok">✓ 482 passed</span>  <span class="dim">  120ms</span>', d: 400 },
      { t: '<span class="dim">›</span> lint    <span class="ok">✓ clean</span>       <span class="dim">   20ms</span>', d: 700 },
      { t: '<span class="dim">›</span> types   <span class="ok">✓ strict</span>      <span class="dim">   30ms</span>', d: 1000 },
      { t: '<span class="dim">›</span> build   <span class="ok">✓ ready</span>       <span class="dim">  900ms</span>', d: 1300 },
      { t: '<span class="dim">›</span> deploy  <span class="ok">✓ prod</span>        <span class="dim">  1.2s</span>', d: 1600 },
      { t: '<span class="ok">[main 7f3a9c1]</span> live · debt <span class="accent">0</span><span class="cursor"></span>', d: 2000 },
    ],
  },
  // 02 — Plan = collab humain ↔ AI, then handoff to autonomous AI
  {
    title: "plan · two-phase handoff",
    lines: [
      { t: '<span style="color:oklch(.78 .18 var(--p-hue,50));display:block;"><svg viewBox="0 0 360 160" width="100%" style="display:block;max-height:180px;"><defs><marker id="ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L8 5 L0 10 Z" fill="currentColor"/></marker></defs><rect x="28" y="40" width="80" height="44" rx="4" fill="none" stroke="currentColor"/><text x="68" y="66" text-anchor="middle" font-size="12" fill="currentColor" font-family="ui-monospace,monospace">AI #1</text><text x="68" y="102" text-anchor="middle" font-size="9" fill="currentColor" opacity=".55" font-family="ui-monospace,monospace">proposes</text><circle cx="180" cy="62" r="22" fill="none" stroke="currentColor"/><text x="180" y="66" text-anchor="middle" font-size="10" fill="currentColor" font-family="ui-monospace,monospace">human</text><text x="180" y="102" text-anchor="middle" font-size="9" fill="currentColor" opacity=".55" font-family="ui-monospace,monospace">decides</text><rect x="254" y="40" width="80" height="44" rx="4" fill="none" stroke="currentColor"/><text x="294" y="66" text-anchor="middle" font-size="12" fill="currentColor" font-family="ui-monospace,monospace">AI #2</text><text x="294" y="102" text-anchor="middle" font-size="9" fill="currentColor" opacity=".55" font-family="ui-monospace,monospace">autonomous</text><path d="M114 62 L152 62" fill="none" stroke="currentColor" marker-start="url(#ar2)" marker-end="url(#ar2)"/><path d="M204 62 L252 62" fill="none" stroke="currentColor" marker-end="url(#ar2)" stroke-dasharray="3 3"/><path d="M301 34 A 12 12 0 1 0 287 34" fill="none" stroke="currentColor" marker-end="url(#ar2)" opacity=".7"/><text x="68" y="132" text-anchor="middle" font-size="9" fill="currentColor" opacity=".7" font-family="ui-monospace,monospace">phase 1 · review</text><text x="180" y="132" text-anchor="middle" font-size="9" fill="currentColor" opacity=".5" font-family="ui-monospace,monospace">handoff</text><text x="294" y="132" text-anchor="middle" font-size="9" fill="currentColor" opacity=".7" font-family="ui-monospace,monospace">phase 2 · loop</text></svg></span>', d: 0 },
      { t: '<span class="ok">✓</span> aligned · <span class="ok">✓</span> shipped · PR <span class="accent">421</span><span class="cursor"></span>', d: 1400 },
    ],
  },
  // 03 — Decompose: 1 line on the surface vs what it really implies
  {
    title: "decompose › the iceberg",
    lines: [
      { t: '<span class="prompt">$</span> task add <span class="arg">"change user\'s group"</span>', d: 0 },
      { t: '<span class="dim">surface:</span> <span class="accent">1 line</span> <span class="dim">· looks simple</span>', d: 500 },
      { t: '<span class="prompt">$</span> <span class="arg">decompose</span>', d: 1000 },
      { t: '<span class="tree"><span class="branch">├── api</span>      <span class="dim">PATCH /users/:id/group</span></span>', d: 1300 },
      { t: '<span class="tree"><span class="branch" style="animation-delay:.1s">├── db</span>       <span class="dim">migration + audit log</span></span>', d: 1500 },
      { t: '<span class="tree"><span class="branch" style="animation-delay:.2s">├── perms</span>    <span class="dim">re-check on change</span></span>', d: 1700 },
      { t: '<span class="tree"><span class="branch" style="animation-delay:.3s">├── ui</span>       <span class="dim">form + confirm modal</span></span>', d: 1900 },
      { t: '<span class="tree"><span class="branch" style="animation-delay:.4s">└── tests</span>    <span class="dim">unit + e2e</span></span>', d: 2100 },
      { t: '<span class="dim">5 leaves · ready to delegate</span><span class="cursor"></span>', d: 2500 },
    ],
  },
  // 04 — Context = MCP + md + code + skills, not a prompt
  {
    title: "context · system, not prompt",
    lines: [
      { t: '<span class="prompt">$</span> <span class="arg">context build</span>', d: 0 },
      { t: '<span class="tree"><span class="branch">├── docs/*.md</span>      <span class="ok">✓ 12 files</span></span>', d: 400 },
      { t: '<span class="tree"><span class="branch" style="animation-delay:.1s">├── src/**/*.ts</span>    <span class="ok">✓ 84 files</span></span>', d: 700 },
      { t: '<span class="tree"><span class="branch" style="animation-delay:.2s">├── skills/aidd:*</span>  <span class="ok">✓ loaded</span></span>', d: 1000 },
      { t: '<span class="tree"><span class="branch" style="animation-delay:.3s">└── mcp://serena</span>   <span class="ok">✓ live</span></span>', d: 1300 },
      { t: '<span class="dim">────────────────────────────</span>', d: 1600 },
      { t: '<span class="dim">context = system · not a prompt.</span><span class="cursor"></span>', d: 1900 },
    ],
  },
  // 05 — Same standards: AI lines, marked, owned
  {
    title: "src/group.ts · diff",
    lines: [
      { t: '<span class="dim">/* @ai-generated · author: claude */</span>', d: 0 },
      { t: '<span class="dim">/* @reviewed @alex · @responsible @alex */</span>', d: 400 },
      { t: '<span class="diff"><span class="plus">+ export function transferGroup(</span></span>', d: 900 },
      { t: '<span class="diff"><span class="plus">+   uid: UserId, gid: GroupId</span></span>', d: 1100 },
      { t: '<span class="diff"><span class="plus">+ ): Promise&lt;Result&gt; { ... }</span></span>', d: 1300 },
      { t: '<span class="dim">────────────────────────────</span>', d: 1700 },
      { t: '<span class="dim">same review · same tests · same bar.</span><span class="cursor"></span>', d: 2000 },
    ],
  },
  // 06 — Architects: human draws the spine, AI fills the muscle
  {
    title: "architecture · spine",
    lines: [
      { t: '<span style="color:oklch(.78 .18 var(--p-hue,200));display:block;"><svg viewBox="0 0 320 146" width="100%" style="display:block;max-height:176px;"><defs><marker id="ar6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 5 L0 10 Z" fill="currentColor"/></marker></defs><text x="14" y="16" font-size="9" fill="currentColor" opacity=".55" font-family="ui-monospace,monospace">human draws the spine</text><rect x="14" y="26" width="74" height="40" rx="3" fill="none" stroke="currentColor"/><text x="51" y="50" text-anchor="middle" font-size="11" fill="currentColor" font-family="ui-monospace,monospace">api</text><rect x="123" y="26" width="74" height="40" rx="3" fill="none" stroke="currentColor"/><text x="160" y="50" text-anchor="middle" font-size="11" fill="currentColor" font-family="ui-monospace,monospace">svc</text><rect x="232" y="26" width="74" height="40" rx="3" fill="none" stroke="currentColor"/><text x="269" y="50" text-anchor="middle" font-size="11" fill="currentColor" font-family="ui-monospace,monospace">db</text><path d="M88 46 L121 46" stroke="currentColor" fill="none" marker-end="url(#ar6)"/><path d="M197 46 L230 46" stroke="currentColor" fill="none" marker-end="url(#ar6)"/><text x="14" y="86" font-size="9" fill="currentColor" opacity=".55" font-family="ui-monospace,monospace">AI fills the muscle</text><path d="M51 70 L51 96" stroke="currentColor" stroke-dasharray="2 3" fill="none" opacity=".55" marker-end="url(#ar6)"/><path d="M160 70 L160 96" stroke="currentColor" stroke-dasharray="2 3" fill="none" opacity=".55" marker-end="url(#ar6)"/><path d="M269 70 L269 96" stroke="currentColor" stroke-dasharray="2 3" fill="none" opacity=".55" marker-end="url(#ar6)"/><text x="51" y="114" text-anchor="middle" font-size="9" fill="currentColor" opacity=".75" font-family="ui-monospace,monospace">POST /grp</text><text x="51" y="126" text-anchor="middle" font-size="8" fill="currentColor" opacity=".45" font-family="ui-monospace,monospace">generated</text><text x="160" y="114" text-anchor="middle" font-size="9" fill="currentColor" opacity=".75" font-family="ui-monospace,monospace">service.ts</text><text x="160" y="126" text-anchor="middle" font-size="8" fill="currentColor" opacity=".45" font-family="ui-monospace,monospace">generated</text><text x="269" y="114" text-anchor="middle" font-size="9" fill="currentColor" opacity=".75" font-family="ui-monospace,monospace">migration</text><text x="269" y="126" text-anchor="middle" font-size="8" fill="currentColor" opacity=".45" font-family="ui-monospace,monospace">generated</text></svg></span>', d: 0 },
      { t: '<span class="dim">spine: yours · muscle: theirs.</span><span class="cursor"></span>', d: 1400 },
    ],
  },
  // 07 — Go further: scope you can ship, before vs with AI
  {
    title: "scope · ambition bar",
    lines: [
      { t: '<span class="prompt">$</span> <span class="arg">scope --measure</span>', d: 0 },
      { t: '', d: 300 },
      { t: '<span class="dim">solo:    </span><span class="warn">███░░░░░░░░░░░</span> <span class="dim">3 weeks</span>', d: 600 },
      { t: '<span class="dim">with AI: </span><span class="ok">██████████████</span> <span class="dim">3 days</span>', d: 1100 },
      { t: '', d: 1400 },
      { t: '<span class="dim">multiplier:</span> <span class="accent">×5</span> <span class="dim">· bar moves up</span>', d: 1700 },
      { t: '<span class="dim">ship what you couldn\'t ship before.</span><span class="cursor"></span>', d: 2200 },
    ],
  },
  // 08 — Restart: /compact, short example
  {
    title: "session · /compact",
    lines: [
      { t: '<span class="dim">›</span> tokens   <span class="warn">█████████████████░</span> <span class="warn">94%</span>', d: 0 },
      { t: '<span class="dim">›</span> coherence <span class="err">drifting</span> <span class="dim">· context noisy</span>', d: 500 },
      { t: '<span class="prompt">$</span> <span class="arg">/compact</span>', d: 1100 },
      { t: '<span class="ok">✓</span> compacted <span class="dim">· intent kept</span>', d: 1500 },
      { t: '<span class="prompt">$</span> <span class="arg">continue plan.md</span><span class="cursor"></span>', d: 1900 },
      { t: '<span class="dim">fresh context · same intent.</span>', d: 2300 },
    ],
  },
  // 09 — Method over tools: tools rotate at top, loop holds at bottom (agent center)
  {
    title: "method · holds across tools",
    lines: [
      { t: '<span class="dim">tools:</span>  <span class="rotate-word"><span>codex</span><span>claude</span><span>cursor</span><span>aider</span><span>next…</span></span>', d: 0 },
      { t: '<span class="dim">models:</span> <span class="rotate-word" style="--s:.4s"><span>opus</span><span>sonnet</span><span>haiku</span><span>gpt</span><span>next…</span></span>', d: 300 },
      { t: '<span style="color:oklch(.78 .18 var(--p-hue,300));display:block;"><svg viewBox="0 0 320 160" width="100%" style="display:block;max-height:180px;"><defs><marker id="ar9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 5 L0 10 Z" fill="currentColor"/></marker></defs><circle cx="160" cy="80" r="22" fill="none" stroke="currentColor"/><text x="160" y="78" text-anchor="middle" font-size="10" fill="currentColor" font-family="ui-monospace,monospace">agent</text><text x="160" y="90" text-anchor="middle" font-size="10" fill="currentColor" opacity=".5" font-family="ui-monospace,monospace">↻</text><text x="160" y="18" text-anchor="middle" font-size="11" fill="currentColor" font-family="ui-monospace,monospace">plan</text><text x="302" y="84" text-anchor="end" font-size="11" fill="currentColor" font-family="ui-monospace,monospace">implement</text><text x="160" y="150" text-anchor="middle" font-size="11" fill="currentColor" font-family="ui-monospace,monospace">test</text><text x="18" y="84" text-anchor="start" font-size="11" fill="currentColor" font-family="ui-monospace,monospace">review</text><path d="M174 36 A 50 50 0 0 1 222 80" fill="none" stroke="currentColor" marker-end="url(#ar9)"/><path d="M222 94 A 50 50 0 0 1 174 132" fill="none" stroke="currentColor" marker-end="url(#ar9)"/><path d="M146 132 A 50 50 0 0 1 98 94" fill="none" stroke="currentColor" marker-end="url(#ar9)"/><path d="M98 70 A 50 50 0 0 1 146 36" fill="none" stroke="currentColor" marker-end="url(#ar9)"/></svg></span>', d: 700 },
      { t: '<span class="ok">✓</span> tools change · <span class="accent">loop holds.</span><span class="cursor"></span>', d: 1900 },
    ],
  },
  // 10 — Community: aidd-docs/ committed and shared
  {
    title: "aidd-docs · committed",
    lines: [
      { t: '<span class="prompt">$</span> <span class="arg">tree aidd-docs/</span>', d: 0 },
      { t: '<span class="tree"><span class="branch">├── skills/</span>     <span class="dim">how we work</span></span>', d: 400 },
      { t: '<span class="tree"><span class="branch" style="animation-delay:.1s">├── rules/</span>      <span class="dim">what holds</span></span>', d: 700 },
      { t: '<span class="tree"><span class="branch" style="animation-delay:.2s">├── commands/</span>   <span class="dim">shared verbs</span></span>', d: 1000 },
      { t: '<span class="tree"><span class="branch" style="animation-delay:.3s">├── templates/</span>  <span class="dim">starting points</span></span>', d: 1300 },
      { t: '<span class="tree"><span class="branch" style="animation-delay:.4s">└── docs/</span>       <span class="dim">the why</span></span>', d: 1600 },
      { t: '<span class="prompt">$</span> <span class="arg">git push</span>  <span class="ok">✓ all peers in sync</span>', d: 2000 },
      { t: '<span class="dim">one commit · whole community.</span><span class="cursor"></span>', d: 2400 },
    ],
  },
  // 11 — Limits as signals: pyramid of squares, same height, finer grain
  {
    title: "signal · finer grain",
    lines: [
      { t: '<span class="dim">same volume · finer grain</span>', d: 0 },
      { t: '<span style="color:oklch(.78 .18 var(--p-hue,10));display:block;"><svg viewBox="0 0 410 108" width="100%" style="display:block;max-height:140px;"><rect x="5" y="10" width="60" height="60" fill="none" stroke="currentColor"/><text x="35" y="86" text-anchor="middle" font-size="10" fill="currentColor" opacity=".75" font-family="ui-monospace,monospace">1</text><text x="35" y="98" text-anchor="middle" font-size="8" fill="currentColor" opacity=".45" font-family="ui-monospace,monospace">stalls</text><rect x="110" y="10" width="30" height="30" fill="none" stroke="currentColor"/><rect x="80" y="40" width="30" height="30" fill="none" stroke="currentColor"/><rect x="110" y="40" width="30" height="30" fill="none" stroke="currentColor"/><rect x="140" y="40" width="30" height="30" fill="none" stroke="currentColor"/><text x="125" y="86" text-anchor="middle" font-size="10" fill="currentColor" opacity=".75" font-family="ui-monospace,monospace">4</text><text x="125" y="98" text-anchor="middle" font-size="8" fill="currentColor" opacity=".45" font-family="ui-monospace,monospace">ok</text><rect x="225" y="10" width="20" height="20" fill="none" stroke="currentColor"/><rect x="205" y="30" width="20" height="20" fill="none" stroke="currentColor"/><rect x="225" y="30" width="20" height="20" fill="none" stroke="currentColor"/><rect x="245" y="30" width="20" height="20" fill="none" stroke="currentColor"/><rect x="185" y="50" width="20" height="20" fill="none" stroke="currentColor"/><rect x="205" y="50" width="20" height="20" fill="none" stroke="currentColor"/><rect x="225" y="50" width="20" height="20" fill="none" stroke="currentColor"/><rect x="245" y="50" width="20" height="20" fill="none" stroke="currentColor"/><rect x="265" y="50" width="20" height="20" fill="none" stroke="currentColor"/><text x="255" y="86" text-anchor="middle" font-size="10" fill="currentColor" opacity=".75" font-family="ui-monospace,monospace">9</text><text x="255" y="98" text-anchor="middle" font-size="8" fill="currentColor" opacity=".45" font-family="ui-monospace,monospace">clean</text><rect x="345" y="10" width="15" height="15" fill="none" stroke="currentColor"/><rect x="330" y="25" width="15" height="15" fill="none" stroke="currentColor"/><rect x="345" y="25" width="15" height="15" fill="none" stroke="currentColor"/><rect x="360" y="25" width="15" height="15" fill="none" stroke="currentColor"/><rect x="315" y="40" width="15" height="15" fill="none" stroke="currentColor"/><rect x="330" y="40" width="15" height="15" fill="none" stroke="currentColor"/><rect x="345" y="40" width="15" height="15" fill="none" stroke="currentColor"/><rect x="360" y="40" width="15" height="15" fill="none" stroke="currentColor"/><rect x="375" y="40" width="15" height="15" fill="none" stroke="currentColor"/><rect x="300" y="55" width="15" height="15" fill="none" stroke="currentColor"/><rect x="315" y="55" width="15" height="15" fill="none" stroke="currentColor"/><rect x="330" y="55" width="15" height="15" fill="none" stroke="currentColor"/><rect x="345" y="55" width="15" height="15" fill="none" stroke="currentColor"/><rect x="360" y="55" width="15" height="15" fill="none" stroke="currentColor"/><rect x="375" y="55" width="15" height="15" fill="none" stroke="currentColor"/><rect x="390" y="55" width="15" height="15" fill="none" stroke="currentColor"/><text x="375" y="86" text-anchor="middle" font-size="10" fill="currentColor" opacity=".75" font-family="ui-monospace,monospace">16</text><text x="375" y="98" text-anchor="middle" font-size="8" fill="currentColor" opacity=".45" font-family="ui-monospace,monospace">trivial</text></svg></span>', d: 400 },
      { t: '<span class="dim">stall = decompose further.</span><span class="cursor"></span>', d: 1700 },
    ],
  },
  // 12 — Memory: every learning lands in memory.md
  {
    title: "~/.aidd/memory.md",
    lines: [
      { t: '<span class="prompt">$</span> <span class="arg">tail -f memory.md</span>', d: 0 },
      { t: '<span class="dim">[apr 19]</span> learn: <span class="hl">oklch ≠ hsl hue</span>       <span class="ok">✓ noted</span>', d: 400 },
      { t: '<span class="dim">[apr 27]</span> err:   forgot null guard      <span class="ok">✓ noted</span>', d: 800 },
      { t: '<span class="dim">[may 02]</span> insight: planning &gt; prompting <span class="ok">✓ noted</span>', d: 1200 },
      { t: '<span class="dim">[may 06]</span> same trap? <span class="err">─ no.</span>', d: 1700 },
      { t: '<span class="dim">────────────────────────────</span>', d: 2100 },
      { t: '<span class="dim">memory compounds · same trap, never twice.</span><span class="cursor"></span>', d: 2400 },
    ],
  },
];
