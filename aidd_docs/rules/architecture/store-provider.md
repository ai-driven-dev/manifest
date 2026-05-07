# Rule: Store Provider

## Scope
`app/src/lib/store/`.

## Pattern
- `types.ts` defines the `Store` interface and domain types (`Signature`, `Vote`, `Feedback`, `TargetType`, `TargetId`).
- `memory.ts` implements `Store` using `Map`s in-process.
- `provider.ts` exposes `getStore(): Store` — singleton, cached on `globalThis` to survive module reloads in dev.
- `index.ts` re-exports the public surface.

## Hard rules
- Consumers (API routes, tests) MUST import from `lib/store` — never from `lib/store/memory.ts` directly.
- The interface is the contract. Adding a method MUST update `types.ts` first, then implementations.
- Mutations MUST be atomic per call (no half-applied state) and return the resulting derived value (count, score).
- No I/O in `memory.ts`. Persistence is out of scope.

## Don't
- Don't leak the underlying `Map` instances in return types.
- Don't depend on `astro:*` modules from inside the store — keep it framework-agnostic so Vitest can run it directly.
