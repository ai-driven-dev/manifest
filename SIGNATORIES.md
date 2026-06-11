# How to sign the manifesto

Signing the [Manifesto for AI-Driven Development](./README.md) is a public
act recorded in this repository. There is no form, no backend, no email
collection — just a YAML file with your name on it, merged via pull
request.

## The fast path (recommended)

Go to **[ai-driven-development.org](https://ai-driven-development.org)** and
click **Sign the manifesto**. It opens GitHub's web editor with the file
already pre-filled — same link as
[this one](https://github.com/ai-driven-dev/manifest/new/main/app/src/content/signatories?filename=YOUR-HANDLE.yml&value=github%3A%20your-handle%0Aname%3A%20Your%20Full%20Name%0Alinkedin%3A%20%23%20optional%20-%20https%3A%2F%2Fwww.linkedin.com%2Fin%2F...%0Aaffiliation%3A%20%23%20optional%20-%20title%20or%20company%0Asigned_on%3A%202026-05-08%0Astatement%3A%20%23%20optional%20-%20one-line%20public%20statement%20%28max%20280%20chars%29%0A).

This flow is for **everyone — Core Team members included**. Nobody has push
access to this repository; GitHub forks it for you automatically.

What happens:

1. GitHub asks you to fork the repo (one click).
2. You land on a web editor with a file already named `YOUR-HANDLE.yml`
   and the YAML body filled in.
3. Replace the filename's `YOUR-HANDLE` with your **actual GitHub handle**
   (lowercase letters, digits, hyphens — same as in your profile URL).
4. Replace the placeholder values in the file body. Set `signed_on` to
   today's date.
5. Click **Propose new file**. GitHub opens a pull request automatically.

A maintainer reviews and merges. Your name appears on
[ai-driven-development.org](https://ai-driven-development.org) on the
next deploy.

## The slow path (if you prefer your terminal)

You need a fork — pushing branches to `ai-driven-dev/manifest` directly is
rejected (403) unless you are a maintainer. With the [GitHub CLI](https://cli.github.com)
the fork is one command:

```bash
gh repo fork ai-driven-dev/manifest --clone
cd manifest
cp app/src/content/signatories/_SCHEMA.md app/src/content/signatories/your-handle.yml
# edit your-handle.yml, fill the fields
git checkout -b sign/your-handle
git add app/src/content/signatories/your-handle.yml
git commit -m "sign: Your Name"
git push origin sign/your-handle
gh pr create --fill
```

Already cloned the upstream repo and got a 403 on push? Fix it from inside
your clone — `gh repo fork` forks it and adds a remote, then push there:

```bash
gh repo fork --remote --remote-name fork
git push fork sign/your-handle
gh pr create --fill
```

## File format

See [`app/src/content/signatories/_SCHEMA.md`](./app/src/content/signatories/_SCHEMA.md)
for the canonical reference. Required fields: `github`, `name`,
`signed_on`. Optional: `linkedin`, `affiliation`, `statement`.

The build validates every file against a Zod schema. A malformed YAML
makes the CI red — review before merge catches it either way.

## What signing means

You state that the manifesto reflects how you already work, or how you
mean to. You are not signing for your employer.

You can remove your signature at any time by opening a pull request that
deletes your file. No questions asked.
