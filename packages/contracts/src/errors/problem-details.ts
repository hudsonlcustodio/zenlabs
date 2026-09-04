import { z } from 'zod';
import { errorCodeSchema } from './error-codes';

/**
 * RFC 9457 `application/problem+json` — the only error shape the API renders
 * (`api-contracts.md` §1: "Errors | RFC 9457 application/problem+json with a
 * stable code").
 *
 * `code` is the stable, machine-readable discriminator; `title` and `detail`
 * are human text and must never carry a stack trace, vendor message or any
 * value from the request (FF-20, and P1.08 AC-3 / EX-P1-06).
 */
export const PROBLEM_CONTENT_TYPE = 'application/problem+json';

/** One field-level failure inside a `validation_failed` problem. */
export const validationIssueSchema = z.object({
  /** JSON Pointer to the offending member, e.g. `/channel`. */
  pointer: z.string(),
  /** Stable, non-localised reason token, e.g. `required`, `invalid_enum`. */
  reason: z.string(),
});
export type ValidationIssue = z.infer<typeof validationIssueSchema>;

export const problemDetailsSchema = z.object({
  /** A URI reference identifying the problem type. */
  type: z.string().default('about:blank'),
  /** Short, human-readable summary. Stable per `code`. */
  title: z.string(),
  /** HTTP status code, repeated in the body per RFC 9457 §3.1. */
  status: z.number().int().min(400).max(599),
  /** The stable ZENLABS error code — `api-contracts.md` §1.1. */
  code: errorCodeSchema,
  /** Human-readable explanation. Never contains a stack trace or vendor text. */
  detail: z.string().optional(),
  /** URI reference identifying the specific occurrence. */
  instance: z.string().optional(),
  /** Echoed correlation id so a client can quote it in a support request. */
  correlationId: z.string().optional(),
  /** Present only when `code` is `validation_failed`. */
  errors: z.array(validationIssueSchema).optional(),
});

export type ProblemDetails = z.infer<typeof problemDetailsSchema>;
