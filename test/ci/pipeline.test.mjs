/**
 * P1.06 — the committed workflow must match cicd.md §1.
 *
 * The runnable pipeline (scripts/ci/run-pipeline.mjs) and the GitHub Actions
 * workflow are two expressions of one stage list. These tests keep them from
 * drifting, and assert the properties AC-1..AC-5 actually claim.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { parse } from 'yaml';

import { STAGES, FORBIDDEN_CI_SECRET_PATTERNS } from '../../scripts/ci/stages.mjs';

const ROOT = process.cwd();
const WORKFLOW_PATH = join(ROOT, '.github', 'workflows', 'ci.yml');
const workflowSource = readFileSync(WORKFLOW_PATH, 'utf8');
const workflow = parse(workflowSource);

/** Job id per stage id, in pipeline order. */
const JOB_FOR_STAGE = {
  lint: 'lint',
  typecheck: 'typecheck',
  unit: 'unit',
  integration: 'integration',
  'security-static': 'security-static',
};

describe('cicd.md §1 — stages 1-5 exist in the documented order (AC-1)', () => {
  it('declares exactly the five wave-1 stages', () => {
    expect(STAGES.map((s) => s.id)).toEqual([
      'lint',
      'typecheck',
      'unit',
      'integration',
      'security-static',
    ]);
  });

  it('has a job for every stage', () => {
    for (const stage of STAGES) {
      expect(workflow.jobs, `no job for stage ${stage.id}`).toHaveProperty(JOB_FOR_STAGE[stage.id]);
    }
  });

  it('chains each stage to its predecessor so order is enforced, not hoped for', () => {
    for (let i = 1; i < STAGES.length; i += 1) {
      const job = workflow.jobs[JOB_FOR_STAGE[STAGES[i].id]];
      const previous = JOB_FOR_STAGE[STAGES[i - 1].id];
      expect(job.needs, `${STAGES[i].id} must need ${previous}`).toContain(previous);
    }
  });

  it('EX-P1-06a: a red stage prevents every later stage from running', () => {
    // `needs` is GitHub's blocking primitive: a failed dependency leaves
    // dependents skipped, never successful. Assert none of them opts out.
    for (const stage of STAGES.slice(1)) {
      const job = workflow.jobs[JOB_FOR_STAGE[stage.id]];
      expect(job.if, `${stage.id} must not override the needs gate`).toBeUndefined();
      expect(job['continue-on-error']).toBeUndefined();
    }
  });

  it('no stage is allowed to fail silently', () => {
    for (const job of Object.values(workflow.jobs)) {
      expect(job['continue-on-error']).toBeUndefined();
      for (const step of job.steps ?? []) {
        expect(step['continue-on-error']).toBeUndefined();
      }
    }
  });

  it('runs the same script the local pipeline runs', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    for (const stage of STAGES) {
      expect(pkg.scripts, `package.json has no "${stage.script}" script`).toHaveProperty(
        stage.script,
      );
      const job = workflow.jobs[JOB_FOR_STAGE[stage.id]];
      const commands = (job.steps ?? []).map((s) => s.run).filter(Boolean).join('\n');
      expect(commands, `${stage.id} must run pnpm ${stage.script}`).toContain(
        `pnpm ${stage.script}`,
      );
    }
  });
});

describe('fitness functions are a first-class stage (AC-2)', () => {
  it('security/static runs pnpm fitness as a required step', () => {
    const job = workflow.jobs['security-static'];
    const commands = job.steps.map((s) => s.run).filter(Boolean);
    expect(commands.some((c) => c.includes('pnpm fitness'))).toBe(true);
  });

  it('is a job in the graph, not an optional or manually dispatched extra', () => {
    const job = workflow.jobs['security-static'];
    expect(job.needs).toBeDefined();
    expect(job.if).toBeUndefined();
    expect(workflow.on).not.toHaveProperty('workflow_dispatch');
  });

  it('checks out full history so FF-19 can scan it (P1.07 AC-3)', () => {
    const checkout = workflow.jobs['security-static'].steps.find((s) =>
      String(s.uses ?? '').startsWith('actions/checkout'),
    );
    expect(checkout.with['fetch-depth']).toBe(0);
  });
});

describe('triggers (AC-4)', () => {
  it('runs on pull request targeting main', () => {
    expect(workflow.on.pull_request.branches).toContain('main');
  });

  it('runs on push, which covers merge to main', () => {
    expect(workflow.on.push.branches).toContain('**');
  });
});

describe('no stage requires a provider credential (AC-5, cicd.md §2, FF-08)', () => {
  it('forces PROVIDER_MODE=mock for every job', () => {
    expect(workflow.env.PROVIDER_MODE).toBe('mock');
  });

  it('references no provider or long-lived AWS credential anywhere in the workflow', () => {
    for (const pattern of FORBIDDEN_CI_SECRET_PATTERNS) {
      expect(
        pattern.test(workflowSource),
        `CI workflow references a forbidden credential matching ${pattern}`,
      ).toBe(false);
    }
  });

  it('uses no stored repository secret other than the ephemeral GITHUB_TOKEN', () => {
    // cicd.md §6 — "No long-lived AWS keys in repository secrets."
    //
    // GITHUB_TOKEN is not a stored secret: GitHub mints it per job, scopes it
    // by the workflow's `permissions` block and revokes it when the job ends.
    // gitleaks-action requires it to enumerate a pull request's commits. Any
    // *other* `secrets.*` reference would be a human-created credential, which
    // wave 1 must not have.
    const referenced = [...workflowSource.matchAll(/\$\{\{\s*secrets\.([A-Za-z0-9_]+)\s*\}\}/g)].map(
      (m) => m[1],
    );
    const disallowed = referenced.filter((name) => name !== 'GITHUB_TOKEN');
    expect(
      disallowed,
      `wave 1 must reference no stored repository secret: ${disallowed.join(', ')}`,
    ).toEqual([]);
  });

  it('grants only the permissions the workflow actually needs', () => {
    // pull-requests: read is the minimum gitleaks-action needs on a pull
    // request. Nothing may be granted write access.
    expect(workflow.permissions).toEqual({ contents: 'read', 'pull-requests': 'read' });
    for (const value of Object.values(workflow.permissions)) {
      expect(value, 'no permission may be write').toBe('read');
    }
  });

  it('passes GITHUB_TOKEN to the gitleaks step so pull-request scans work', () => {
    const step = workflow.jobs['security-static'].steps.find((s) =>
      String(s.uses ?? '').startsWith('gitleaks/gitleaks-action'),
    );
    expect(step, 'the gitleaks step is missing').toBeDefined();
    expect(step.env.GITHUB_TOKEN).toBe('${{ secrets.GITHUB_TOKEN }}');
  });

  it('grants the workflow read-only contents permission', () => {
    expect(workflow.permissions.contents).toBe('read');
  });
});

describe('toolchain (P1.01 AC-2)', () => {
  it('every job installs the pinned toolchain via the shared composite action', () => {
    expect(existsSync(join(ROOT, '.github', 'actions', 'setup', 'action.yml'))).toBe(true);
    for (const [name, job] of Object.entries(workflow.jobs)) {
      const uses = (job.steps ?? []).map((s) => s.uses).filter(Boolean);
      expect(uses, `${name} must use the shared setup action`).toContain('./.github/actions/setup');
    }
  });

  it('installs with a frozen lockfile', () => {
    const setup = readFileSync(join(ROOT, '.github', 'actions', 'setup', 'action.yml'), 'utf8');
    expect(setup).toContain('--frozen-lockfile');
    expect(setup).toContain('node-version-file: .nvmrc');
  });
});
