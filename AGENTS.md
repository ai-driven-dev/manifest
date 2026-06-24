# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Ce que c'est

Manifesto for AI-Driven Development — Astro 4 SSR app, dockerisée, avec store
en mémoire (signatures, votes, feedback). Le worktree d'origine contenait un
seul HTML monolithique : il a été migré vers `app/` (Astro + TypeScript +
Vitest + Playwright). La migration est terminée — l'app Astro est désormais sa
propre source de vérité (plus de parité 1:1 avec l'ancien `index.html`).

Cousin de `../website/` (Astro, ai-driven-dev.fr) mais **totalement
indépendant** : ne partage aucun asset ni config. Ne pas importer depuis
`../website`.

## Lancer / prévisualiser

```bash
# Dev (HMR)
cd app && npm install && npm run dev

# Production locale
cd app && npm run build && PORT=4321 HOST=127.0.0.1 node ./dist/server/entry.mjs

# Docker
cd app && docker compose up -d --build
# → http://localhost:4321
```

## Tests

```bash
cd app
npm test                  # Vitest unit (store)
npx playwright test       # Playwright e2e (api, sign, vote, visual)
```

## Architecture

```
app/
├── Dockerfile, compose.yaml, .dockerignore
├── astro.config.mjs       SSR + @astrojs/node standalone
├── src/
│   ├── content/           Données éditoriales : principles.ts, values.ts, terms.ts, seeds.ts
│   ├── styles/
│   │   ├── tokens.css     :root tokens oklch (uniquement)
│   │   └── sections/*.css Styles par section (cover, values, principles, …)
│   ├── lib/
│   │   ├── store/         Interface + impl mémoire + provider singleton
│   │   ├── api/client.ts  Fetch helpers typés (sign, vote, feedback, count)
│   │   └── observers.ts   Reveal / terminal / value-art / parallax
│   ├── components/
│   │   ├── layout/Page.astro
│   │   ├── sections/{Cover,Preamble,Values,Principles,Signature}.astro
│   │   ├── values/{ValueArt,Quadrant}.astro
│   │   ├── principles/{PrincipleGrid,PrincipleCard}.astro
│   │   ├── terminal/TerminalAnim.astro
│   │   ├── signature/{SignDialog,SignatureWall}.astro
│   │   ├── voting/{VoteWidget,DownvoteDialog}.astro
│   │   ├── tweaks/TweaksPanel.astro
│   │   └── ClientApp.astro    Single client island (hydratation tweaks + sign + vote + observers)
│   └── pages/
│       ├── index.astro    Composition (≤ 60 LOC)
│       └── api/
│           ├── signatures.ts  GET count, POST sign
│           ├── votes.ts       POST +1/-1
│           └── feedback.ts    POST reason + alternative
└── tests/
    ├── check-component-loc.sh AC-6 — LOC budget
    └── e2e/{api,sign,vote,visual}.spec.ts
```

## Règles d'architecture (voir `aidd_docs/rules/architecture/`)

- `astro-components.md` — `.astro` ≤ 200 LOC, `index.astro` ≤ 60 LOC, VoteWidget réutilisé.
- `api-routes.md` — JSON in/out, validation stricte, contrats versionnés.
- `store-provider.md` — interface-first, swappable, framework-agnostic.
- `styles-tokens.md` — `oklch()` uniquement, pas de hex/HSL hors `tokens.css`.
- `docker.md` — multi-stage Node 22 alpine, non-root, port 4321.
- `testing.md` — Vitest unit + Playwright e2e + régression visuelle du cover ≤ 1 % (snapshot Astro, plus de baseline).

## Conventions

- Couleurs : `oklch()` exclusivement, via variables CSS (`var(--accent)` etc.).
- Données éditoriales : tableaux TypeScript dans `src/content/`, pas de hard-code dans le HTML.
- Tweaks panel : écrit sur `documentElement` (indirection préservée).
- Edit mode parent iframe : sentinelle `/*EDITMODE-BEGIN*/…/*EDITMODE-END*/`
  préservée dans `src/components/ClientApp.astro` (ne pas renommer).

## Édition du contenu

- Ajouter/modifier un principe : `app/src/content/principles.ts`.
- Ajouter/modifier une valeur : `app/src/content/values.ts` (le champ `quad` alimente le quadrant 2×2 de `Quadrant.astro`) + ASCII art dans `ValueArt.astro`.
- Ajouter/modifier un terminal : `app/src/content/terms.ts`.
- Modifier la palette par défaut : `app/src/styles/tokens.css`.

Manifeste monolingue : anglais uniquement. Pas d'I18N.
