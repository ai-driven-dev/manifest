const REPO = 'ai-driven-dev/manifest';
const SIGNATURE_TEMPLATE = 'signature.yml';

export function buildSignatureIssueUrl(): string {
  const url = new URL(`https://github.com/${REPO}/issues/new`);
  url.searchParams.set('template', SIGNATURE_TEMPLATE);
  return url.toString();
}

export const SIGNATURE_ISSUE_URL = buildSignatureIssueUrl();
