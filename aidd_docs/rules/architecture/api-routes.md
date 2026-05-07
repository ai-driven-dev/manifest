# Rule: API Routes

## Scope
All files under `app/src/pages/api/`.

## Contract
- Every endpoint returns JSON with `Content-Type: application/json`.
- Successful responses MUST include `{ ok: true, ... }`. Errors MUST return HTTP 4xx/5xx with `{ ok: false, error: string }`.
- Validate every input (shape + type). Reject malformed payloads with 400.
- Do not throw raw — catch, log, return JSON error.

## Endpoints

### `GET /api/signatures`
Returns `{ count: number }`.

### `POST /api/signatures`
Body: `{ name: string }` (1–60 chars, trimmed, non-empty).
Returns: `{ ok: true, count: number }`.

### `POST /api/votes`
Body: `{ targetType: 'principle' | 'value', targetId: string, value: 1 | -1 }`.
Returns: `{ ok: true, score: number }`.

### `POST /api/feedback`
Body: `{ targetType: 'principle' | 'value', targetId: string, reason: string, alternative: string }`.
Returns: `{ ok: true }`.

## Don't
- Don't access the in-memory store directly. Always go through `getStore()` from `lib/store/provider.ts`.
- Don't expose internal store state shape. Map to response DTOs.
- Don't rely on persistence — store may be reset between deploys.
