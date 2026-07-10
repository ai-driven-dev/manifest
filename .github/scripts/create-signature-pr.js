const { readFileSync } = require('node:fs');

const DEFAULT_BRANCH = 'main';
const SIGNATORY_DIR = 'app/src/content/signatories';
const NO_RESPONSE = '_No response_';

const GITHUB_API = Object.freeze({
  root: 'https://api.github.com',
  version: '2022-11-28',
});

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

const LABEL = Object.freeze({
  duplicate: 'signature-duplicate',
  needsFix: 'signature-needs-fix',
  prCreated: 'signature-pr-created',
});

const STATUS = Object.freeze({
  ok: 200,
  created: 201,
  noContent: 204,
  notFound: 404,
  validationFailed: 422,
});

const OK = [STATUS.ok, STATUS.created, STATUS.noContent];
const OPTIONAL_LABEL_ERRORS = [STATUS.notFound, STATUS.validationFailed];
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

function github({ repository, token }) {
  const [owner, repo] = repository.split('/');
  return {
    owner,
    repo,
    token,
    path: (suffix) => `/repos/${owner}/${repo}${suffix}`,
  };
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

async function request(gh, { method, path, body, ok = OK }) {
  const response = await fetch(`${GITHUB_API.root}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${gh.token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': GITHUB_API.version,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (ok.includes(response.status)) return data;

  const error = new Error(data?.message || `GitHub API returned ${response.status}`);
  error.status = response.status;
  error.data = data;
  throw error;
}

async function getFile(gh, path, ref = DEFAULT_BRANCH) {
  try {
    return await request(gh, {
      method: 'GET',
      path: gh.path(`/contents/${encodePath(path)}?ref=${encodeURIComponent(ref)}`),
    });
  } catch (error) {
    if (error.status === STATUS.notFound) return null;
    throw error;
  }
}

async function getBranchSha(gh) {
  const ref = await request(gh, {
    method: 'GET',
    path: gh.path(`/git/ref/heads/${DEFAULT_BRANCH}`),
  });
  return ref.object.sha;
}

async function createBranch(gh, branch, sha) {
  try {
    await request(gh, {
      method: 'POST',
      path: gh.path('/git/refs'),
      body: { ref: `refs/heads/${branch}`, sha },
    });
  } catch (error) {
    if (error.status !== STATUS.validationFailed) throw error;
  }
}

async function writeSignatureFile(gh, signature, branch, testMode) {
  const existing = await getFile(gh, signature.path, branch);
  const body = {
    branch,
    content: Buffer.from(signature.yaml, 'utf8').toString('base64'),
    message: testMode
      ? `[TEST] Add signature for ${signature.github}`
      : `Add signature for ${signature.github}`,
  };
  if (existing?.sha) body.sha = existing.sha;

  await request(gh, {
    method: 'PUT',
    path: gh.path(`/contents/${encodePath(signature.path)}`),
    body,
  });
}

async function findOpenPr(gh, branch) {
  const head = encodeURIComponent(`${gh.owner}:${branch}`);
  const prs = await request(gh, {
    method: 'GET',
    path: gh.path(`/pulls?state=open&head=${head}`),
  });
  return prs[0] ?? null;
}

async function createPr(gh, payload) {
  return request(gh, {
    method: 'POST',
    path: gh.path('/pulls'),
    body: payload,
  });
}

async function commentIssue(gh, issueNumber, body) {
  await request(gh, {
    method: 'POST',
    path: gh.path(`/issues/${issueNumber}/comments`),
    body: { body },
  });
}

async function addIssueLabels(gh, issueNumber, labels) {
  try {
    await request(gh, {
      method: 'POST',
      path: gh.path(`/issues/${issueNumber}/labels`),
      body: { labels },
    });
  } catch (error) {
    if (!OPTIONAL_LABEL_ERRORS.includes(error.status)) throw error;
    console.warn(`Could not add issue labels: ${labels.join(', ')}`);
  }
}

async function closeIssue(gh, issueNumber) {
  await request(gh, {
    method: 'PATCH',
    path: gh.path(`/issues/${issueNumber}`),
    body: { state: 'closed', state_reason: 'completed' },
  });
}

async function runSignaturePr({ event, repository, token, runId }) {
  const issue = event.issue ?? null;
  const testMode = !issue;
  const signature = issue ? buildSignature(issue) : buildDispatchSignature(event.inputs);
  const branch = buildBranchName(signature, { testMode, runId });
  const gh = github({ repository, token });

  if (await getFile(gh, signature.path)) {
    if (issue) {
      await commentIssue(gh, issue.number, `@${signature.github} is already in the signature registry.`);
      await addIssueLabels(gh, issue.number, [LABEL.duplicate]);
    }
    return { status: 'duplicate' };
  }

  if (!testMode) {
    const existingPr = await findOpenPr(gh, branch);
    if (existingPr) {
      await commentIssue(gh, issue.number, `A signature pull request is already open: ${existingPr.html_url}`);
      return { status: 'existing-pr', url: existingPr.html_url };
    }
  }

  await createBranch(gh, branch, await getBranchSha(gh));
  await writeSignatureFile(gh, signature, branch, testMode);

  const pr = await createPr(gh, buildPullRequestPayload(signature, branch, testMode));
  if (issue) {
    await commentIssue(gh, issue.number, `Created signature pull request: ${pr.html_url}`);
    await addIssueLabels(gh, issue.number, [LABEL.prCreated]);
    await closeIssue(gh, issue.number);
  }

  return { status: 'created', url: pr.html_url, testMode };
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const runId = process.env.GITHUB_RUN_ID || Date.now().toString();

  if (!token) throw new Error('GITHUB_TOKEN is required');
  if (!repository) throw new Error('GITHUB_REPOSITORY is required');
  if (!eventPath) throw new Error('GITHUB_EVENT_PATH is required');

  const event = JSON.parse(readFileSync(eventPath, 'utf8'));
  try {
    console.log(JSON.stringify(await runSignaturePr({ event, repository, token, runId })));
  } catch (error) {
    if (event.issue?.number) {
      const gh = github({ repository, token });
      await commentIssue(gh, event.issue.number, `Signature request could not be processed: ${error.message}`);
      await addIssueLabels(gh, event.issue.number, [LABEL.needsFix]);
    }
    throw error;
  }
}

module.exports = {
  buildBranchName,
  buildDispatchSignature,
  buildPullRequestPayload,
  buildSignature,
  parseIssueFormBody,
  runSignaturePr,
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
