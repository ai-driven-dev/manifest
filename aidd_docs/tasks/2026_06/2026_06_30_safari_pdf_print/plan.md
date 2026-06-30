---
objective: "Make the manifesto homepage reliably printable as a complete Safari PDF."
status: reviewed
---

# Plan: Safari PDF Print

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Flatten screen-only layout and animation behavior under print media so Safari includes the complete manifesto in generated PDFs. |
| **Source** | User request: "rend la page printable en pdf avec toutes les informations à l'intérieur, sur Safari ça ne fonctionne pas" |

## Phases

| # | Phase | File |
| - | ----- | ---- |
| 1 | Stabilize print rendering | [`phase-1.md`](./phase-1.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| `app/src/styles/sections/print.css` | Existing print rules are narrow and miss current sections such as `Definition`. |
| `app/src/styles/sections/base.css` | Screen styles use clipped overflow and reveal transforms that should be neutralized for print. |
| `app/src/styles/sections/layout.css` | The sticky spec index and viewport-height sidebar should not drive paged layout. |
| `app/src/styles/sections/{cover,values,principles,signature}.css` | Screen sections use large paddings, min-heights, transforms, and animated visual states. |
| `app/tests/e2e/*.spec.ts` | Playwright already drives browser checks; a focused print-media test fits the suite. |

## Decisions

| Decision | Why |
| -------- | --- |
| Keep the fix in print CSS plus a print-media e2e test. | The failure is browser paged-layout behavior, not content generation. |
| Hide the sticky navigation and interactive controls for print. | The PDF must prioritize the document body and not depend on sidebar or client interaction. |
| Force print-visible states for reveal/animated content. | Safari may snapshot before scroll-driven or JS-driven animation states become visible. |
| Avoid Safari-specific hacks where standard print rules work. | A deterministic print stylesheet is easier to maintain across browsers. |
