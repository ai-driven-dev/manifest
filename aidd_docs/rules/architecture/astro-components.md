# Rule: Astro Components

## Scope
Apply to every `.astro` file under `app/src/components/` and `app/src/pages/`.

## Hard rules
- A single `.astro` file MUST NOT exceed 200 lines of code.
- `app/src/pages/index.astro` MUST stay ≤ 60 LOC and only compose section components — no business logic, no data fetching.
- Components MUST be reusable. If a similar block is repeated, extract a shared component.
- `VoteWidget` MUST be reused across the 4 values and the 12 principles — never duplicated.
- No inline `<style>` block exceeding 30 LOC; lift to `app/src/styles/sections/*.css`.
- Client behavior gated through Astro islands (`client:load`, `client:visible`, `client:idle`); only mark interactive when truly needed.
- Editor sentinel block `/*EDITMODE-BEGIN*/ … /*EDITMODE-END*/` MUST be preserved verbatim inside one dedicated client island file.

## Naming
- PascalCase filenames (`VoteWidget.astro`, `FocusOverlay.astro`).
- Folder by domain: `sections/`, `values/`, `principles/`, `terminal/`, `signature/`, `voting/`, `tweaks/`, `layout/`.

## Don't
- Don't import from `../website/`.
- Don't fetch from API routes during SSR for purely static content.
- Don't hardcode data — read from `app/src/content/*.ts`.
