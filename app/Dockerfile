# syntax=docker/dockerfile:1.7
#
# Astro 6 SSR (Node standalone adapter) — multi-stage build.
# Compliant with aidd_docs/rules/architecture/docker.md:
#   - Multi-stage: base → prod-deps / build-deps → build → runner
#   - Runner runs prod-only node_modules (no devDeps)
#   - Non-root USER with explicit UID/GID matching compose `user: 1001:1001`
#   - HOST=0.0.0.0, PORT=4321, NODE_ENV=production
#
# Image is built on GitHub-hosted runners and pushed under the immutable
# sha-<full commit> tag. Production resolves that tag once, then deploys its
# registry digest through the private aidd-ops controller.

# ── Shared build base ─────────────────────────────────────────────
FROM node:lts-trixie-slim AS base
WORKDIR /app
COPY package.json ./
RUN npm install --global "$(node -p "require('./package.json').packageManager")"

# ── Production dependencies (runner) ─────────────────────────────
FROM base AS prod-deps
COPY package.json package-lock.json* .npmrc ./
RUN npm ci --omit=dev --no-audit --no-fund

# ── All dependencies (build stage needs Astro CLI = devDep) ──────
FROM base AS build-deps
COPY package.json package-lock.json* .npmrc ./
RUN npm ci --no-audit --no-fund

# ── Build ────────────────────────────────────────────────────────
FROM base AS build
COPY --from=build-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Runner ───────────────────────────────────────────────────────
FROM node:lts-trixie-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321

# Explicit UID/GID 1001:1001 to match compose `user: "1001:1001"`.
RUN groupadd --gid 1001 app \
    && useradd --uid 1001 --gid app --no-create-home --shell /usr/sbin/nologin app

COPY --from=prod-deps --chown=app:app /app/node_modules ./node_modules
COPY --from=build     --chown=app:app /app/dist          ./dist
COPY --from=build     --chown=app:app /app/package.json  ./package.json

USER app
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
