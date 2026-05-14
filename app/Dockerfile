# syntax=docker/dockerfile:1.7
#
# Astro 4 SSR (Node standalone adapter) — multi-stage build.
# Compliant with aidd_docs/rules/architecture/docker.md:
#   - Multi-stage: deps → build → runner
#   - Runner runs prod-only node_modules (no devDeps)
#   - Non-root USER with explicit UID/GID matching compose `user: 1001:1001`
#   - HOST=0.0.0.0, PORT=4321, NODE_ENV=production
#
# Image is built and pushed to ghcr.io/ai-driven-dev/manifest by the
# .github/workflows/deploy.yml pipeline (self-hosted runner on AIDD).

# ── Production dependencies (runner) ─────────────────────────────
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

# ── All dependencies (build stage needs Astro CLI = devDep) ──────
FROM node:22-alpine AS build-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ── Build ────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=build-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Runner ───────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321

# Explicit UID/GID 1001:1001 to match compose `user: "1001:1001"`.
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app

COPY --from=prod-deps --chown=app:app /app/node_modules ./node_modules
COPY --from=build     --chown=app:app /app/dist          ./dist
COPY --from=build     --chown=app:app /app/package.json  ./package.json

USER app
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
