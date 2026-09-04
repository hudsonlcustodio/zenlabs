import { z } from 'zod';

/**
 * The three isolated environments of architecture.md §8 and brief §27.
 * `aws-topology.md` §7: "No shared database, bucket, queue, secret, credential,
 * token or provider key."
 */
export const APP_ENVIRONMENTS = ['development', 'staging', 'production'] as const;
export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];
export const appEnvironmentSchema = z.enum(APP_ENVIRONMENTS);

/**
 * Provider mode — ADR-0011 and architecture.md §8.
 *
 * Reserved here with its allowed values declared (P1.05 AC-4). No provider
 * consumes it until P4; `mock` is the default everywhere except production and
 * CI runs `mock` only (FF-08, cicd.md §2).
 */
export const PROVIDER_MODES = ['mock', 'live'] as const;
export type ProviderMode = (typeof PROVIDER_MODES)[number];
export const providerModeSchema = z.enum(PROVIDER_MODES);

/**
 * NFR-12, made structural rather than procedural.
 *
 * Every environment-scoped resource identifier must name the environment it
 * belongs to. A production database URL, bucket or secret ARN therefore cannot
 * be loaded by a staging process: the value fails to parse at boot rather than
 * silently connecting to the wrong account.
 *
 * This is what P1.05 AC-3 means by "makes one credential serving two
 * environments inexpressible" — the shared-credential case has no representation
 * in the schema, so it cannot be configured by mistake.
 */
export function environmentScoped(
  environment: AppEnvironment,
  label: string,
): z.ZodEffects<z.ZodString, string, string> {
  const foreign = APP_ENVIRONMENTS.filter((e) => e !== environment);

  return z.string().min(1).superRefine((value, ctx) => {
    const haystack = value.toLowerCase();

    if (!haystack.includes(environment)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        // The offending key is named; the value never is (AC-2, FF-20).
        message: `${label} must be scoped to the "${environment}" environment (NFR-12). Its identifier does not name the environment.`,
      });
      return;
    }

    for (const other of foreign) {
      if (haystack.includes(other)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} names both "${environment}" and "${other}" (NFR-12). One resource may not serve two environments.`,
        });
        return;
      }
    }
  });
}
