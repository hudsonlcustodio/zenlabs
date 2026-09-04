import { ERROR_CODE_STATUS, type ErrorCode, type ValidationIssue } from '@zenlabs/contracts';

/**
 * The only error type a handler may throw to produce a client-visible problem.
 *
 * `api-contracts.md` §1: "Errors | RFC 9457 application/problem+json with a
 * stable code". Binding the code to the exception — rather than letting each
 * handler assemble a response — is what makes "no handler may return an ad-hoc
 * error shape" (P1.08 AC-3) enforceable rather than aspirational.
 *
 * Anything else that reaches the filter is by definition unmapped and renders
 * as `internal_error` (ACR-001).
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  /** Safe, non-sensitive explanation. Never interpolate request input here. */
  readonly detail: string | undefined;
  /** Present only for `validation_failed`. */
  readonly issues: ValidationIssue[] | undefined;

  constructor(
    code: ErrorCode,
    options: { detail?: string; issues?: ValidationIssue[]; cause?: unknown } = {},
  ) {
    super(code, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'AppError';
    this.code = code;
    this.status = ERROR_CODE_STATUS[code];
    this.detail = options.detail;
    this.issues = options.issues;
  }

  static notFound(detail?: string): AppError {
    return new AppError('not_found', detail !== undefined ? { detail } : {});
  }

  static forbidden(detail?: string): AppError {
    return new AppError('forbidden', detail !== undefined ? { detail } : {});
  }

  static validationFailed(issues: ValidationIssue[]): AppError {
    return new AppError('validation_failed', { issues });
  }
}
