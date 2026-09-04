/**
 * FF-19 — "No secret is committed."
 *
 * fitness-functions.md specifies `gitleaks detect --no-git=false --redact` in
 * CI plus a pre-commit hook. gitleaks is the authority when present; this
 * module is the always-available detector so the check is never silently
 * skipped on a machine without the binary, and so the rules are unit-testable.
 *
 * Every finding is reported **redacted**: the rule that matched and where, never
 * the value. A secret-scanner that prints the secret into a build log has
 * merely moved the leak.
 */

import { readFileSync, statSync } from 'node:fs';

/**
 * Detection rules. Each is anchored on a structural prefix or a
 * keyword-plus-assignment shape rather than raw entropy, so the false-positive
 * rate stays low enough for the check to be blocking rather than advisory.
 */
export const RULES = [
  {
    id: 'aws-access-key-id',
    description: 'AWS access key id',
    pattern: /\b(?:A3T[A-Z0-9]|AKIA|ASIA|ABIA|ACCA)[A-Z0-9]{16}\b/g,
  },
  {
    id: 'aws-secret-access-key',
    description: 'AWS secret access key',
    pattern: /\baws_?secret_?access_?key\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi,
  },
  {
    id: 'private-key',
    description: 'PEM private key block',
    pattern: /-----BEGIN\s+(?:RSA|EC|DSA|OPENSSH|PGP|ENCRYPTED)?\s*PRIVATE KEY-----/g,
  },
  {
    id: 'github-token',
    description: 'GitHub personal access / app token',
    pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g,
  },
  {
    id: 'slack-token',
    description: 'Slack token',
    pattern: /\bxox[abposr]-[A-Za-z0-9-]{10,}\b/g,
  },
  {
    id: 'openai-key',
    description: 'OpenAI-style API key',
    pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    id: 'stripe-key',
    description: 'Stripe secret key',
    pattern: /\b[rs]k_(?:live|test)_[A-Za-z0-9]{20,}\b/g,
  },
  {
    id: 'google-api-key',
    description: 'Google API key',
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
  },
  {
    id: 'jwt',
    description: 'JSON Web Token',
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  },
  {
    id: 'generic-assigned-secret',
    description: 'Credential-shaped assignment',
    // A provider/credential keyword assigned a long opaque literal. Requires a
    // quoted value so prose and type declarations do not match.
    pattern:
      /\b(?:api[_-]?key|apikey|secret[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password|passwd)\s*[:=]\s*['"]([^'"\s]{16,})['"]/gi,
  },
];

/**
 * Values that are structurally credential-shaped but are demonstrably not
 * secrets. Kept deliberately small: every entry is a hole in the check.
 */
export const ALLOWED_VALUES = [
  /^(?:x{3,}|\*{3,}|\.{3,})$/i,
  /^(?:changeme|placeholder|example|redacted|dummy|sample)$/i,
  // `your-password-here`, `your_api_key`, ... — obvious fill-in-me templates.
  /^your[\w-]*$/i,
  // `<PLACEHOLDER>` and `${ENV_VAR}` interpolations are references, not values.
  /^<[^>]+>$/,
  /^\$\{[^}]+\}$/,
  /^(?:xxx+|\*{3,}|\.{3,})$/i,
];

const isAllowed = (value) => ALLOWED_VALUES.some((r) => r.test(value));

/** Redact a matched value: never return the value itself. */
export function redact(value) {
  return `<redacted:${value.length} chars>`;
}

/**
 * Scan text and return redacted findings.
 * @returns {{ruleId:string, description:string, line:number, redacted:string}[]}
 */
export function scanText(text) {
  const findings = [];
  const lines = text.split('\n');

  for (const rule of RULES) {
    // Rules carry the /g flag; reset so repeated scans are deterministic.
    rule.pattern.lastIndex = 0;
    let match;
    while ((match = rule.pattern.exec(text)) !== null) {
      const value = match[1] ?? match[0];
      if (isAllowed(value)) continue;

      const line = text.slice(0, match.index).split('\n').length;
      // A line marked as an intentional fixture is skipped, so the scanner's
      // own tests and rule definitions do not trip it.
      if ((lines[line - 1] ?? '').includes('ff19:allow')) continue;

      findings.push({
        ruleId: rule.id,
        description: rule.description,
        line,
        redacted: redact(value),
      });
    }
  }

  return findings;
}

const BINARY_EXT =
  /\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|tgz|bz2|xz|7z|woff2?|ttf|eot|mp4|mov|mp3|wav|sqlite|db|wasm|node)$/i;

/** Scan a single file path, tolerating unreadable or binary content. */
export function scanFile(path) {
  if (BINARY_EXT.test(path)) return [];
  try {
    if (statSync(path).size > 2 * 1024 * 1024) return [];
    const text = readFileSync(path, 'utf8');
    // Skip anything that looks binary despite its extension.
    if (text.includes('\u0000')) return [];
    return scanText(text).map((f) => ({ ...f, file: path }));
  } catch {
    return [];
  }
}
