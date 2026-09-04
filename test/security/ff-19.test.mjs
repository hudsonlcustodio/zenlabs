/**
 * P1.07 verification gate — "FF-19 passes clean and fails on the seeded fixture."
 *
 * Every credential-shaped fixture below is assembled at runtime and written to a
 * temporary directory. Nothing credential-shaped is ever committed — which is
 * the property FF-19 exists to enforce, so the test must not violate it to
 * prove it.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { describe, it, expect, afterEach } from 'vitest';

import { scanText, redact, RULES } from '../../scripts/fitness/lib/secret-scan.mjs';

const ROOT = process.cwd();
const SCANNER = join(ROOT, 'scripts', 'fitness', 'ff-19-no-committed-secret.mjs');
const temporary = [];

afterEach(() => {
  while (temporary.length) rmSync(temporary.pop(), { recursive: true, force: true });
});

/** Assemble a credential-shaped fixture without ever writing one as a literal. */
const fixtures = {
  awsAccessKeyId: () => 'AKIA' + 'QRSTUVWX' + 'YZ234567',
  githubToken: () => 'ghp_' + 'a'.repeat(36),
  openaiKey: () => ['sk', 'x'.repeat(24)].join('-'),
  privateKey: () => ['-----BEGIN', 'RSA', 'PRIVATE', 'KEY-----'].join(' '),
  googleKey: () => 'AIza' + 'b'.repeat(35),
  stripeKey: () => ['sk', 'live', 'c'.repeat(24)].join('_'),
  assigned: () => `api_key = "${'d'.repeat(32)}"`,
};

/** A throwaway git repository containing `files`. */
function seedRepo(files) {
  const root = mkdtempSync(join(tmpdir(), 'zenlabs-ff19-'));
  temporary.push(root);
  spawnSync('git', ['init', '-q'], { cwd: root });
  for (const [relative, contents] of Object.entries(files)) {
    const path = join(root, relative);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, contents);
  }
  spawnSync('git', ['add', '-A'], { cwd: root });
  return root;
}

const runScanner = (root) =>
  spawnSync(process.execPath, [SCANNER, '--root', root], { encoding: 'utf8' });

describe('FF-19 — the real repository is clean (AC-1)', () => {
  it('passes on the committed tree', () => {
    const result = runScanner(ROOT);
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain('FF-19 PASS');
  });

  it('reports zero tracked .env files', () => {
    expect(runScanner(ROOT).stdout).toContain('trackedEnv=0');
  });
});

describe('EX-P1-02 — a seeded fake credential turns the stage red (AC-2)', () => {
  it('fails on a file containing an AWS-shaped key', () => {
    const root = seedRepo({ 'src/config.ts': `const key = '${fixtures.awsAccessKeyId()}';\n` });
    const result = runScanner(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('FF-19 FAIL');
    expect(result.stderr).toContain('aws-access-key-id');
    expect(result.stderr).toContain('src/config.ts');
  });

  it('reports the finding without echoing the value', () => {
    const secret = fixtures.awsAccessKeyId();
    const root = seedRepo({ 'src/config.ts': `const key = '${secret}';\n` });
    const result = runScanner(root);

    expect(result.status).toBe(1);
    // Location and rule are reported...
    expect(result.stderr).toContain('src/config.ts:1');
    expect(result.stderr).toContain('<redacted:');
    // ...the value itself never is, on either stream.
    expect(result.stderr).not.toContain(secret);
    expect(result.stdout).not.toContain(secret);
  });

  it.each([
    ['github-token', fixtures.githubToken()],
    ['openai-key', fixtures.openaiKey()],
    ['private-key', fixtures.privateKey()],
    ['google-api-key', fixtures.googleKey()],
    ['stripe-key', fixtures.stripeKey()],
  ])('detects a %s', (ruleId, value) => {
    const findings = scanText(`const v = '${value}';`);
    expect(findings.map((f) => f.ruleId)).toContain(ruleId);
  });

  it('detects a credential-shaped assignment', () => {
    const findings = scanText(fixtures.assigned());
    expect(findings.map((f) => f.ruleId)).toContain('generic-assigned-secret');
  });

  it('blocks a tracked .env file even when it holds no detectable secret', () => {
    const root = seedRepo({ '.env': 'APP_ENV=production\n' });
    const result = runScanner(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('tracked .env file');
  });

  it('permits .env.example', () => {
    const root = seedRepo({ '.env.example': 'APP_ENV=development\nPROVIDER_MODE=mock\n' });
    const result = runScanner(root);
    expect(result.status).toBe(0);
  });
});

describe('FF-19 — redaction and false positives', () => {
  it('redact() never returns the value', () => {
    const secret = fixtures.awsAccessKeyId();
    const output = redact(secret);
    expect(output).not.toContain(secret);
    expect(output).toContain(String(secret.length));
  });

  it('does not flag placeholder values', () => {
    expect(scanText('api_key = "changeme"')).toEqual([]);
    expect(scanText('api_key = "${AWS_SECRET}"')).toEqual([]);
    expect(scanText('password = "your-password-here"')).toEqual([]);
  });

  it('does not flag prose or type declarations', () => {
    expect(scanText('interface Credentials { apiKey: string }')).toEqual([]);
    expect(scanText('// Provider api keys live in Secrets Manager (ADR-0022).')).toEqual([]);
  });

  it('honours an explicit ff19:allow marker', () => {
    const line = `const v = '${fixtures.awsAccessKeyId()}'; // ff19:allow documented fixture`;
    expect(scanText(line)).toEqual([]);
  });

  it('every rule has an id and a description', () => {
    for (const rule of RULES) {
      expect(rule.id).toBeTruthy();
      expect(rule.description).toBeTruthy();
      expect(rule.pattern.flags).toContain('g');
    }
  });
});

describe('history scanning is configured, not only diff scanning (AC-3)', () => {
  it('the scanner invokes gitleaks with --no-git=false', () => {
    const source = String(
      spawnSync('cat', [SCANNER], { encoding: 'utf8' }).stdout ?? '',
    );
    expect(source).toContain('--no-git=false');
    expect(source).toContain('--redact');
  });

  it('CI checks out full history for the security/static stage', () => {
    const workflow = spawnSync('cat', [join(ROOT, '.github/workflows/ci.yml')], {
      encoding: 'utf8',
    }).stdout;
    expect(workflow).toContain('fetch-depth: 0');
  });

  it('a pre-commit hook is present and scans staged changes (ADR-0022)', () => {
    const hook = spawnSync('cat', [join(ROOT, '.githooks/pre-commit')], {
      encoding: 'utf8',
    }).stdout;
    expect(hook).toContain('ff-19-no-committed-secret.mjs');
    expect(hook).toContain('--staged');
  });
});
