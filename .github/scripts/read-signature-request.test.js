const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const { existsSync, mkdtempSync, readFileSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { describe, it } = require('node:test');

const SCRIPT_PATH = join(__dirname, 'read-signature-request.js');

function issueFormBody(overrides = {}) {
  return Object.entries({
    'Display name': 'Octo Cat',
    'LinkedIn profile': 'https://www.linkedin.com/in/octocat/',
    Affiliation: 'GitHub',
    Statement: 'This is how I build software with AI.',
    ...overrides,
  })
    .map(([label, value]) => `### ${label}\n\n<!-- GitHub Issue Form metadata -->\n${value}`)
    .join('\n\n');
}

function signatureIssueEvent(overrides = {}) {
  return {
    issue: {
      number: 42,
      user: { login: 'octocat' },
      body: issueFormBody(),
      ...overrides,
    },
  };
}

function testWorkspace() {
  const dir = mkdtempSync(join(tmpdir(), 'signature-request-'));
  return {
    eventPath: join(dir, 'event.json'),
    outputPath: join(dir, 'github-output.txt'),
  };
}

function parseGithubOutput(value) {
  return Object.fromEntries(
    value
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

function readGithubOutput(path) {
  return existsSync(path) ? parseGithubOutput(readFileSync(path, 'utf8')) : {};
}

function runRequestReader(event, args = []) {
  const workspace = testWorkspace();
  writeFileSync(workspace.eventPath, JSON.stringify(event));

  const stdout = execFileSync('node', [SCRIPT_PATH, ...args], {
    env: {
      ...process.env,
      GITHUB_EVENT_PATH: workspace.eventPath,
      GITHUB_OUTPUT: workspace.outputPath,
    },
    encoding: 'utf8',
  });

  return {
    stdout: JSON.parse(stdout),
    outputs: readGithubOutput(workspace.outputPath),
  };
}

function failRequestReader(event) {
  const workspace = testWorkspace();
  writeFileSync(workspace.eventPath, JSON.stringify(event));

  return spawnSync('node', [SCRIPT_PATH], {
    env: {
      ...process.env,
      GITHUB_EVENT_PATH: workspace.eventPath,
      GITHUB_OUTPUT: workspace.outputPath,
    },
    encoding: 'utf8',
  });
}

describe('signature request reader behavior', () => {
  it('prepares a signer issue for the workflow using the issue author as the public GitHub handle', () => {
    const { stdout, outputs } = runRequestReader(signatureIssueEvent());

    assert.deepEqual(stdout, {
      github: 'octocat',
      issue: 42,
      path: 'app/src/content/signatories/octocat.yml',
    });
    assert.equal(outputs.github, 'octocat');
    assert.equal(outputs.name, 'Octo Cat');
    assert.equal(outputs.branch, 'signature/octocat-42');
    assert.equal(outputs.issue_number, '42');
    assert.equal(outputs.path, 'app/src/content/signatories/octocat.yml');
    assert.equal(outputs.name_yaml, '"Octo Cat"');
    assert.equal(outputs.linkedin_yaml, '"https://www.linkedin.com/in/octocat/"');
    assert.equal(outputs.affiliation_yaml, '"GitHub"');
    assert.equal(outputs.statement_yaml, '"This is how I build software with AI."');
  });

  it('keeps unanswered optional signer fields out of the YAML values consumed by the workflow', () => {
    const { outputs } = runRequestReader(signatureIssueEvent({
      body: issueFormBody({
        'LinkedIn profile': '_No response_',
        Affiliation: '',
        Statement: '',
      }),
    }));

    assert.equal(outputs.linkedin_yaml, '');
    assert.equal(outputs.affiliation_yaml, '');
    assert.equal(outputs.statement_yaml, '');
  });

  it('escapes public text before the workflow writes the YAML file', () => {
    const { outputs } = runRequestReader(signatureIssueEvent({
      body: issueFormBody({
        'Display name': 'Ada "AI" Lovelace',
        Statement: 'I review: plan, code, tests.',
      }),
    }));

    assert.equal(outputs.name_yaml, '"Ada \\"AI\\" Lovelace"');
    assert.equal(outputs.statement_yaml, '"I review: plan, code, tests."');
  });

  it('fails a signer issue when the required display name was left unanswered', () => {
    const result = failRequestReader(signatureIssueEvent({
      body: issueFormBody({ 'Display name': '_No response_' }),
    }));

    assert.equal(result.status, 1);
    assert.match(result.stderr, /name is required/);
  });

  it('fails a signer issue when the LinkedIn field cannot become a public URL', () => {
    const result = failRequestReader(signatureIssueEvent({
      body: issueFormBody({ 'LinkedIn profile': 'not-a-url' }),
    }));

    assert.equal(result.status, 1);
    assert.match(result.stderr, /linkedin must be a valid URL/);
  });

  it('fails a signer issue when the public statement is too long for the signature card', () => {
    const result = failRequestReader(signatureIssueEvent({
      body: issueFormBody({ Statement: 'x'.repeat(281) }),
    }));

    assert.equal(result.status, 1);
    assert.match(result.stderr, /statement must be 280 characters or fewer/);
  });

  it('fails a signer issue when a public field contains multiple lines', () => {
    const result = failRequestReader(signatureIssueEvent({
      body: issueFormBody({ Statement: 'first line\nsecond line' }),
    }));

    assert.equal(result.status, 1);
    assert.match(result.stderr, /statement must be one line/);
  });

  it('fails when it is not called from a GitHub issue event', () => {
    const result = failRequestReader({
      inputs: {
        github: 'octocat',
        name: 'Octo Cat',
      },
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /issue event is required/);
  });

  it('prints a dry-run summary without exposing GitHub Actions outputs', () => {
    const { stdout, outputs } = runRequestReader(signatureIssueEvent(), ['--dry-run']);

    assert.equal(stdout.status, 'dry-run');
    assert.equal(stdout.github, 'octocat');
    assert.equal(stdout.issue_number, 42);
    assert.deepEqual(outputs, {});
  });
});
