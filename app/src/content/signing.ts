import { SITE } from '~/lib/site';

// Shared with the public page and alternate formats. The Issue Form and
// signature-pr workflow are the source of truth for how a signature is published.
export const SIGNING = {
  url: SITE.signUrl,
  description:
    'Signing starts a GitHub contribution. Submit the signature request form; a pull request is generated for review. Your name appears in the public registry after that pull request is reviewed and merged.',
  steps: [
    'Submit the GitHub signature request form',
    'Review the generated pull request',
    'Join the public registry after merge',
  ],
};
