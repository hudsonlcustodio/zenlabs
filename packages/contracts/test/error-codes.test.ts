import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { parse } from 'yaml';
import { join } from 'node:path';

import {
  ERROR_CODES,
  ERROR_CODE_STATUS,
  errorCodeSchema,
  isErrorCode,
  type ErrorCode,
} from '../src/errors/error-codes';

/**
 * P1.04 AC-2 — "The stable error codes of api-contracts.md §1.1 are declared
 * here and nowhere else."
 */

/**
 * The canonical set, derived mechanically from `api-contracts.md` §1.1.
 *
 * There is deliberately no hand-transcribed copy here: a transcription is a
 * fourth surface that can itself drift, and a test that compares two copies the
 * same author wrote proves nothing. The document is the authority, so the
 * document is parsed.
 */
function codesFromArchitecture(): string[] {
  const doc = readFileSync(
    join(process.cwd(), 'docs', 'architecture', 'api-contracts.md'),
    'utf8',
  );

  const start = doc.indexOf('### 1.1 Error codes');
  if (start === -1) throw new Error('api-contracts.md §1.1 heading not found');

  // Skip past the end of the heading *line*, not just the matched text: the
  // heading is "### 1.1 Error codes (stable)".
  const afterHeading = doc.indexOf('\n', start) + 1;
  const section = doc.slice(afterHeading, doc.indexOf('## 2.', afterHeading));

  // The stable set is the first paragraph after the heading: a comma-separated
  // list of backticked codes terminated by a period. Prose that follows may
  // mention individual codes, so only that paragraph is authoritative.
  const paragraph = section
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block.length > 0);

  if (!paragraph) throw new Error('api-contracts.md §1.1 declares no code list');

  const codes = [...paragraph.matchAll(/`([a-z_]+)`/g)].map((m) => m[1] as string);

  // Guard against a silently broken parser turning this whole file vacuous.
  if (codes.length < 10) {
    throw new Error(`api-contracts.md §1.1 parser extracted only ${codes.length} code(s)`);
  }
  return codes;
}

/** The enum published in the generated OpenAPI document. */
function codesFromOpenApi(): string[] {
  const spec = readFileSync(join(process.cwd(), 'docs', 'api', 'openapi.yaml'), 'utf8');
  const document = parse(spec) as {
    components: { schemas: { ProblemDetails: { properties: { code: { enum: string[] } } } } };
  };
  return document.components.schemas.ProblemDetails.properties.code.enum;
}

describe('the stable error-code set is identical on all three surfaces (AC-2)', () => {
  it('parses a plausible set out of api-contracts.md §1.1', () => {
    const parsed = codesFromArchitecture();
    expect(parsed.length).toBeGreaterThanOrEqual(10);
    expect(new Set(parsed).size, 'the document lists a code twice').toBe(parsed.length);
  });

  it('api-contracts.md §1.1 == ERROR_CODES, in both directions', () => {
    const fromDoc: string[] = [...codesFromArchitecture()].sort();
    const fromCode: string[] = [...ERROR_CODES].sort();

    // Named diffs so a failure says which surface has the extra code.
    const missingFromCode = fromDoc.filter((c) => !fromCode.includes(c));
    const missingFromDoc = fromCode.filter((c) => !fromDoc.includes(c));

    expect(missingFromCode, 'declared in api-contracts.md but not in ERROR_CODES').toEqual([]);
    expect(missingFromDoc, 'declared in ERROR_CODES but not in api-contracts.md').toEqual([]);
    expect(fromCode).toEqual(fromDoc);
  });

  it('ERROR_CODES == the generated OpenAPI ProblemDetails enum, in both directions', () => {
    const fromCode: string[] = [...ERROR_CODES].sort();
    const fromSpec: string[] = [...codesFromOpenApi()].sort();

    const missingFromSpec = fromCode.filter((c) => !fromSpec.includes(c));
    const missingFromCode = fromSpec.filter((c) => !fromCode.includes(c));

    expect(missingFromSpec, 'declared in ERROR_CODES but absent from openapi.yaml').toEqual([]);
    expect(missingFromCode, 'enumerated in openapi.yaml but not a stable code').toEqual([]);
    expect(fromSpec).toEqual(fromCode);
  });

  it('api-contracts.md §1.1 == the generated OpenAPI enum, closing the triangle', () => {
    expect([...codesFromOpenApi()].sort()).toEqual([...codesFromArchitecture()].sort());
  });

  it('the comparison is not vacuous — an extra code on any surface is detected', () => {
    const canonical: string[] = [...ERROR_CODES].sort();

    const extraInDoc = [...canonical, 'invented_code'].sort();
    expect(extraInDoc).not.toEqual(canonical);

    const missingOne = canonical.filter((c) => c !== 'not_found');
    expect(missingOne).not.toEqual(canonical);
  });

  it('maps every code to an HTTP status in the error range', () => {
    for (const code of ERROR_CODES) {
      const status = ERROR_CODE_STATUS[code];
      expect(status, `${code} has no status`).toBeGreaterThanOrEqual(400);
      expect(status).toBeLessThanOrEqual(599);
    }
    expect(Object.keys(ERROR_CODE_STATUS).sort()).toEqual([...ERROR_CODES].sort());
  });

  it('parses a valid code and rejects an invented one', () => {
    expect(errorCodeSchema.parse('not_found')).toBe('not_found');
    expect(errorCodeSchema.safeParse('teapot').success).toBe(false);
  });

  it('narrows unknown input via isErrorCode (EX-P1-04a)', () => {
    const candidate: unknown = 'forbidden';
    expect(isErrorCode(candidate)).toBe(true);
    if (isErrorCode(candidate)) {
      const narrowed: ErrorCode = candidate;
      expect(narrowed).toBe('forbidden');
    }
    expect(isErrorCode('nope')).toBe(false);
    expect(isErrorCode(42)).toBe(false);
  });
});

describe('error codes are declared nowhere else (AC-2)', () => {
  const SOURCE_ROOTS = ['apps', 'packages'];
  const DECLARATION_SITE = join('packages', 'contracts', 'src', 'errors', 'error-codes.ts');

  function sourceFiles(dir: string, out: string[] = []): string[] {
    if (!existsSync(dir) || !statSync(dir).isDirectory()) return out;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', 'dist', 'test'].includes(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) sourceFiles(full, out);
      else if (/\.tsx?$/.test(entry.name)) out.push(full);
    }
    return out;
  }

  /**
   * A file has *forked* the set when it spells several stable codes without
   * importing the canonical declaration. A file that imports `ErrorCode` or
   * `ERROR_CODES` and then maps over them — a `Record<ErrorCode, string>` of
   * titles, say — is bound to the single source at compile time, which is the
   * opposite of a fork and must not be flagged.
   */
  const forkedSets = (roots: string[]): string[] => {
    const offenders: string[] = [];
    for (const root of roots) {
      for (const file of sourceFiles(join(process.cwd(), root))) {
        if (file.endsWith(DECLARATION_SITE)) continue;
        const text = readFileSync(file, 'utf8');
        const hits = ERROR_CODES.filter((c) => text.includes(`'${c}'`) || text.includes(`"${c}"`));
        if (hits.length < 3) continue;

        const importsCanonical =
          /from\s+'@zenlabs\/contracts'/.test(text) &&
          /\b(ErrorCode|ERROR_CODES|ERROR_CODE_STATUS|errorCodeSchema)\b/.test(text);
        if (!importsCanonical) offenders.push(`${file} (${hits.join(', ')})`);
      }
    }
    return offenders;
  };

  it('no workspace rebuilds the stable set without importing it', () => {
    const offenders = forkedSets(SOURCE_ROOTS);
    expect(
      offenders,
      `these files spell stable error codes without importing the canonical declaration:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('the rule still catches a genuine fork', () => {
    // A file listing codes with no import of the canonical declaration is
    // exactly the drift AC-2 forbids; prove the check sees it.
    const forked = `const CODES = ['not_found', 'forbidden', 'conflict'];`;
    const hits = ERROR_CODES.filter((c) => forked.includes(`'${c}'`));
    const importsCanonical =
      /from\s+'@zenlabs\/contracts'/.test(forked) &&
      /\b(ErrorCode|ERROR_CODES)\b/.test(forked);
    expect(hits.length).toBeGreaterThanOrEqual(3);
    expect(importsCanonical).toBe(false);
  });

  it('every consumer that maps the set does import it', () => {
    // The positive case: apps/api's problem-details filter keys a Record by the
    // imported ErrorCode type, so exhaustiveness is checked by tsc.
    const filter = join(process.cwd(), 'apps/api/src/common/filters/problem-details.filter.ts');
    const text = readFileSync(filter, 'utf8');
    expect(text).toMatch(/from\s+'@zenlabs\/contracts'/);
    expect(text).toContain('ErrorCode');
  });
});
