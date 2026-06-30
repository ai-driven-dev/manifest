# Review: Safari PDF Print

The print-media implementation meets the task acceptance criteria and the focused validation passes; one minor code-health cleanup remains around residual print-rule duplication.

- **Verdict**: approve
- **Diff scope**: `HEAD...working tree` (tracked `app/src/styles/sections/print.css` plus untracked task/test files)
- **Axes run**: code, functional, relevancy
- **Date**: 2026_06_30
- **Findings**: 0 critical, 0 warning, 1 minor

Verdict: `approve` = ship it; `changes-requested` = fix the warnings or fixable criticals first; `blocked` = a critical that must not merge. The overall verdict is the strictest across the axes run.

## Code

Clean-code findings on the changed lines (or "Not run").

| Sev | Category | Location | Issue | Suggested fix |
| --- | -------- | -------- | ----- | ------------- |
| minor | code-health | `app/src/styles/sections/print.css:98`; existing overlap in `app/src/styles/sections/cover.css:227` and `app/src/styles/sections/signature.css:630` | The new work centralizes print layout in `print.css`, but older section-local `@media print` blocks still define overlapping cover/signature print behavior. Current cascade is coherent because `print.css` imports later, but the print source of truth is split. | In a cleanup pass, move or remove the residual section-local print blocks so `print.css` is the canonical print stylesheet. |

## Functional

Each acceptance criterion traced to the diff (or "Not run").

| Criterion | Met | Evidence / gap |
| --------- | --- | -------------- |
| Printable document includes cover, definition, values, principles, signatures, and footer. | Yes | `print.css` includes explicit print rules for `.cover`, `.definition`, `.values`, `.principles`, `.signature`, and `footer.doc-footer` (`app/src/styles/sections/print.css:79`). `print.spec.ts` asserts those selectors are visible (`app/tests/e2e/print.spec.ts:8`). WebKit print-media probe found all six visible and counted 4 value rows, 12 principles, and 39 signature cards. |
| Screen rendering remains unchanged. | Yes | The stylesheet change is entirely scoped under `@media print` (`app/src/styles/sections/print.css:2`), and the new test file only exercises print media. No normal-media CSS or component markup is changed. |
| Interactive-only controls are not required in PDF output. | Yes | `print.css` hides `.spec-index`, `.skip-link`, `#tweaks`, `.cover-cta`, `.sign-cta`, `.share-popup`, `.confetti-emoji`, and `.sig-linkedin` (`app/src/styles/sections/print.css:51`). The Playwright test asserts `.cover-cta`, `.sign-cta`, and `.spec-index` compute to `display: none` in print (`app/tests/e2e/print.spec.ts:41`). |
| Manifesto remains English-only. | Yes | The changed CSS adds no content, and the new test assertions use existing English manifesto strings only. |
| Print-media browser check verifies major sections are visible. | Yes | `npx playwright test tests/e2e/print.spec.ts` passed in both configured projects; the WebKit one-off print-media DOM/style probe also passed via `http://localhost:4399/`. |
| Print-media browser check verifies representative definition, value, principle, signature, and footer text. | Yes | `print.spec.ts` asserts representative text for definition, values, principles, signatures, and footer (`app/tests/e2e/print.spec.ts:12`). WebKit probe confirmed the same text using DOM `textContent`. |
| Existing build and tests still pass. | Yes | `npm run build` passed, `npm test` passed with 3 files / 52 tests, and `npx playwright test tests/e2e/print.spec.ts` passed with 2 tests. |
| Phase AC: Definition, Values, Principles, Signature, and footer are in normal paged flow with screen-only UI hidden. | Yes | Layout wrappers are flattened to `display: block`, auto dimensions, no containment, and visible overflow (`app/src/styles/sections/print.css:37`); screen-only UI is hidden (`app/src/styles/sections/print.css:51`). |
| Phase AC: Reveal and animated content is force-visible in print media. | Yes | Global print rules remove animation/transform/overflow constraints (`app/src/styles/sections/print.css:7`), reveal/value/demo/signature descendants are forced to opacity 1 and no transform (`app/src/styles/sections/print.css:62`), and the test asserts representative computed opacity/transform states (`app/tests/e2e/print.spec.ts:24`). |

- **Missing behaviors**: none against the stated acceptance criteria.
- **Unplanned behaviors**: none. The only visible behavior changes are scoped to print media.
- **Edge-case gaps**: no automated saved-PDF artifact comparison; validation uses print-media DOM/style checks as the task plan requires. The WebKit proxy check passed.

## Relevancy

Does the change belong (or "Not run"). Every finding ties to evidence, never an opinion.

| Sev | Lens | Location / rule | Misfit | Suggested fix |
| --- | ---- | --------------- | ------ | ------------- |
| minor | rot | Project baseline: no information duplication; `app/src/styles/sections/print.css:2`, `app/src/styles/sections/cover.css:227`, `app/src/styles/sections/signature.css:630` | Print behavior now lives mostly in `print.css`, but small legacy print blocks remain in section styles. This is not functionally contradictory today, but it leaves maintainers with multiple places to check for print behavior. | Consolidate the residual section-local print rules into `print.css` in a later cleanup. |

## Follow-up

- **Top fixes** (ranked): consolidate residual section-local print rules into `app/src/styles/sections/print.css` when convenient.
- **Notes**: Validation run in this review: `npm run build` passed; `npm test` passed (3 files, 52 tests); `npx playwright test tests/e2e/print.spec.ts` passed (2 tests); WebKit print-media DOM/style probe passed on `http://localhost:4399/` with all major sections visible and representative content present. Checklist result: DRY partial because of the minor residual print-rule duplication; naming/docs/code coherent; no over-engineering observed for the Safari print scope; no debug leftovers found by `rg` for console/debugger/TODO/test-only markers in the changed task files.
