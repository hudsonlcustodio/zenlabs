import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ERROR_CODE_STATUS,
  PROBLEM_CONTENT_TYPE,
  isErrorCode,
  type ErrorCode,
  type ProblemDetails,
} from '@zenlabs/contracts';
import { currentCorrelationId } from '@zenlabs/observability';
import { AppError } from '../errors/app-error';

/**
 * The single exception renderer for `apps/api` (P1.08 AC-3).
 *
 * Every failure leaves as RFC 9457 `application/problem+json` carrying a stable
 * `code` from `api-contracts.md` §1.1. No handler may return an ad-hoc error
 * shape, because no handler renders errors at all.
 *
 * EX-P1-06 — an unmapped exception renders as `internal_error` (ACR-001) with
 * **no** exception-derived content: no stack trace, exception class, internal
 * message, SQL or path. Only the fixed title and the correlation id travel to
 * the client. That is a contract obligation, not defensive coding: the detail of
 * an internal failure belongs in the log, never in the response.
 */

/** Fixed, non-localised titles. Stable per code, never derived from input. */
const TITLES: Readonly<Record<ErrorCode, string>> = Object.freeze({
  unauthenticated: 'Unauthenticated',
  forbidden: 'Forbidden',
  not_found: 'Not Found',
  validation_failed: 'Validation Failed',
  conflict: 'Conflict',
  idempotency_key_reuse: 'Idempotency Key Reuse',
  entitlement_exhausted: 'Entitlement Exhausted',
  consent_revoked: 'Consent Revoked',
  capability_unsupported: 'Capability Unsupported',
  provider_unavailable: 'Provider Unavailable',
  rate_limited: 'Rate Limited',
  connection_invalid: 'Connection Invalid',
  state_transition_not_allowed: 'State Transition Not Allowed',
  internal_error: 'Internal Server Error',
});

/** Map the HTTP statuses NestJS raises on its own to stable codes. */
function codeForHttpStatus(status: number): ErrorCode {
  switch (status) {
    case HttpStatus.UNAUTHORIZED:
      return 'unauthenticated';
    case HttpStatus.FORBIDDEN:
      return 'forbidden';
    case HttpStatus.NOT_FOUND:
      return 'not_found';
    case HttpStatus.CONFLICT:
      return 'conflict';
    case HttpStatus.UNPROCESSABLE_ENTITY:
    case HttpStatus.BAD_REQUEST:
      return 'validation_failed';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'rate_limited';
    case HttpStatus.NOT_IMPLEMENTED:
      return 'capability_unsupported';
    case HttpStatus.SERVICE_UNAVAILABLE:
      return 'provider_unavailable';
    default:
      return 'internal_error';
  }
}

export interface ProblemLogger {
  error(message: string, fields?: Record<string, unknown>): void;
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  constructor(private readonly logger?: ProblemLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();

    const problem = this.render(exception, request);

    // The full exception — including its stack — is logged, never returned.
    if (problem.code === 'internal_error') {
      this.logger?.error('unmapped exception', {
        err: exception instanceof Error ? exception : new Error(String(exception)),
        path: request.path,
        method: request.method,
      });
    }

    response
      .status(problem.status)
      .setHeader('Content-Type', PROBLEM_CONTENT_TYPE)
      .json(problem);
  }

  private render(exception: unknown, request: Request): ProblemDetails {
    const correlationId = currentCorrelationId();
    const base = {
      type: 'about:blank',
      instance: request.path,
      ...(correlationId ? { correlationId } : {}),
    };

    if (exception instanceof AppError) {
      return {
        ...base,
        title: TITLES[exception.code],
        status: exception.status,
        code: exception.code,
        ...(exception.detail !== undefined ? { detail: exception.detail } : {}),
        ...(exception.issues !== undefined ? { errors: exception.issues } : {}),
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const code = codeForHttpStatus(status);
      // A framework-raised 5xx is as unmapped as a thrown TypeError: it gets the
      // internal_error treatment, with no message carried through.
      if (code === 'internal_error') return this.internal(base);
      return {
        ...base,
        title: TITLES[code],
        status: ERROR_CODE_STATUS[code],
        code,
      };
    }

    // Anything else is unmapped by definition.
    return this.internal(base);
  }

  /**
   * ACR-001 — the unmapped case. Deliberately carries nothing derived from the
   * exception: no `detail`, no class name, no message, no path beyond the
   * request's own route, no SQL.
   */
  private internal(base: Omit<ProblemDetails, 'title' | 'status' | 'code'>): ProblemDetails {
    return {
      ...base,
      title: TITLES.internal_error,
      status: ERROR_CODE_STATUS.internal_error,
      code: 'internal_error',
    };
  }
}

/** Exported for tests that need to assert the code/title table stays closed. */
export const PROBLEM_TITLES = TITLES;
export { isErrorCode };
