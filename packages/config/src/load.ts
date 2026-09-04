import { z } from 'zod';
import { appEnvironmentSchema, type AppEnvironment } from './environment';
import { buildConfigSchema, type ConfigByKind, type ProcessKind } from './schema';

/**
 * Typed configuration loading (P1.05).
 *
 * Configuration is parsed **once** at process start (AC-1). A misconfigured
 * process exits non-zero immediately with the offending key named and its value
 * never printed (AC-2, and the FF-20 precondition in the verification gate).
 */

export class ConfigurationError extends Error {
  /** The environment variable names that failed, in report order. */
  readonly keys: readonly string[];

  constructor(keys: readonly string[], details: readonly string[]) {
    super(
      `Invalid configuration. ${keys.length} key(s) rejected:\n` +
        details.map((d) => `  - ${d}`).join('\n'),
    );
    this.name = 'ConfigurationError';
    this.keys = keys;
  }
}

/**
 * Render a Zod failure as operator-readable lines.
 *
 * Only the key path and the reason are emitted. `zod` never puts the received
 * value in `issue.message` for the codes we use, but we additionally build the
 * line from `issue.path` and a fixed reason rather than passing the raw message
 * through, so a value cannot reach a log by construction.
 */
function describe(issue: z.ZodIssue): string {
  const key = issue.path.join('.') || '(root)';

  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      return issue.received === 'undefined'
        ? `${key}: required but not set`
        : `${key}: expected ${issue.expected}`;
    case z.ZodIssueCode.invalid_enum_value:
      return `${key}: must be one of ${issue.options.map(String).join(' | ')}`;
    case z.ZodIssueCode.invalid_literal:
      return `${key}: must be ${String(issue.expected)}`;
    case z.ZodIssueCode.too_small:
      return `${key}: below the permitted minimum (${String(issue.minimum)})`;
    case z.ZodIssueCode.too_big:
      return `${key}: above the permitted maximum (${String(issue.maximum)})`;
    case z.ZodIssueCode.custom:
      // Custom messages are authored by us in environment.ts and never
      // interpolate the value.
      return `${key}: ${issue.message}`;
    default:
      return `${key}: invalid`;
  }
}

export interface LoadOptions {
  /** Which process is loading. Selects the schema fragment. */
  kind: ProcessKind;
  /** Defaults to `process.env`. Injected in tests. */
  source?: NodeJS.ProcessEnv;
}

/**
 * Parse and validate configuration.
 *
 * Throws `ConfigurationError` rather than exiting, so it is testable; the
 * process entry point calls `loadConfigOrExit` to get the fail-fast behaviour.
 */
export function loadConfig<K extends ProcessKind>(
  options: LoadOptions & { kind: K },
): ConfigByKind[K] {
  const source = options.source ?? process.env;

  // APP_ENV is resolved first: the rest of the schema is relative to it,
  // because NFR-12 scoping is environment-relative.
  const environmentResult = appEnvironmentSchema.safeParse(source.APP_ENV);
  if (!environmentResult.success) {
    throw new ConfigurationError(
      ['APP_ENV'],
      [
        source.APP_ENV === undefined
          ? 'APP_ENV: required but not set'
          : 'APP_ENV: must be one of development | staging | production',
      ],
    );
  }
  const environment: AppEnvironment = environmentResult.data;

  const schema = buildConfigSchema(options.kind, environment);
  const result = schema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues.map(describe);
    const keys = [...new Set(result.error.issues.map((i) => i.path.join('.') || '(root)'))];
    throw new ConfigurationError(keys, details);
  }

  return result.data;
}

/**
 * The process-start entry point: parse once, or exit non-zero.
 *
 * EX-P1-03: "GIVEN a required key is absent, WHEN a process boots, THEN it
 * exits non-zero and logs the key name without its value."
 */
export function loadConfigOrExit<K extends ProcessKind>(
  options: LoadOptions & { kind: K },
): ConfigByKind[K] {
  try {
    return loadConfig(options);
  } catch (error) {
    if (error instanceof ConfigurationError) {
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    }
    throw error;
  }
}
