const { readFileSync, writeFileSync } = require('node:fs');

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

const GITHUB_HANDLE_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

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

function checkOneLine(value, field) {
  if (value.includes('\n')) throw new Error(`${field} must be one line`);
  return value;
}

function checkLength(value, field) {
  if (value.length > LIMIT[field]) throw new Error(`${field} must be ${LIMIT[field]} characters or fewer`);
  return value;
}

function requiredText(value, field) {
  const text = clean(value);
  if (!text) throw new Error(`${field} is required`);
  return checkLength(checkOneLine(text, field), field);
}

function optionalText(value, field) {
  const text = clean(value);
  if (!text || text === NO_RESPONSE) return '';
  return checkLength(checkOneLine(text, field), field);
}

function validateGithubHandle(value) {
  const github = clean(value);
  if (!GITHUB_HANDLE_RE.test(github)) throw new Error('github must be a valid GitHub handle');
  return github;
}

function validateLinkedIn(value) {
  const url = optionalText(value, 'linkedin');
  if (!url) return '';

  try {
    const parsed = new URL(url);
    if (['http:', 'https:'].includes(parsed.protocol)) return url;
  } catch {}
  throw new Error('linkedin must be a valid URL');
}

function validateSignature(fields) {
  const github = validateGithubHandle(fields.github);

  return {
    github,
    name: requiredText(fields.name, 'name'),
    linkedin: validateLinkedIn(fields.linkedin),
    affiliation: optionalText(fields.affiliation, 'affiliation'),
    statement: optionalText(fields.statement, 'statement'),
    path: `${SIGNATORY_DIR}/${github}.yml`,
  };
}

function readIssueSignature(issue) {
  const fields = parseIssueFormBody(issue.body);

  return validateSignature({
    github: issue.user?.login,
    name: fields[FIELD.name],
    linkedin: fields[FIELD.linkedin],
    affiliation: fields[FIELD.affiliation],
    statement: fields[FIELD.statement],
  });
}

function readDispatchSignature(inputs = {}) {
  return validateSignature(inputs);
}

function yamlString(value) {
  return value ? JSON.stringify(value) : '';
}

function buildRequestOutputs({ event, runId }) {
  const issue = event.issue ?? null;
  const testMode = !issue;
  const signature = issue ? readIssueSignature(issue) : readDispatchSignature(event.inputs);
  const branch = testMode ? `signature-test/${signature.github}-${runId}` : `signature/${signature.github}`;

  return {
    github: signature.github,
    name: signature.name,
    path: signature.path,
    branch,
    draft: String(testMode),
    issue_number: issue?.number ?? '',
    name_yaml: yamlString(signature.name),
    linkedin_yaml: yamlString(signature.linkedin),
    affiliation_yaml: yamlString(signature.affiliation),
    statement_yaml: yamlString(signature.statement),
    test_mode: String(testMode),
  };
}

function writeOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`, { flag: 'a' });
}

function writeOutputs(outputs) {
  for (const [name, value] of Object.entries(outputs)) writeOutput(name, value);
}

function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const runId = process.env.GITHUB_RUN_ID || Date.now().toString();
  const shouldDryRun = process.argv.includes('--dry-run') || process.env.SIGNATURE_PR_DRY_RUN === '1';

  if (!eventPath) throw new Error('GITHUB_EVENT_PATH is required');

  const event = JSON.parse(readFileSync(eventPath, 'utf8'));
  const outputs = buildRequestOutputs({ event, runId });

  if (shouldDryRun) {
    console.log(JSON.stringify({ status: 'dry-run', ...outputs }, null, 2));
    return;
  }

  writeOutputs(outputs);
  console.log(JSON.stringify({
    github: outputs.github,
    issue: outputs.issue_number || null,
    path: outputs.path,
    testMode: outputs.test_mode === 'true',
  }));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
