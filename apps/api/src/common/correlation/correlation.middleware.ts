import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { CORRELATION_ID_HEADER, correlationIdSchema } from '@zenlabs/contracts';
import { newCorrelationId, withCorrelation } from '@zenlabs/observability';

/**
 * Correlation middleware (P1.08 AC-3, EX-P1-05).
 *
 * `api-contracts.md` §1: "`X-Correlation-Id` accepted and echoed; generated
 * when absent."
 *
 * A client-supplied id is validated before it is adopted. An unvalidated id is
 * echoed into responses and written into every log line, so accepting an
 * arbitrary string would be a log-injection and unbounded-header vector; an
 * invalid one is replaced rather than rejected, because a malformed diagnostic
 * header is not worth failing a request over.
 */
@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const supplied = request.header(CORRELATION_ID_HEADER);
    const parsed = supplied !== undefined ? correlationIdSchema.safeParse(supplied) : undefined;

    const correlationId = parsed?.success ? parsed.data : newCorrelationId();

    // Echoed on every response, including error responses.
    response.setHeader(CORRELATION_ID_HEADER, correlationId);

    // Bound for the whole async subtree, so any log line emitted while handling
    // this request carries the id without threading it through signatures.
    withCorrelation({ correlationId }, () => next());
  }
}
