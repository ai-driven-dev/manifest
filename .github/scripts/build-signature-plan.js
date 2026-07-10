const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');
const { tmpdir } = require('node:os');

const DEFAULT_BRANCH = 'main';
const SIGNATORY_DIR = 'app/src/content/signatories';
const NO_RESPONSE = '_No response_';

const LIMIT = Object.freeze({
  github: 39,
  name: 120,
  linkedin: 200,
  affiliation: 120,
  statement: 280,
});

const FIELD = Object.freeze({
  name: 'display name',
  linkedin: 'linkedin profile',
  affiliation: 'affiliation',
  statement: 'statement',
});

const YAML_FIELDS = ['github', 'name', 'linkedin', 'affiliation', 'statement'];
const GITHUB_HANDLE_RE = new RegExp(`^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,${LIMIT.github - 1}})$`);

/**
 * @typedef {Object} WorkflowIssue
 * @property {string} body
 * @property {number} number
 * @property {{ login: string }} user
 */

/**
 * @typedef {Object} Signature
 * @property {string} github
 * @property {string} name
 * @property {string | undefined} linkedin
 * @property {string | undefined} affiliation
 * @property {string | undefined} statement
 * @property {string} path
 * @property {string} yaml
 */

/**
 * @typedef {Object} PullRequestPlan
 * @property {string} base
 * @property {string} body
 * @property {boolean} draft
 * @property {string} head
 * @property {string} title
 */

/**
 * @typedef {Object} WorkflowPlan
 * @property {string} branch
 * @property {string} commitMessage
 * @property {boolean} duplicate
 * @property {string} duplicateMessage
 * @property {WorkflowIssue | null} issue
 * @property {PullRequestPlan} pullRequest
 * @property {Signature} signature
 * @property {boolean} testMode
 */

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
  let heading = null;

  for (const line of clean(body).split('\n')) {
    const match = line.match(/^###\s+(.+?)\s*$/);
    if (match) {
      heading = normalizeHeading(match[1]);
      fields[heading] = [];
    } else if (heading) {
      fields[heading].push(line);
    }
  }

  return Object.fromEntries(
    Object.entries(fields).map(([key, lines]) => [
      key,
      clean(lines.join('\n').replace(/<!--[\s\S]*?-->/g, '')),
    ]),
  );
}

function checkLength(value, field) {
  if (value.length > LIMIT[field]) throw new Error(`${field} must be ${LIMIT[field]} characters or fewer`);
  return value;
}

function requiredText(value, field) {
  const text = clean(value);
  if (!text) throw new Error(`${field} is required`);
  return checkLength(text, field);
}

function optionalText(value, field) {
  const text = clean(value);
  if (!text || text === NO_RESPONSE) return undefined;
  return checkLength(text, field);
}

function validateLinkedIn(value) {
  const url = optionalText(value, 'linkedin');
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    if (['http:', 'https:'].includes(parsed.protocol)) return url;
  } catch {}
  throw new Error('linkedin must be a valid URL');
}

function yamlValue(field, value) {
  return field === 'github' ? value : JSON.stringify(value);
}

function buildYaml(signature) {
  return `${YAML_FIELDS
    .filter((field) => signature[field])
    .map((field) => `${field}: ${yamlValue(field, signature[field])}`)
    .join('\n')}\n`;
}

/**
 * @param {{ github: string, name: string, linkedin?: string, affiliation?: string, statement?: string }} fields
 * @returns {Signature}
 */
function createSignature(fields) {
  let { github, name, linkedin, affiliation, statement } = fields;
  github = clean(github);
  if (!GITHUB_HANDLE_RE.test(github)) throw new Error('github must be a valid GitHub handle');

  const signature = {
    github,
    name: requiredText(name, 'name'),
    linkedin: validateLinkedIn(linkedin),
    affiliation: optionalText(affiliation, 'affiliation'),
    statement: optionalText(statement, 'statement'),
  };

  return {
    ...signature,
    path: `${SIGNATORY_DIR}/${github}.yml`,
    yaml: buildYaml(signature),
  };
}

function buildIssueSignature(issue) {
  const fields = parseIssueFormBody(issue.body);
  return createSignature({
    github: issue.user?.login,
    name: fields[FIELD.name],
    linkedin: fields[FIELD.linkedin],
    affiliation: fields[FIELD.affiliation],
    statement: fields[FIELD.statement],
  });
}

function buildDispatchSignature(inputs = {}) {
  return createSignature(inputs);
}

function buildPrBody(signature, testMode) {
  const lines = testMode
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

  return lines.join('\n');
}

/**
 * @param {{ event: { issue?: WorkflowIssue, inputs?: Object }, runId: string }} params
 * @returns {WorkflowPlan}
 */
function createWorkflowPlan(params) {
  const { event, runId } = params;
  const issue = event.issue ?? null;
  const testMode = !issue;
  const signature = issue ? buildIssueSignature(issue) : buildDispatchSignature(event.inputs);
  const branch = testMode ? `signature-test/${signature.github}-${runId}` : `signature/${signature.github}`;

  return {
    branch,
    commitMessage: testMode
      ? `[TEST] Add signature for ${signature.github}`
      : `Add signature for ${signature.github}`,
    duplicate: existsSync(signature.path),
    duplicateMessage: `@${signature.github} is already in the signature registry.`,
    issue,
    pullRequest: {
      base: DEFAULT_BRANCH,
      body: buildPrBody(signature, testMode),
      draft: testMode,
      head: branch,
      title: testMode ? `[TEST] Add signature: ${signature.name}` : `Add signature: ${signature.name}`,
    },
    signature,
    testMode,
  };
}

function dryRun(plan) {
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

function output(name, value) {
  if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`, { flag: 'a' });
}

function writeWorkflowPlan(plan) {
  const prBodyFile = join(process.env.RUNNER_TEMP || tmpdir(), 'signature-pr-body.md');

  if (!plan.duplicate) {
    mkdirSync(dirname(plan.signature.path), { recursive: true });
    writeFileSync(plan.signature.path, plan.signature.yaml);
  }
  writeFileSync(prBodyFile, plan.pullRequest.body);

  output('branch', plan.branch);
  output('commit_message', plan.commitMessage);
  output('draft', String(plan.pullRequest.draft));
  output('duplicate', String(plan.duplicate));
  output('duplicate_message', plan.duplicateMessage);
  output('issue_number', plan.issue?.number ?? '');
  output('path', plan.signature.path);
  output('pr_body_file', prBodyFile);
  output('pr_title', plan.pullRequest.title);
  output('test_mode', String(plan.testMode));
}

function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const runId = process.env.GITHUB_RUN_ID || Date.now().toString();
  const shouldDryRun = process.argv.includes('--dry-run') || process.env.SIGNATURE_PR_DRY_RUN === '1';

  if (!eventPath) throw new Error('GITHUB_EVENT_PATH is required');

  const event = JSON.parse(readFileSync(eventPath, 'utf8'));
  const plan = createWorkflowPlan({ event, runId });

  if (shouldDryRun) {
    console.log(JSON.stringify(dryRun(plan), null, 2));
    return;
  }

  writeWorkflowPlan(plan);
  console.log(JSON.stringify({
    branch: plan.branch,
    duplicate: plan.duplicate,
    issue: plan.issue?.number ?? null,
    path: plan.signature.path,
    testMode: plan.testMode,
  }));
}

module.exports = {
  createWorkflowPlan,
  buildDispatchSignature,
  buildIssueSignature,
  dryRun,
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
