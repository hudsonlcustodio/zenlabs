/**
 * @zenlabs/observability — structured logger, correlation context, metric emitters
 * (architecture.md §2.2). Cross-cutting infrastructure, not a domain module.
 *
 * Wave 1 ships the logger and the correlation context, which are what the
 * five §2.1 processes need in order to boot and be traceable (cicd.md §3).
 * Metric emitters and the full ADR-0023 surface belong to the observability
 * epic and are deliberately absent rather than stubbed.
 */

export {
  LOG_LEVELS,
  REDACTED,
  createLogger,
  type LogFields,
  type LogLevel,
  type Logger,
  type LoggerOptions,
} from './logger';

export {
  currentCorrelation,
  currentCorrelationId,
  newCorrelationId,
  withCorrelation,
  type CorrelationContext,
} from './correlation';
