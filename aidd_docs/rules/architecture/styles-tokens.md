# Rule: Styles & Tokens

## Scope
All `*.css` and `*.astro` files under `app/src/`.

## Hard rules
- Color tokens live ONLY in `app/src/styles/tokens.css` under `:root`.
- All colors MUST use the `oklch()` color function. No `#hex`, no `hsl()`, no `rgb()` outside `tokens.css`.
- Components reference colors through CSS variables (`var(--paper)`, `var(--accent)`, `var(--rule)`, etc.) — never literal values.
- The runtime tweaks panel writes variables on `document.documentElement` — components MUST honor that indirection.
- Section styles split per concern under `app/src/styles/sections/{cover,preamble,values,principles,signature,focus,tweaks}.css`.

## Don't
- Don't introduce a CSS framework (Tailwind, etc.) — the original is hand-authored CSS.
- Don't use units other than `rem`/`em`/`px`/`%`/`vw`/`vh`/`ch` for sizing.
- Don't fetch fonts from a different provider — Google Fonts (Fraunces, Inter Tight, JetBrains Mono, Caveat) only.
