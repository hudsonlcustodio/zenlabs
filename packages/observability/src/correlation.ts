import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

/**
 * Correlation context (architecture.md §2.2 — "Structured logger, correlation
 * context, metric emitters").
 *
 * `api-contracts.md` §1: `X-Correlation-Id` is accepted and echoed, generated
 * when absent. Holding it in async-local storage means a log line emitted deep
 * inside a call stack carries the id without every function signature having to
 * thread it through.
 */

export interface CorrelationContext {
  correlationId: string;
  /** The event or request that caused this unit of work, when known. */
  causationId?: string;
}

const storage = new AsyncLocalStorage<CorrelationContext>();

/** Generate a fresh correlation id. */
export const newCorrelationId = (): string => randomUUID();

/** Run `fn` with `context` bound for its entire async subtree. */
export function withCorrelation<T>(context: CorrelationContext, fn: () => T): T {
  return storage.run(context, fn);
}

/** The active context, or undefined outside any correlated unit of work. */
export const currentCorrelation = (): CorrelationContext | undefined => storage.getStore();

/** The active correlation id, or undefined. */
export const currentCorrelationId = (): string | undefined => storage.getStore()?.correlationId;
