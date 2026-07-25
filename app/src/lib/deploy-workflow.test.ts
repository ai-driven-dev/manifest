import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

function readRepositoryFile(path: string): string {
  return readFileSync(
    fileURLToPath(new URL(`../../../${path}`, import.meta.url)),
    'utf8',
  );
}

const buildWorkflow = readRepositoryFile('.github/workflows/build-image.yml');
const requestWorkflow = readRepositoryFile(
  '.github/workflows/request-deploy.yml',
);
const compose = readRepositoryFile('app/compose.yaml');

describe('Manifest deployment boundary', () => {
  it('builds, tests and attests only on a GitHub-hosted runner', () => {
    expect(buildWorkflow).toContain('runs-on: ubuntu-latest');
    expect(buildWorkflow).not.toContain('self-hosted');
    expect(buildWorkflow).toContain('run: npm run build');
    expect(buildWorkflow).toContain('run: npm test');
    expect(buildWorkflow).toContain('run: bash tests/check-component-loc.sh');
    expect(buildWorkflow).toContain(
      'tags: ${{ env.IMAGE }}:sha-${{ github.sha }}',
    );
    expect(buildWorkflow).not.toContain(':latest');
    expect(buildWorkflow).toContain(
      'subject-digest: ${{ steps.build.outputs.digest }}',
    );
    expect(buildWorkflow).toContain('push-to-registry: true');
    expect(buildWorkflow).toContain('name: manifest-image-digest');
    expect(buildWorkflow).toContain('retention-days: 1');
  });

  it('requests deployment only for a successful canonical main push', () => {
    expect(requestWorkflow).toContain('workflow_run:');
    expect(requestWorkflow).toContain(
      "github.repository == 'ai-driven-dev/manifest'",
    );
    expect(requestWorkflow).toContain(
      "github.event.workflow_run.conclusion == 'success'",
    );
    expect(requestWorkflow).toContain(
      "github.event.workflow_run.event == 'push'",
    );
    expect(requestWorkflow).toContain(
      "github.event.workflow_run.head_branch == 'main'",
    );
    expect(requestWorkflow).toContain(
      "github.event.workflow_run.head_repository.full_name == 'ai-driven-dev/manifest'",
    );
  });

  it('limits the bridge token to Actions on aidd-ops', () => {
    expect(requestWorkflow).toContain('repositories: aidd-ops');
    expect(requestWorkflow).toContain('permission-actions: write');
    expect(requestWorkflow).not.toContain('permission-contents: write');
    expect(requestWorkflow).not.toContain('self-hosted');
    expect(requestWorkflow).toContain(
      'repos/ai-driven-dev/aidd-ops/actions/workflows/deploy-manifest.yml/dispatches',
    );
    expect(requestWorkflow).toContain('gh run download "$SOURCE_RUN_ID"');
    expect(requestWorkflow).toContain('source_digest: $digest');
  });

  it('does not retain a mutable image fallback in Compose', () => {
    expect(compose).toContain('${IMAGE_REF:?');
    expect(compose).not.toContain(':latest');
    expect(compose).not.toContain('build:');
  });
});
