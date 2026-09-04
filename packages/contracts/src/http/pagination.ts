import { z } from 'zod';

/**
 * Cursor pagination — `api-contracts.md` §1:
 * "cursor-based: `?cursor=&limit=` → `{ data, nextCursor }`.
 *  No offset pagination on large sets."
 *
 * ADR-0032 rejects offset pagination outright: unstable under concurrent
 * inserts and costly at depth. There is deliberately no `offset` member here,
 * so an offset-paginated route cannot be expressed with these contracts.
 */

export const PAGINATION_DEFAULT_LIMIT = 25;
export const PAGINATION_MAX_LIMIT = 100;

export const cursorPaginationQuerySchema = z.object({
  /** Opaque forward cursor. Clients must not construct or decode it. */
  cursor: z.string().min(1).optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION_MAX_LIMIT)
    .default(PAGINATION_DEFAULT_LIMIT),
});

export type CursorPaginationQuery = z.infer<typeof cursorPaginationQuerySchema>;

/**
 * `{ data, nextCursor }`. `nextCursor` is `null` — not absent — on the last
 * page, so a client can distinguish "end of list" from "field omitted".
 */
export const cursorPageSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    data: z.array(item),
    nextCursor: z.string().nullable(),
  });

export type CursorPage<T> = {
  data: T[];
  nextCursor: string | null;
};
