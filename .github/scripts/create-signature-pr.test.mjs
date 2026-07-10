import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildBranchName,
  buildDispatchSignature,
  buildPullRequestPayload,
  buildSignature,
  parseIssueFormBody,
  runSignaturePr,
} from './create-signature-pr.mjs';

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

describe('runSignaturePr', () => {
  it('does not fail an otherwise created signature PR when optional issue labels are missing', async (t) => {
    const originalFetch = globalThis.fetch;
    const originalWarn = console.warn;
    const calls = [];

    console.warn = () => {};
    globalThis.fetch = async (url, options = {}) => {
      const method = options.method ?? 'GET';
      const path = new URL(url).pathname;
      calls.push({ method, path });

      if (method === 'GET' && path.endsWith('/contents/app/src/content/signatories/octocat.yml')) {
        return json({ message: 'Not Found' }, 404);
      }
      if (method === 'GET' && path.endsWith('/pulls')) return json([]);
      if (method === 'GET' && path.endsWith('/git/ref/heads/main')) {
        return json({ object: { sha: 'main-sha' } });
      }
      if (method === 'POST' && path.endsWith('/git/refs')) return json({}, 201);
      if (method === 'PUT' && path.endsWith('/contents/app/src/content/signatories/octocat.yml')) {
        return json({ content: { sha: 'signature-sha' } }, 201);
      }
      if (method === 'POST' && path.endsWith('/pulls')) {
        return json({ html_url: 'https://github.com/ai-driven-dev/manifest/pull/123' }, 201);
      }
      if (method === 'POST' && path.endsWith('/issues/42/comments')) return json({}, 201);
      if (method === 'POST' && path.endsWith('/issues/42/labels')) {
        return json({ message: 'Validation Failed' }, 422);
      }
      if (method === 'PATCH' && path.endsWith('/issues/42')) return json({});

      return json({ message: `Unexpected ${method} ${path}` }, 500);
    };
    t.after(() => {
      globalThis.fetch = originalFetch;
      console.warn = originalWarn;
    });

    const result = await runSignaturePr({
      event: { issue: issue() },
      repository: 'ai-driven-dev/manifest',
      token: 'token',
      runId: '123',
    });

    assert.deepEqual(result, {
      status: 'created',
      url: 'https://github.com/ai-driven-dev/manifest/pull/123',
      testMode: false,
    });
    assert.ok(calls.some((call) => call.method === 'POST' && call.path.endsWith('/issues/42/labels')));
    assert.ok(calls.some((call) => call.method === 'PATCH' && call.path.endsWith('/issues/42')));
  });
});

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
