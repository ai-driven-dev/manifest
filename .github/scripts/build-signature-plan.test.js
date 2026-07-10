const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const {
  buildActionPlan,
  buildBranchName,
  buildDryRunResult,
  buildDispatchSignature,
  buildPullRequestPayload,
  buildSignature,
  parseIssueFormBody,
} = require('./build-signature-plan.js');

function issue({ login = 'octocat', body = validBody(), labels = ['signature-request'] } = {}) {
  return {
    number: 42,
    user: { login },
    labels: labels.map((name) => ({ name })),
    body,
  };
}

function validBody(overrides = {}) {
  const fields = {
    'Display name': 'Octo Cat',
    'LinkedIn profile': 'https://www.linkedin.com/in/octocat/',
    Affiliation: 'GitHub',
    Statement: 'This is how I build software with AI.',
    ...overrides,
  };

  return Object.entries(fields)
    .map(([label, value]) => `### ${label}\n\n${value}`)
    .join('\n\n');
}

describe('parseIssueFormBody', () => {
  it('parses GitHub issue form markdown by heading', () => {
    assert.deepEqual(parseIssueFormBody(validBody()), {
      'display name': 'Octo Cat',
      'linkedin profile': 'https://www.linkedin.com/in/octocat/',
      affiliation: 'GitHub',
      statement: 'This is how I build software with AI.',
    });
  });
});

describe('buildSignature', () => {
  it('uses the issue author as the GitHub handle', () => {
    const signature = buildSignature(issue());

    assert.equal(signature.github, 'octocat');
    assert.equal(signature.path, 'app/src/content/signatories/octocat.yml');
    assert.match(signature.yaml, /^github: octocat$/m);
    assert.match(signature.yaml, /^name: "Octo Cat"$/m);
    assert.match(signature.yaml, /^linkedin: "https:\/\/www.linkedin.com\/in\/octocat\/"$/m);
  });

  it('omits empty optional fields', () => {
    const signature = buildSignature(issue({
      body: validBody({
        'LinkedIn profile': '_No response_',
        Affiliation: '',
        Statement: '',
      }),
    }));

    assert.doesNotMatch(signature.yaml, /^linkedin:/m);
    assert.doesNotMatch(signature.yaml, /^affiliation:/m);
    assert.doesNotMatch(signature.yaml, /^statement:/m);
  });

  it('rejects invalid LinkedIn URLs', () => {
    assert.throws(
      () => buildSignature(issue({ body: validBody({ 'LinkedIn profile': 'not-a-url' }) })),
      /linkedin must be a valid URL/,
    );
  });

  it('rejects overlong statements', () => {
    assert.throws(
      () => buildSignature(issue({ body: validBody({ Statement: 'x'.repeat(281) }) })),
      /statement must be 280 characters or fewer/,
    );
  });

  it('accepts statements up to 280 characters', () => {
    const statement = 'x'.repeat(280);
    const signature = buildSignature(issue({ body: validBody({ Statement: statement }) }));

    assert.match(signature.yaml, new RegExp(`^statement: "${statement}"$`, 'm'));
  });
});

describe('test mode', () => {
  it('builds signatures from workflow_dispatch inputs', () => {
    const signature = buildDispatchSignature({
      github: 'octocat',
      name: 'AIDD Test Signature',
      affiliation: 'Test run',
      statement: 'Test-mode signature; do not merge.',
    });

    assert.equal(signature.github, 'octocat');
    assert.equal(signature.name, 'AIDD Test Signature');
    assert.match(signature.yaml, /^affiliation: "Test run"$/m);
  });

  it('builds a draft test pull request payload without an issue', () => {
    const signature = buildDispatchSignature({ github: 'octocat', name: 'AIDD Test Signature' });
    const branch = buildBranchName(signature, { testMode: true, runId: '123' });
    const payload = buildPullRequestPayload(signature, branch, true);

    assert.equal(branch, 'signature-test/octocat-123');
    assert.equal(payload.draft, true);
    assert.equal(payload.title, '[TEST] Add signature: AIDD Test Signature');
    assert.match(payload.body, /Do not merge/);
  });
});

describe('dry run', () => {
  it('prints the generated signature plan without GitHub API calls', () => {
    const result = buildDryRunResult({
      event: { issue: issue() },
      runId: '123',
    });

    assert.equal(result.status, 'dry-run');
    assert.equal(result.issue, 42);
    assert.equal(result.testMode, false);
    assert.equal(result.branch, 'signature/octocat');
    assert.equal(result.path, 'app/src/content/signatories/octocat.yml');
    assert.match(result.yaml, /^name: "Octo Cat"$/m);
    assert.equal(result.pullRequest.title, 'Add signature: Octo Cat');
  });
});

describe('action plan', () => {
  it('builds the metadata used by git and gh workflow steps', () => {
    const plan = buildActionPlan({
      event: { issue: issue() },
      runId: '123',
    });

    assert.equal(plan.branch, 'signature/octocat');
    assert.equal(plan.commitMessage, 'Add signature for octocat');
    assert.equal(plan.duplicate, false);
    assert.equal(plan.duplicateMessage, '@octocat is already in the signature registry.');
    assert.equal(plan.issue.number, 42);
    assert.equal(plan.pullRequest.title, 'Add signature: Octo Cat');
    assert.equal(plan.signature.path, 'app/src/content/signatories/octocat.yml');
  });
});
