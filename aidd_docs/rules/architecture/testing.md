# Rule: Testing

## Scope
`app/tests/` and `app/src/**/__tests__/`.

## Hard rules
- Unit tests use Vitest. File pattern: `*.test.ts` co-located in `__tests__/` or next to source.
- E2E tests use Playwright. Files under `app/tests/e2e/*.spec.ts`.
- Visual diff tolerance: `maxDiffPixelRatio: 0.01` on viewports `1280×800` and `375×812`.
- Disable font smoothing variations in Playwright config to avoid flaky pixel diffs.
- Every API route MUST have at least one e2e test exercising the contract.
- Store implementation MUST have unit tests for sign / vote / feedback paths, including idempotency where defined.

## Don't
- Don't snapshot HTML — snapshot derived data (count, score, structured DTOs).
- Don't depend on production data in tests — seed before, reset after.
