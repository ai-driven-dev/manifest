# The Manifesto for AI-Driven Development

Four values. Twelve principles. A public record of people building software
with AI while keeping judgment, craft, and responsibility in the loop.

Read it: https://ai-driven-development.org

## What This Is

This repository is the source of truth for the manifesto and its signatories.

It contains:

- the canonical manifesto content
- one public YAML file per signatory
- the small Astro site that publishes the manifesto

This is not a framework, a certification, or a product. It is a shared text
for practitioners.

## Sign

Signing is public and Git-based: one YAML file, one pull request, no backend.

Go to **[ai-driven-development.org](https://ai-driven-development.org)** and
click **Sign the manifesto**. GitHub forks the repo for you (nobody pushes
branches to this repository directly — Core Team members included), opens a
prefilled editor, and turns your file into a pull request automatically.

Guide: [SIGNATORIES.md](./SIGNATORIES.md)  
Schema: [app/src/content/signatories/_SCHEMA.md](./app/src/content/signatories/_SCHEMA.md)

By signing, you say the manifesto reflects how you already work, or how you
mean to. You are not signing for your employer.

## Contribute

Pull requests are welcome for signatures, small fixes, documentation, site
improvements, accessibility, and tests.

Changes to the manifesto itself should start with an issue. The Core Team
preserves the canonical text.

Read [CONTRIBUTING.md](./CONTRIBUTING.md).

## Run Locally

```bash
cd app
npm ci
npm run dev
```

Checks:

```bash
cd app
npm run build
```

## License

Content is licensed under CC BY 4.0. Code is licensed under MIT.

See [LICENSE.md](./LICENSE.md).
