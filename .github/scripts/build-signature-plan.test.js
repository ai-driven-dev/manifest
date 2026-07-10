const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const {
  createWorkflowPlan,
  buildDispatchSignature,
  buildIssueSignature,
  dryRun,
  parseIssueFormBody,
} = require('./build-signature-plan.js');

function validBody(overrides = {}) {
  return Object.entries({
    'Display name': 'Octo Cat',
    'LinkedIn profile': 'https://www.linkedin.com/in/octocat/',
    Affiliation: 'GitHub',
    Statement: 'This is how I build software with AI.',
    ...overrides,
  })
    .map(([label, value]) => `### ${label}\n\n${value}`)
    .join('\n\n');
}

function issue(body = validBody()) {
  return {
    number: 42,
    user: { login: 'octocat' },
    body,
  };
}

describe('issue form parsing', () => {
  it('parses GitHub issue form markdown by heading', () => {
    assert.deepEqual(parseIssueFormBody(validBody()), {
      'display name': 'Octo Cat',
      'linkedin profile': 'https://www.linkedin.com/in/octocat/',
      affiliation: 'GitHub',
      statement: 'This is how I build software with AI.',
    });
  });
});

describe('signature validation', () => {
  it('uses the issue author as the GitHub handle and writes YAML', () => {
    const signature = buildIssueSignature(issue());

    assert.equal(signature.github, 'octocat');
    assert.equal(signature.path, 'app/src/content/signatories/octocat.yml');
    assert.match(signature.yaml, /^github: octocat$/m);
    assert.match(signature.yaml, /^name: "Octo Cat"$/m);
    assert.match(signature.yaml, /^linkedin: "https:\/\/www.linkedin.com\/in\/octocat\/"$/m);
  });

  it('omits empty optional fields', () => {
    const signature = buildIssueSignature(issue(validBody({
      'LinkedIn profile': '_No response_',
      Affiliation: '',
      Statement: '',
    })));

    assert.doesNotMatch(signature.yaml, /^linkedin:/m);
    assert.doesNotMatch(signature.yaml, /^affiliation:/m);
    assert.doesNotMatch(signature.yaml, /^statement:/m);
  });

  it('rejects invalid LinkedIn URLs', () => {
    assert.throws(
      () => buildIssueSignature(issue(validBody({ 'LinkedIn profile': 'not-a-url' }))),
      /linkedin must be a valid URL/,
    );
  });

  it('accepts 280-character statements and rejects 281', () => {
    assert.match(
      buildIssueSignature(issue(validBody({ Statement: 'x'.repeat(280) }))).yaml,
      new RegExp(`^statement: "${'x'.repeat(280)}"$`, 'm'),
    );
    assert.throws(
      () => buildIssueSignature(issue(validBody({ Statement: 'x'.repeat(281) }))),
      /statement must be 280 characters or fewer/,
    );
  });
});

describe('workflow plan', () => {
  it('builds the metadata used by git and gh workflow steps', () => {
    const plan = createWorkflowPlan({ event: { issue: issue() }, runId: '123' });

    assert.equal(plan.branch, 'signature/octocat');
    assert.equal(plan.commitMessage, 'Add signature for octocat');
    assert.equal(plan.duplicate, false);
    assert.equal(plan.duplicateMessage, '@octocat is already in the signature registry.');
    assert.equal(plan.issue.number, 42);
    assert.equal(plan.pullRequest.title, 'Add signature: Octo Cat');
    assert.equal(plan.pullRequest.draft, false);
    assert.equal(plan.signature.path, 'app/src/content/signatories/octocat.yml');
  });

  it('builds a draft test plan from workflow_dispatch inputs', () => {
    const inputs = {
      github: 'octocat',
      name: 'AIDD Test Signature',
      affiliation: 'Test run',
      statement: 'Test-mode signature; do not merge.',
    };
    const plan = createWorkflowPlan({
      event: { inputs },
      runId: '123',
    });

    assert.equal(plan.branch, 'signature-test/octocat-123');
    assert.equal(plan.pullRequest.draft, true);
    assert.equal(plan.pullRequest.title, '[TEST] Add signature: AIDD Test Signature');
    assert.match(plan.pullRequest.body, /Do not merge/);
  });

  it('prints a dry-run plan without GitHub API calls', () => {
    const result = dryRun(createWorkflowPlan({ event: { issue: issue() }, runId: '123' }));

    assert.equal(result.status, 'dry-run');
    assert.equal(result.issue, 42);
    assert.equal(result.branch, 'signature/octocat');
    assert.match(result.yaml, /^name: "Octo Cat"$/m);
    assert.equal(result.pullRequest.title, 'Add signature: Octo Cat');
  });
});
