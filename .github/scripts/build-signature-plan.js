const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');
const { tmpdir } = require('node:os');

const DEFAULT_BRANCH = 'main';
const SIGNATORY_DIR = 'app/src/content/signatories';
const NO_RESPONSE = '_No response_';

const LIMIT = Object.freeze({
  githubHandle: 39,
  displayName: 120,
  linkedin: 200,
  affiliation: 120,
  statement: 280,
});

const FIELD = Object.freeze({
  name: ['Display name', 'Name'],
  linkedin: ['LinkedIn profile', 'LinkedIn'],
  affiliation: ['Affiliation'],
  statement: ['Statement'],
});

const GITHUB_HANDLE_RE = new RegExp(
  `^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,${LIMIT.githubHandle - 1}})$`,
);

function clean(value) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .trim();
}

function normalizeHeading(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseIssueFormBody(body) {
  const fields = {};
  let currentField = null;

  for (const line of clean(body).split('\n')) {
    const heading = line.match(/^###\s+(.+?)\s*$/);
    if (heading) {
      currentField = normalizeHeading(heading[1]);
      fields[currentField] = [];
    } else if (currentField) {
      fields[currentField].push(line);
    }
  }

  return Object.fromEntries(
    Object.entries(fields).map(([key, lines]) => [
      key,
      clean(lines.join('\n').replace(/<!--[\s\S]*?-->/g, '')),
    ]),
  );
}

function fieldValue(fields, aliases) {
  for (const alias of aliases) {
    const value = fields[normalizeHeading(alias)];
    if (value) return value;
  }
  return '';
}

function checkLength(value, fieldName) {
  const limit = LIMIT[fieldName];
  if (value.length > limit) throw new Error(`${fieldName} must be ${limit} characters or fewer`);
  return value;
}

function requiredText(value, fieldName) {
  const text = clean(value);
  if (!text) throw new Error(`${fieldName} is required`);
  return checkLength(text, fieldName);
}

function optionalText(value, fieldName) {
  const text = clean(value);
  if (!text || text === NO_RESPONSE) return undefined;
  return checkLength(text, fieldName);
}

function validateLinkedIn(value) {
  const url = optionalText(value, 'linkedin');
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    if (['http:', 'https:'].includes(parsed.protocol)) return url;
  } catch {
    // Fall through to one public validation error.
  }
  throw new Error('linkedin must be a valid URL');
}

function yamlString(value) {
  return JSON.stringify(value);
}

function signatureFromFields({ github, name, linkedin, affiliation, statement }) {
  github = clean(github);
  if (!GITHUB_HANDLE_RE.test(github)) throw new Error('github must be a valid GitHub handle');

  const signature = {
    github,
    name: requiredText(name, 'displayName'),
    linkedin: validateLinkedIn(linkedin),
    affiliation: optionalText(affiliation, 'affiliation'),
    statement: optionalText(statement, 'statement'),
  };

  const yaml = [`github: ${signature.github}`, `name: ${yamlString(signature.name)}`];
  if (signature.linkedin) yaml.push(`linkedin: ${yamlString(signature.linkedin)}`);
  if (signature.affiliation) yaml.push(`affiliation: ${yamlString(signature.affiliation)}`);
  if (signature.statement) yaml.push(`statement: ${yamlString(signature.statement)}`);

  return {
    ...signature,
    path: `${SIGNATORY_DIR}/${github}.yml`,
    yaml: `${yaml.join('\n')}\n`,
  };
}

function buildSignature(issue) {
  const fields = parseIssueFormBody(issue.body);
  return signatureFromFields({
    github: issue.user?.login,
    name: fieldValue(fields, FIELD.name),
    linkedin: fieldValue(fields, FIELD.linkedin),
    affiliation: fieldValue(fields, FIELD.affiliation),
    statement: fieldValue(fields, FIELD.statement),
  });
}

function buildDispatchSignature(inputs = {}) {
  return signatureFromFields({
    github: inputs.github,
    name: inputs.name,
    linkedin: inputs.linkedin,
    affiliation: inputs.affiliation,
    statement: inputs.statement,
  });
}

function buildBranchName(signature, { testMode, runId }) {
  return testMode ? `signature-test/${signature.github}-${runId}` : `signature/${signature.github}`;
}

function buildPullRequestPayload(signature, branch, testMode) {
  const body = testMode
    ? [
        'Test-mode signature PR.',
        '',
        'Do not merge. Success means the generated diff is correct and validation can run.',
      ]
    : [
        'Automated signature PR from the GitHub Issue Form.',
        '',
        `GitHub handle: @${signature.github}`,
        '',
        'Maintainer action: review the generated YAML, wait for validation, then merge if accepted.',
      ];

  return {
    title: testMode ? `[TEST] Add signature: ${signature.name}` : `Add signature: ${signature.name}`,
    head: branch,
    base: DEFAULT_BRANCH,
    draft: testMode,
    body: body.join('\n'),
  };
}

function buildRunPlan({ event, runId }) {
  const issue = event.issue ?? null;
  const testMode = !issue;
  const signature = issue ? buildSignature(issue) : buildDispatchSignature(event.inputs);
  const branch = buildBranchName(signature, { testMode, runId });

  return {
    issue,
    testMode,
    signature,
    branch,
    pullRequest: buildPullRequestPayload(signature, branch, testMode),
  };
}

function buildDryRunResult({ event, runId }) {
  const plan = buildRunPlan({ event, runId });

  return {
    status: 'dry-run',
    issue: plan.issue?.number ?? null,
    testMode: plan.testMode,
    branch: plan.branch,
    path: plan.signature.path,
    yaml: plan.signature.yaml,
    pullRequest: plan.pullRequest,
  };
}

function commitMessage(signature, testMode) {
  return testMode
    ? `[TEST] Add signature for ${signature.github}`
    : `Add signature for ${signature.github}`;
}

function writeOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  writeFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`, { flag: 'a' });
}

function writePlanFiles(plan) {
  const prBodyFile = join(process.env.RUNNER_TEMP || tmpdir(), 'signature-pr-body.md');

  if (!plan.duplicate) {
    mkdirSync(dirname(plan.signature.path), { recursive: true });
    writeFileSync(plan.signature.path, plan.signature.yaml);
  }
  writeFileSync(prBodyFile, plan.pullRequest.body);

  return { prBodyFile };
}

function buildActionPlan({ event, runId }) {
  const plan = buildRunPlan({ event, runId });
  const duplicate = existsSync(plan.signature.path);

  return {
    ...plan,
    duplicate,
    commitMessage: commitMessage(plan.signature, plan.testMode),
    duplicateMessage: `@${plan.signature.github} is already in the signature registry.`,
  };
}

function writeActionOutputs(plan, files) {
  writeOutput('branch', plan.branch);
  writeOutput('commit_message', plan.commitMessage);
  writeOutput('draft', String(plan.pullRequest.draft));
  writeOutput('duplicate', String(plan.duplicate));
  writeOutput('duplicate_message', plan.duplicateMessage);
  writeOutput('issue_number', plan.issue?.number ?? '');
  writeOutput('path', plan.signature.path);
  writeOutput('pr_body_file', files.prBodyFile);
  writeOutput('pr_title', plan.pullRequest.title);
  writeOutput('test_mode', String(plan.testMode));
}

function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const runId = process.env.GITHUB_RUN_ID || Date.now().toString();
  const dryRun = process.argv.includes('--dry-run') || process.env.SIGNATURE_PR_DRY_RUN === '1';

  if (!eventPath) throw new Error('GITHUB_EVENT_PATH is required');

  const event = JSON.parse(readFileSync(eventPath, 'utf8'));
  if (dryRun) {
    console.log(JSON.stringify(buildDryRunResult({ event, runId }), null, 2));
    return;
  }

  const plan = buildActionPlan({ event, runId });
  const files = writePlanFiles(plan);
  writeActionOutputs(plan, files);
  console.log(JSON.stringify({
    branch: plan.branch,
    duplicate: plan.duplicate,
    issue: plan.issue?.number ?? null,
    path: plan.signature.path,
    testMode: plan.testMode,
  }));
}

module.exports = {
  buildActionPlan,
  buildBranchName,
  buildDryRunResult,
  buildDispatchSignature,
  buildPullRequestPayload,
  buildSignature,
  parseIssueFormBody,
};

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
