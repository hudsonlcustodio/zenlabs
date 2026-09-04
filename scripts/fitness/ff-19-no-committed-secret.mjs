#!/usr/bin/env node
/**
 * FF-19 — No secret is committed.
 * fitness-functions.md FF-19 · security-architecture.md §4 · ADR-0022
 *
 * Fails when a finding is detected or a tracked `.env` file exists.
 *
 * Three layers, all blocking:
 *   1. tracked `.env` assertion  — `git ls-files | grep -E '^\.env' | grep -v example`
 *   2. built-in redacting scan   — always available, so the check is never skipped
 *   3. gitleaks                  — `--no-git=false --redact`, scans history (AC-3)
 *
 * Usage:
 *   node scripts/fitness/ff-19-no-committed-secret.mjs [--root <dir>] [--staged]
 */

import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { scanFile } from './lib/secret-scan.mjs';

const argv = process.argv.slice(2);
const rootFlag = argv.indexOf('--root');
const ROOT =
  rootFlag !== -1 && argv[rootFlag + 1]
    ? argv[rootFlag + 1]
    : join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const stagedOnly = argv.includes('--staged');

const git = (args) =>
  spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });

const failures = [];

// ── Layer 1: no tracked .env file ───────────────────────────────────────────
// fitness-functions.md FF-19: ".env* files (except .env.example) are gitignored
// and an explicit test asserts they are not tracked."
const tracked = git(['ls-files']).stdout?.split('\n').filter(Boolean) ?? [];
const trackedEnv = tracked.filter((f) => {
  const name = f.split('/').pop() ?? '';
  return /^\.env/.test(name) && !name.includes('example');
});

if (trackedEnv.length > 0) {
  failures.push({
    layer: 'tracked-env',
    message: `tracked .env file(s): ${trackedEnv.join(', ')}`,
  });
}

// ── Layer 2: built-in redacting content scan ────────────────────────────────
const files = stagedOnly
  ? (git(['diff', '--cached', '--name-only', '--diff-filter=ACM']).stdout ?? '')
      .split('\n')
      .filter(Boolean)
  : tracked;

const findings = [];
for (const file of files) {
  const abs = join(ROOT, file);
  if (!existsSync(abs)) continue;
  findings.push(...scanFile(abs).map((f) => ({ ...f, file })));
}

if (findings.length > 0) {
  failures.push({ layer: 'content-scan', findings });
}

// ── Layer 3: gitleaks, including history (AC-3) ─────────────────────────────
const gitleaksAvailable = spawnSync('gitleaks', ['version'], { encoding: 'utf8' }).status === 0;

let gitleaksResult = 'unavailable';
if (gitleaksAvailable) {
  // --no-git=false scans commit history, not merely the working tree.
  // --redact guarantees no secret value reaches the build log.
  //
  // A JSON report is requested as well, because gitleaks' console output does
  // not say which commit a historical finding came from — and "gitleaks found
  // something, somewhere in history" is not an actionable failure message.
  const report = join(tmpdir(), `zenlabs-ff19-${process.pid}.json`);
  const args = [
    'detect',
    '--no-git=false',
    '--redact',
    '--source',
    ROOT,
    '--report-format',
    'json',
    '--report-path',
    report,
    '--exit-code',
    '1',
  ];
  if (existsSync(join(ROOT, '.gitleaks.toml'))) args.push('--config', join(ROOT, '.gitleaks.toml'));

  const run = spawnSync('gitleaks', args, { encoding: 'utf8' });
  gitleaksResult = run.status === 0 ? 'clean' : 'findings';

  if (run.status !== 0) {
    failures.push({
      layer: 'gitleaks',
      message: 'gitleaks reported findings in the working tree or in commit history',
      findings: readGitleaksReport(report),
    });
  }
  try {
    if (existsSync(report)) unlinkSync(report);
  } catch {
    /* the report is a temp file; failing to remove it must not fail the check */
  }
}

/**
 * Read the JSON report and keep only non-sensitive locating fields.
 *
 * `Secret`, `Match` and `Line` are deliberately never read: the whole point of
 * this check is that a secret does not travel further, and a build log is
 * further.
 */
function readGitleaksReport(path) {
  if (!existsSync(path)) return [];
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    return (Array.isArray(parsed) ? parsed : []).map((finding) => ({
      rule: finding.RuleID ?? 'unknown',
      commit: (finding.Commit ?? '').slice(0, 12) || '(working tree)',
      file: finding.File ?? '(unknown file)',
      line: finding.StartLine ?? 0,
      author: finding.Author ?? '',
      date: (finding.Date ?? '').slice(0, 10),
    }));
  } catch {
    return [];
  }
}

// ── Report ──────────────────────────────────────────────────────────────────
console.log(
  `FF-19  scope=${stagedOnly ? 'staged' : 'tracked'}  files=${files.length}  ` +
    `trackedEnv=${trackedEnv.length}  findings=${findings.length}  gitleaks=${gitleaksResult}`,
);

if (failures.length === 0) {
  if (!gitleaksAvailable) {
    // Not a failure: the built-in scan already ran and blocks. CI installs
    // gitleaks so the history layer is always exercised there.
    console.log('FF-19 note: gitleaks binary not present; history scan runs in CI.');
  }
  console.log('FF-19 PASS — no committed secret.');
  process.exit(0);
}

console.error('\nFF-19 FAIL — a secret must never reach the repository.\n');
for (const failure of failures) {
  if (failure.layer === 'content-scan') {
    console.error(`  [content-scan] ${failure.findings.length} finding(s):`);
    for (const f of failure.findings) {
      // The value is never printed — only where it is and what matched.
      console.error(`    - ${f.file}:${f.line}  ${f.ruleId} (${f.description})  ${f.redacted}`);
    }
  } else if (failure.layer === 'gitleaks') {
    console.error(`  [gitleaks] ${failure.message}: ${failure.findings.length} finding(s)`);
    for (const f of failure.findings) {
      // rule + where. Never the value.
      console.error(
        `    - ${f.file}:${f.line}  ${f.rule}  commit=${f.commit}` +
          (f.date ? `  (${f.date}${f.author ? `, ${f.author}` : ''})` : ''),
      );
    }
    if (failure.findings.some((f) => f.commit !== '(working tree)')) {
      console.error(
        '\n    Historical finding: the value is in a past commit, so removing it from the\n' +
          '    working tree is not enough — the commit itself must be rewritten, and any\n' +
          '    real credential rotated regardless.',
      );
    }
  } else {
    console.error(`  [${failure.layer}] ${failure.message}`);
    if (failure.output) console.error(failure.output);
  }
}
console.error(
  '\nRotate any real credential that was committed: removing the commit does not un-leak it (ADR-0022).\n',
);
process.exit(1);
