const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const {
  buildRequestOutputs,
  parseIssueFormBody,
  readDispatchSignature,
  readIssueSignature,
} = require('./read-signature-request.js');

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
  it('uses the issue author as the GitHub handle', () => {
    assert.deepEqual(readIssueSignature(issue()), {
      github: 'octocat',
      name: 'Octo Cat',
      linkedin: 'https://www.linkedin.com/in/octocat/',
      affiliation: 'GitHub',
      statement: 'This is how I build software with AI.',
      path: 'app/src/content/signatories/octocat.yml',
    });
  });

  it('omits no-response optional fields', () => {
    const signature = readIssueSignature(issue(validBody({
      'LinkedIn profile': '_No response_',
      Affiliation: '',
      Statement: '',
    })));

    assert.equal(signature.linkedin, '');
    assert.equal(signature.affiliation, '');
    assert.equal(signature.statement, '');
  });

  it('rejects invalid LinkedIn URLs', () => {
    assert.throws(
      () => readIssueSignature(issue(validBody({ 'LinkedIn profile': 'not-a-url' }))),
      /linkedin must be a valid URL/,
    );
  });

  it('rejects invalid GitHub handles', () => {
    assert.throws(
      () => readDispatchSignature({ github: 'octocat-', name: 'Octo Cat' }),
      /github must be a valid GitHub handle/,
    );
  });

  it('accepts 280-character statements and rejects 281', () => {
    assert.equal(readIssueSignature(issue(validBody({ Statement: 'x'.repeat(280) }))).statement.length, 280);
    assert.throws(
      () => readIssueSignature(issue(validBody({ Statement: 'x'.repeat(281) }))),
      /statement must be 280 characters or fewer/,
    );
  });

  it('rejects multiline public fields', () => {
    assert.throws(
      () => readIssueSignature(issue(validBody({ Statement: 'first\nsecond' }))),
      /statement must be one line/,
    );
  });
});

describe('workflow outputs', () => {
  it('returns values used by the workflow shell steps', () => {
    const outputs = buildRequestOutputs({ event: { issue: issue() }, runId: '123' });

    assert.equal(outputs.github, 'octocat');
    assert.equal(outputs.name, 'Octo Cat');
    assert.equal(outputs.branch, 'signature/octocat');
    assert.equal(outputs.draft, 'false');
    assert.equal(outputs.issue_number, 42);
    assert.equal(outputs.path, 'app/src/content/signatories/octocat.yml');
    assert.equal(outputs.name_yaml, '"Octo Cat"');
    assert.equal(outputs.linkedin_yaml, '"https://www.linkedin.com/in/octocat/"');
  });

  it('returns draft test outputs from workflow_dispatch inputs', () => {
    const outputs = buildRequestOutputs({
      event: {
        inputs: {
          github: 'octocat',
          name: 'AIDD Test Signature',
          affiliation: 'Test run',
          statement: 'Test-mode signature; do not merge.',
        },
      },
      runId: '123',
    });

    assert.equal(outputs.branch, 'signature-test/octocat-123');
    assert.equal(outputs.draft, 'true');
    assert.equal(outputs.name_yaml, '"AIDD Test Signature"');
    assert.equal(outputs.linkedin_yaml, '');
    assert.equal(outputs.affiliation_yaml, '"Test run"');
  });

  it('validates workflow_dispatch inputs with the same rules', () => {
    assert.throws(
      () => readDispatchSignature({ github: 'octocat', name: '', linkedin: 'https://example.com' }),
      /name is required/,
    );
  });
});
