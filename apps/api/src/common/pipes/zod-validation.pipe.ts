import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { z } from 'zod';
import type { ValidationIssue } from '@zenlabs/contracts';
import { AppError } from '../errors/app-error';

/**
 * The validation pipe, bound to `packages/contracts` Zod schemas (P1.08 AC-3).
 *
 * ADR-0004 makes Zod the single schema authority and OpenAPI a generated
 * artifact of those same schemas, so validating with anything else would let
 * the published contract and the enforced contract drift — exactly what FF-18
 * exists to prevent.
 *
 * A failure becomes `validation_failed` with structured JSON Pointer issues.
 * The rejected *value* is never echoed: `api-contracts.md` inputs can carry
 * credentials, and a validation message is not a safe place for them.
 */
@Injectable()
export class ZodValidationPipe<TSchema extends z.ZodTypeAny> implements PipeTransform {
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): z.infer<TSchema> {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;

    throw AppError.validationFailed(toIssues(result.error));
  }
}

/** Render a ZodError as JSON Pointers, carrying no received value. */
export function toIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    pointer: `/${issue.path.join('/')}`,
    reason: reasonFor(issue),
  }));
}

/**
 * Stable, non-localised reason tokens.
 *
 * Built from the issue's *code*, never from `issue.message`, because Zod
 * interpolates the received value into some default messages.
 */
function reasonFor(issue: z.ZodIssue): string {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      return issue.received === 'undefined' ? 'required' : 'invalid_type';
    case z.ZodIssueCode.invalid_enum_value:
      return 'invalid_enum';
    case z.ZodIssueCode.invalid_string:
      return 'invalid_format';
    case z.ZodIssueCode.too_small:
      return 'too_small';
    case z.ZodIssueCode.too_big:
      return 'too_big';
    case z.ZodIssueCode.unrecognized_keys:
      return 'unrecognized_key';
    case z.ZodIssueCode.invalid_literal:
      return 'invalid_literal';
    default:
      return 'invalid';
  }
}
