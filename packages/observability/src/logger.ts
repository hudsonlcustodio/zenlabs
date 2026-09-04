import { currentCorrelation } from './correlation';

/**
 * Structured logger (architecture.md §2.2).
 *
 * One JSON object per line, so a log aggregator never has to parse prose.
 *
 * FF-20 ("logs never contain sensitive material") is a wave-2 fitness function,
 * but its precondition is established here: the logger emits only the fields it
 * is given, redacts any field whose key is credential-shaped, and never
 * serialises an Error's stack into the message field.
 */

export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

const SEVERITY: Record<LogLevel, number> = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

/** Field names whose values are never printed, at any level. */
const REDACTED_KEYS =
  /(pass(word|wd)?|secret|token|api[_-]?key|apikey|authorization|credential|cookie|session|private[_-]?key)/i;

export const REDACTED = '[redacted]';

export type LogFields = Record<string, unknown>;

function sanitise(fields: LogFields, depth = 0): LogFields {
  if (depth > 4) return {};
  const out: LogFields = {};

  for (const [key, value] of Object.entries(fields)) {
    if (REDACTED_KEYS.test(key)) {
      out[key] = REDACTED;
      continue;
    }
    if (value instanceof Error) {
      // Name and message only. A stack trace is vendor-shaped detail that must
      // not travel with a routine log line.
      out[key] = { name: value.name, message: value.message };
      continue;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = sanitise(value as LogFields, depth + 1);
      continue;
    }
    out[key] = value;
  }
  return out;
}

export interface LoggerOptions {
  level?: LogLevel;
  /** Process name, e.g. `worker-ai`. */
  service: string;
  /** cicd.md §3 — the running commit SHA travels with every line. */
  commitSha?: string;
  /** Injected in tests. Defaults to stdout. */
  sink?: (line: string) => void;
  /** Injected in tests for deterministic timestamps. */
  clock?: () => string;
}

export interface Logger {
  fatal(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  debug(message: string, fields?: LogFields): void;
  trace(message: string, fields?: LogFields): void;
  child(bindings: LogFields): Logger;
}

export function createLogger(options: LoggerOptions): Logger {
  const level = options.level ?? 'info';
  const threshold = SEVERITY[level];
  const sink = options.sink ?? ((line: string) => process.stdout.write(`${line}\n`));
  const clock = options.clock ?? (() => new Date().toISOString());

  const make = (bindings: LogFields): Logger => {
    const emit = (logLevel: LogLevel, message: string, fields?: LogFields) => {
      if (SEVERITY[logLevel] < threshold) return;

      const correlation = currentCorrelation();
      const line = {
        time: clock(),
        level: logLevel,
        service: options.service,
        ...(options.commitSha ? { commitSha: options.commitSha } : {}),
        ...(correlation ? { correlationId: correlation.correlationId } : {}),
        ...(correlation?.causationId ? { causationId: correlation.causationId } : {}),
        msg: message,
        ...sanitise({ ...bindings, ...fields }),
      };
      sink(JSON.stringify(line));
    };

    return {
      fatal: (m, f) => emit('fatal', m, f),
      error: (m, f) => emit('error', m, f),
      warn: (m, f) => emit('warn', m, f),
      info: (m, f) => emit('info', m, f),
      debug: (m, f) => emit('debug', m, f),
      trace: (m, f) => emit('trace', m, f),
      child: (extra) => make({ ...bindings, ...extra }),
    };
  };

  return make({});
}
