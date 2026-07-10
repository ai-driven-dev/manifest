import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const DEFAULT_BRANCH = 'main';
const GITHUB_API_ROOT = 'https://api.github.com';
const GITHUB_API_VERSION = '2022-11-28';
const SIGNATORY_DIR = 'app/src/content/signatories';
const NO_RESPONSE = '_No response_';

const FIELD_LIMITS = Object.freeze({
  githubHandle: 39,
  displayName: 120,
  linkedin: 200,
  affiliation: 120,
  statement: 280,
});

const ISSUE_FIELDS = Object.freeze({
  name: ['Display name', 'Name'],
  linkedin: ['LinkedIn profile', 'LinkedIn'],
  affiliation: ['Affiliation'],
  statement: ['Statement'],
});

const ISSUE_LABELS = Object.freeze({
  duplicate: 'signature-duplicate',
  needsFix: 'signature-needs-fix',
  prCreated: 'signature-pr-created',
});

const HTTP_STATUS = Object.freeze({
  ok: 200,
  created: 201,
  noContent: 204,
  notFound: 404,
  validationFailed: 422,
});

const SUCCESS_STATUSES = [HTTP_STATUS.ok, HTTP_STATUS.created, HTTP_STATUS.noContent];
const OPTIONAL_LABEL_FAILURE_STATUSES = [HTTP_STATUS.notFound, HTTP_STATUS.validationFailed];
const GITHUB_HANDLE_RE = new RegExp(
  `^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,${FIELD_LIMITS.githubHandle - 1}})$`,
);

function clean(value) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .trim();
}

function stripHtmlComments(value) {
  return clean(value).replace(/<!--[\s\S]*?-->/g, '').trim();
}

function normalizeHeading(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function parseIssueFormBody(body) {
  const fields = {};
  let current = null;

  for (const line of String(body ?? '').replace(/\r\n/g, '\n').split('\n')) {
    const heading = line.match(/^###\s+(.+?)\s*$/);
    if (heading) {
      current = normalizeHeading(heading[1]);
      fields[current] = [];
      continue;
    }
    if (current) fields[current].push(line);
  }

  return Object.fromEntries(
    Object.entries(fields).map(([key, lines]) => [key, stripHtmlComments(lines.join('\n'))]),
  );
}

function firstField(fields, names) {
  for (const name of names) {
    const value = fields[normalizeHeading(name)];
    if (value) return value;
  }
  return '';
}

function optionalField(value, fieldName) {
  const cleaned = clean(value);
  const maxLength = FIELD_LIMITS[fieldName];
  if (!cleaned || cleaned === NO_RESPONSE) return undefined;
  if (cleaned.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or fewer`);
  }
  return cleaned;
}

function requireField(value, fieldName) {
  const cleaned = clean(value);
  const maxLength = FIELD_LIMITS[fieldName];
  if (!cleaned) throw new Error(`${fieldName} is required`);
  if (cleaned.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or fewer`);
  }
  return cleaned;
}

function validateLinkedIn(value) {
  const cleaned = optionalField(value, 'linkedin');
  if (!cleaned) return undefined;
  let parsed;
  try {
    parsed = new URL(cleaned);
  } catch {
    throw new Error('linkedin must be a valid URL');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('linkedin must use http or https');
  }
  return cleaned;
}

function yamlString(value) {
  return JSON.stringify(value);
}

function signatureFromFields({ github, name, linkedin, affiliation, statement }) {
  github = clean(github);
  if (!GITHUB_HANDLE_RE.test(github)) {
    throw new Error('github must be a valid GitHub handle');
  }

  name = requireField(name, 'displayName');
  linkedin = validateLinkedIn(linkedin);
  affiliation = optionalField(affiliation, 'affiliation');
  statement = optionalField(statement, 'statement');

  const lines = [`github: ${github}`, `name: ${yamlString(name)}`];
  if (linkedin) lines.push(`linkedin: ${yamlString(linkedin)}`);
  if (affiliation) lines.push(`affiliation: ${yamlString(affiliation)}`);
  if (statement) lines.push(`statement: ${yamlString(statement)}`);

  return {
    github,
    name,
    linkedin,
    affiliation,
    statement,
    path: `${SIGNATORY_DIR}/${github}.yml`,
    yaml: `${lines.join('\n')}\n`,
  };
}

export function buildSignature(issue) {
  const fields = parseIssueFormBody(issue.body);
  return signatureFromFields({
    github: issue.user?.login,
    name: firstField(fields, ISSUE_FIELDS.name),
    linkedin: firstField(fields, ISSUE_FIELDS.linkedin),
    affiliation: firstField(fields, ISSUE_FIELDS.affiliation),
    statement: firstField(fields, ISSUE_FIELDS.statement),
  });
}

export function buildDispatchSignature(inputs = {}) {
  return signatureFromFields({
    github: inputs.github,
    name: inputs.name,
    linkedin: inputs.linkedin,
    affiliation: inputs.affiliation,
    statement: inputs.statement,
  });
}

export function buildBranchName(signature, { testMode, runId }) {
  if (testMode) return `signature-test/${signature.github}-${runId}`;
  return `signature/${signature.github}`;
}

export function buildPullRequestPayload(signature, branch, testMode) {
  return {
    title: testMode ? `[TEST] Add signature: ${signature.name}` : `Add signature: ${signature.name}`,
    head: branch,
    base: DEFAULT_BRANCH,
    draft: testMode,
    body: testMode
      ? [
          'Test-mode signature PR.',
          '',
          'Do not merge. Success means the generated diff is correct and validation can run.',
        ].join('\n')
      : [
          'Automated signature PR from the GitHub Issue Form.',
          '',
          `GitHub handle: @${signature.github}`,
          '',
          'Maintainer action: review the generated YAML, wait for validation, then merge if accepted.',
        ].join('\n'),
  };
}

class GitHubClient {
  constructor({ token, repository }) {
    const [owner, repo] = repository.split('/');
    this.owner = owner;
    this.repo = repo;
    this.token = token;
  }

  async request({ method, path, body, okStatuses = SUCCESS_STATUSES }) {
    const response = await fetch(`${GITHUB_API_ROOT}${path}`, {
      method,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!okStatuses.includes(response.status)) {
      const message = data?.message || `GitHub API returned ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  async getContent(path, ref = DEFAULT_BRANCH) {
    try {
      return await this.request({
        method: 'GET',
        path: `/repos/${this.owner}/${this.repo}/contents/${encodeURIComponentPath(path)}?ref=${encodeURIComponent(ref)}`,
      });
    } catch (error) {
      if (error.status === HTTP_STATUS.notFound) return null;
      throw error;
    }
  }

  async getMainSha() {
    const ref = await this.request({
      method: 'GET',
      path: `/repos/${this.owner}/${this.repo}/git/ref/heads/${DEFAULT_BRANCH}`,
    });
    return ref.object.sha;
  }

  async createBranch(branch, sha) {
    try {
      await this.request({
        method: 'POST',
        path: `/repos/${this.owner}/${this.repo}/git/refs`,
        body: {
          ref: `refs/heads/${branch}`,
          sha,
        },
      });
    } catch (error) {
      if (error.status !== HTTP_STATUS.validationFailed) throw error;
    }
  }

  async putContent({ path, branch, content, message }) {
    const existing = await this.getContent(path, branch);
    const body = {
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch,
    };
    if (existing?.sha) body.sha = existing.sha;
    return this.request({
      method: 'PUT',
      path: `/repos/${this.owner}/${this.repo}/contents/${encodeURIComponentPath(path)}`,
      body,
    });
  }

  async findOpenPr(branch) {
    const prs = await this.request({
      method: 'GET',
      path: `/repos/${this.owner}/${this.repo}/pulls?state=open&head=${encodeURIComponent(`${this.owner}:${branch}`)}`,
    });
    return prs[0] ?? null;
  }

  async createPullRequest(payload) {
    return this.request({
      method: 'POST',
      path: `/repos/${this.owner}/${this.repo}/pulls`,
      body: payload,
    });
  }

  async comment(issueNumber, body) {
    return this.request({
      method: 'POST',
      path: `/repos/${this.owner}/${this.repo}/issues/${issueNumber}/comments`,
      body: { body },
    });
  }

  async addLabels(issueNumber, labels) {
    try {
      return await this.request({
        method: 'POST',
        path: `/repos/${this.owner}/${this.repo}/issues/${issueNumber}/labels`,
        body: { labels },
      });
    } catch (error) {
      if (!OPTIONAL_LABEL_FAILURE_STATUSES.includes(error.status)) throw error;
      console.warn(`Could not add issue labels: ${labels.join(', ')}`);
      return null;
    }
  }

  async closeIssue(issueNumber) {
    return this.request({
      method: 'PATCH',
      path: `/repos/${this.owner}/${this.repo}/issues/${issueNumber}`,
      body: {
        state: 'closed',
        state_reason: 'completed',
      },
    });
  }
}

function encodeURIComponentPath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

export async function runSignaturePr({ event, repository, token, runId }) {
  const issue = event.issue ?? null;
  const testMode = !issue;
  const signature = issue ? buildSignature(issue) : buildDispatchSignature(event.inputs);
  const branch = buildBranchName(signature, { testMode, runId });
  const client = new GitHubClient({ token, repository });

  const existingFile = await client.getContent(signature.path, DEFAULT_BRANCH);
  if (existingFile) {
    if (issue) {
      await client.comment(issue.number, `@${signature.github} is already in the signature registry.`);
      await client.addLabels(issue.number, [ISSUE_LABELS.duplicate]);
    }
    return { status: 'duplicate' };
  }

  if (!testMode) {
    const existingPr = await client.findOpenPr(branch);
    if (existingPr) {
      await client.comment(issue.number, `A signature pull request is already open: ${existingPr.html_url}`);
      return { status: 'existing-pr', url: existingPr.html_url };
    }
  }

  const mainSha = await client.getMainSha();
  await client.createBranch(branch, mainSha);
  await client.putContent({
    path: signature.path,
    branch,
    content: signature.yaml,
    message: testMode ? `[TEST] Add signature for ${signature.github}` : `Add signature for ${signature.github}`,
  });

  const prPayload = buildPullRequestPayload(signature, branch, testMode);
  const pr = await client.createPullRequest(prPayload);
  if (issue) {
    await client.comment(issue.number, `Created signature pull request: ${pr.html_url}`);
    await client.addLabels(issue.number, [ISSUE_LABELS.prCreated]);
    await client.closeIssue(issue.number);
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
    const result = await runSignaturePr({ event, repository, token, runId });
    console.log(JSON.stringify(result));
  } catch (error) {
    const issue = event.issue;
    if (issue?.number && token && repository) {
      const client = new GitHubClient({ token, repository });
      await client.comment(issue.number, `Signature request could not be processed: ${error.message}`);
      await client.addLabels(issue.number, [ISSUE_LABELS.needsFix]);
    }
    throw error;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
