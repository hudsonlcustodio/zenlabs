import { z } from 'zod';
import {
  appEnvironmentSchema,
  environmentScoped,
  providerModeSchema,
  type AppEnvironment,
} from './environment';

/**
 * The ZENLABS environment schema (P1.05 AC-1).
 *
 * Only keys that exist in wave 1 are declared. Later waves widen this schema in
 * the story that introduces the dependency — P2 adds the database URL's
 * consumers, P4 the provider surface, P4.11 the Secrets Manager resolver
 * (ADR-0022). Declaring an unused key early would be a placeholder, so it is
 * deliberately absent.
 */

/** Keys every process needs, in every environment. */
const baseShape = {
  APP_ENV: appEnvironmentSchema,

  /**
   * Reserved in wave 1 (AC-4). Allowed values are fixed now so P4 cannot widen
   * them silently. Defaults to `mock` everywhere; production must be explicit.
   */
  PROVIDER_MODE: providerModeSchema.default('mock'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  /**
   * The running commit SHA, surfaced on the health endpoint so a deployed
   * artifact is always traceable to a commit (cicd.md §3).
   */
  COMMIT_SHA: z.string().min(7).default('unknown'),
} as const;

/** Keys a process that binds a port needs. */
const servedShape = {
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
} as const;

/** Keys only a long-running worker needs. */
const workerShape = {
  /**
   * Upper bound on graceful drain before the process exits (P1.09 AC-3).
   * Must stay below the orchestrator's SIGKILL grace period.
   */
  SHUTDOWN_DRAIN_TIMEOUT_MS: z.coerce.number().int().min(0).max(120_000).default(10_000),
} as const;

const apiConfigSchema = z.object({ ...baseShape, ...servedShape });
const workerConfigSchema = z.object({ ...baseShape, ...workerShape });
const webConfigSchema = z.object({ ...baseShape, ...servedShape });

export type ApiConfig = z.infer<typeof apiConfigSchema>;
export type WorkerConfig = z.infer<typeof workerConfigSchema>;
export type WebConfig = z.infer<typeof webConfigSchema>;

/** Maps a process kind to the configuration shape it loads. */
export interface ConfigByKind {
  api: ApiConfig;
  worker: WorkerConfig;
  web: WebConfig;
}

export type ProcessKind = keyof ConfigByKind;

/**
 * Build the schema for a process kind.
 *
 * `environment` is needed up front because the NFR-12 scoping rules are
 * relative to it — the schema for staging is genuinely a different schema from
 * the schema for production, which is the mechanism, not an inconvenience.
 *
 * `APP_ENV` is narrowed to a literal so a process started with one environment
 * cannot parse another environment's configuration.
 */
export function buildConfigSchema<K extends ProcessKind>(
  kind: K,
  environment: AppEnvironment,
): z.ZodType<ConfigByKind[K]> {
  const pinned = { APP_ENV: z.literal(environment) };

  const schema =
    kind === 'worker'
      ? workerConfigSchema.extend(pinned)
      : kind === 'web'
        ? webConfigSchema.extend(pinned)
        : apiConfigSchema.extend(pinned);

  // The literal APP_ENV is a subtype of the union in ConfigByKind[K]; the cast
  // records that narrowing, which TypeScript cannot infer through the branch.
  return schema as unknown as z.ZodType<ConfigByKind[K]>;
}

/**
 * Schema fragment for an environment-scoped resource, exported so the story
 * that introduces a resource wires it in without re-deriving the NFR-12 rule.
 *
 * P2 uses this for `DATABASE_URL`, P16 for the S3 bucket, P17.06 for the queue
 * prefix, P4.11 for secret ARNs.
 */
export const environmentScopedResource = environmentScoped;

export { providerModeSchema, appEnvironmentSchema };
