# Rule: Docker

## Scope
`app/Dockerfile`, `app/compose.yaml`, `app/.dockerignore`.

## Hard rules
- Base image: `node:lts-trixie-slim` (build + runtime).
- Multi-stage: `base` → `prod-deps` / `build-deps` → `build` → `runner`.
  Production runs as the explicit non-root UID/GID `1001:1001`.
- `runner` stage installs only production dependencies.
- Container listens on `4321`. Compose maps host `4321:4321`.
- `HOST=0.0.0.0`, `PORT=4321`, `NODE_ENV=production` set in the runner stage.
- `.dockerignore` excludes `node_modules`, `.git`, `tests/e2e/baseline`, `playwright-report`, `dist` (only needed during build), `*.md` from the build context where unused.

## Don't
- Don't bake secrets into the image.
- Don't run `npm install` in the runner stage — copy `node_modules` from a deps stage or `npm ci --omit=dev`.
- Don't bind-mount host source in production compose.
