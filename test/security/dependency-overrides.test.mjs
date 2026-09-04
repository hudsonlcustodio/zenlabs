/**
 * Security regression guard for pinned transitive dependencies.
 *
 * `next@15.5.24` pins `postcss` to exactly `8.4.31`, which carries HIGH
 * advisories GHSA-6g55-p6wh-862q and GHSA-r28c-9q8g-f849 (patched in 8.5.12 and
 * 8.5.18 respectively). The dependency audit in the CI `security/static` stage
 * caught it. It is resolved by a pnpm override rather than by downgrading Next,
 * relaxing `--audit-level`, or allowlisting the advisory.
 *
 * An override is easy to lose: a lockfile regeneration, a Next bump that
 * reintroduces its own pin, or a careless merge can silently drop the resolution
 * back to a vulnerable version. `pnpm audit` would catch that only while the
 * advisory database still lists it and the network is reachable. These checks
 * are offline, deterministic, and fail on the exact condition — a resolved
 * version below the patched floor.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { parse } from 'yaml';

const ROOT = process.cwd();

/**
 * Transitive packages pinned for a security reason.
 *
 * `minimum` is the advisory's patched floor, not the pinned version: the pin may
 * move forward freely, but never below the floor.
 */
const SECURITY_OVERRIDES = [
  {
    name: 'postcss',
    pinned: '8.5.23',
    minimum: '8.5.18',
    reason:
      'GHSA-6g55-p6wh-862q (>=8.5.12) and GHSA-r28c-9q8g-f849 (>=8.5.18): path traversal / source-map disclosure via attacker-controlled sourceMappingURL. next@15.5.24 pins 8.4.31.',
  },
];

/** Compare dotted numeric versions. Returns <0, 0 or >0. */
function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

const rootPackageJson = () => JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const workspaceConfig = () => parse(readFileSync(join(ROOT, 'pnpm-workspace.yaml'), 'utf8'));
const securityOverrides = () =>
  workspaceConfig().overrides ?? rootPackageJson().pnpm?.overrides ?? {};
const lockfile = () => readFileSync(join(ROOT, 'pnpm-lock.yaml'), 'utf8');

describe('security overrides are declared', () => {
  it.each(SECURITY_OVERRIDES)('$name is overridden in project configuration', ({ name, pinned }) => {
    const overrides = securityOverrides();
    expect(
      overrides[name],
      `overrides.${name} is missing — the security pin was dropped`,
    ).toBe(pinned);
  });

  it.each(SECURITY_OVERRIDES)(
    '$name pin is at or above the advisory patched floor',
    ({ name, minimum }) => {
      const pin = securityOverrides()[name];
      expect(compareVersions(pin, minimum), `${name}@${pin} is below ${minimum}`).toBeGreaterThanOrEqual(0);
    },
  );

  it('uses a pnpm override, not an audit suppression', () => {
    const pkg = rootPackageJson();
    expect(securityOverrides()).toBeDefined();
    // No allowlisting, no severity relaxation anywhere in the repo's audit path.
    expect(pkg.pnpm?.auditConfig).toBeUndefined();
    expect(JSON.stringify(pkg)).not.toContain('--ignore');
  });
});

describe('the lockfile resolves no version below the patched floor', () => {
  it.each(SECURITY_OVERRIDES)('$name resolves only to patched versions', ({ name, minimum }) => {
    const resolved = [
      ...new Set(
        [...lockfile().matchAll(new RegExp(`\\b${name}@(\\d+\\.\\d+\\.\\d+)`, 'g'))].map(
          (m) => m[1],
        ),
      ),
    ];

    // Guard against a silently broken parser making this vacuous.
    expect(resolved.length, `no ${name} resolution found in pnpm-lock.yaml`).toBeGreaterThan(0);

    for (const version of resolved) {
      expect(
        compareVersions(version, minimum),
        `pnpm-lock.yaml resolves ${name}@${version}, below the patched floor ${minimum}`,
      ).toBeGreaterThanOrEqual(0);
    }
  });

  it.each(SECURITY_OVERRIDES)('$name resolves to exactly one version', ({ name, pinned }) => {
    const resolved = [
      ...new Set(
        [...lockfile().matchAll(new RegExp(`\\b${name}@(\\d+\\.\\d+\\.\\d+)`, 'g'))].map(
          (m) => m[1],
        ),
      ),
    ];
    // An override collapses the graph to a single version; more than one means
    // some path escaped it.
    expect(resolved).toEqual([pinned]);
  });

  it('the lockfile records the override block itself', () => {
    const lock = lockfile();
    expect(lock).toMatch(/^overrides:/m);
    for (const { name, pinned } of SECURITY_OVERRIDES) {
      expect(lock).toMatch(new RegExp(`^\\s+${name}:\\s*${pinned.replace(/\./g, '\\.')}`, 'm'));
    }
  });
});

describe('the guard is not vacuous', () => {
  it('detects a version below the floor', () => {
    expect(compareVersions('8.4.31', '8.5.18')).toBeLessThan(0);
    expect(compareVersions('8.5.17', '8.5.18')).toBeLessThan(0);
  });

  it('accepts the pinned version and anything later', () => {
    expect(compareVersions('8.5.23', '8.5.18')).toBeGreaterThan(0);
    expect(compareVersions('8.5.18', '8.5.18')).toBe(0);
    expect(compareVersions('8.6.0', '8.5.18')).toBeGreaterThan(0);
    expect(compareVersions('9.0.0', '8.5.18')).toBeGreaterThan(0);
  });

  it('compares numerically, not lexically', () => {
    // The bug this avoids: '8.5.9' > '8.5.18' under string comparison.
    expect(compareVersions('8.5.9', '8.5.18')).toBeLessThan(0);
  });
});

describe('the security gate itself is not relaxed', () => {
  it('CI runs pnpm audit at --audit-level high', () => {
    const workflow = readFileSync(join(ROOT, '.github/workflows/ci.yml'), 'utf8');
    expect(workflow).toContain('pnpm audit --audit-level high');
    expect(workflow).not.toMatch(/audit-level\s+(moderate|low|info)/);
    expect(workflow).not.toContain('--ignore');
    expect(workflow).not.toMatch(/audit[^\n]*\|\|\s*true/);
  });

  it('the audit step cannot fail silently', () => {
    const workflow = readFileSync(join(ROOT, '.github/workflows/ci.yml'), 'utf8');
    const auditLine = workflow
      .split('\n')
      .findIndex((line) => line.includes('pnpm audit --audit-level high'));
    expect(auditLine).toBeGreaterThan(-1);
    // No continue-on-error attached to the audit step.
    const context = workflow.split('\n').slice(auditLine - 3, auditLine + 3).join('\n');
    expect(context).not.toContain('continue-on-error');
  });
});
