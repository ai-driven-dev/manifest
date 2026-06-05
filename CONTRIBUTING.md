# Contributing

This repository is open to public pull requests, but the manifesto is a
canonical text. Keep changes focused.

## Good First Contributions

- add your signature
- fix a typo or broken link
- improve accessibility
- improve documentation
- fix a small site bug
- improve tests or validation

If you want to change the manifesto values, principles, licensing, governance,
security settings, or signatory data model, open an issue first.

## Sign The Manifesto

Each signer gets one file:

```text
app/src/content/signatories/{github-handle}.yml
```

Required fields:

```yaml
github: your-handle
name: Your Name
signed_on: YYYY-MM-DD
```

See [SIGNATORIES.md](./SIGNATORIES.md) for the full guide.

Do not sign for someone else. Do not include private data. You can remove your
signature later by opening a PR that deletes your file.

## Pull Requests

1. Make one clear change.
2. Explain why it matters.
3. Run the checks that fit the change.
4. Respond to review with changes or a short explanation.

For site changes:

```bash
cd app
npm ci
npm run build
```

## Review And Merge

Anyone may open a pull request. External contributors fork the repo and open the
PR from their fork, so no repository access is needed to contribute.

`main` is protected by a ruleset. Every PR needs one approval, a passing `build`
check, and a code-owner review for changes that execute code (workflows,
scripts, dependency manifests, build config, Dockerfile). Force-pushes and
branch deletion are blocked.

The **Habilitated** maintainer team merges. The **Core Team** reviews
contributions and preserves the canonical text. Admins keep a pull-request-only
bypass for emergencies. Minor fixes can be merged quickly; manifesto changes
need discussion and clear agreement.

## Conduct

Be respectful, stay on topic, and do not impersonate signatories. Maintainers
may close, edit, or block contributions that are abusive, spammy, unsafe, or
outside the scope of the project.

By contributing, you agree that your contribution is licensed under the
applicable license in [LICENSE.md](./LICENSE.md).
