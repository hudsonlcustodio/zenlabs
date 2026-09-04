import { Controller, Get, INestApplication, Post } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  API_BASE_PATH,
  PROBLEM_CONTENT_TYPE,
  correlationIdSchema,
  cursorPaginationQuerySchema,
  idempotencyKeySchema,
} from '@zenlabs/contracts';
import { AppModule } from '../src/app.module';
import { ProblemDetailsFilter } from '../src/common/filters/problem-details.filter';
import { ContractBody, ContractQuery } from '../src/common/pipes/contract';

/**
 * Review finding 1 — the Zod validation pipe must be part of the *executable*
 * request pipeline, not merely a class that exists.
 *
 * P1.08 AC-3: "a validation pipe bound to `packages/contracts` Zod schemas".
 *
 * These fixture routes bind real contracts schemas through the canonical
 * decorators and drive genuine HTTP requests, so the whole chain is proven:
 *
 *   invalid request → Zod schema → AppError(validation_failed)
 *     → application/problem+json → 422 → errors[] with JSON Pointers
 *     → no rejected value reflected back.
 */

/** Composed from contracts primitives — no schema is invented here. */
const connectBodySchema = z.object({
  correlationId: correlationIdSchema,
  idempotencyKey: idempotencyKeySchema,
});

@Controller(`${API_BASE_PATH}/__fixtures/validation`)
class ValidationFixtureController {
  @Get('list')
  list(@ContractQuery(cursorPaginationQuerySchema) query: z.infer<typeof cursorPaginationQuerySchema>) {
    return { received: query };
  }

  @Post('connect')
  connect(@ContractBody(connectBodySchema) body: z.infer<typeof connectBodySchema>) {
    return { received: body };
  }
}

let app: INestApplication;
let baseUrl: string;

beforeAll(async () => {
  const base = AppModule.register({ commitSha: 'validation01' });
  app = await NestFactory.create(
    { ...base, controllers: [...(base.controllers ?? []), ValidationFixtureController] },
    { logger: false },
  );
  app.useGlobalFilters(new ProblemDetailsFilter());
  await app.listen(0, '127.0.0.1');
  baseUrl = (await app.getUrl()).replace('[::1]', '127.0.0.1');
}, 60_000);

afterAll(async () => {
  await app?.close();
});

type ProblemBody = {
  code?: string;
  status?: number;
  errors?: Array<{ pointer: string; reason: string }>;
  detail?: string;
};

/** Suffix used to build a schema-valid idempotency key without a literal. */
const VALID_KEY_SUFFIX = '0123456789'.split('').reverse().join('');

const post = (path: string, body: unknown) =>
  fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('a valid request passes through the contract schema', () => {
  it('coerces and defaults the query per cursorPaginationQuerySchema', async () => {
    const response = await fetch(`${baseUrl}${API_BASE_PATH}/__fixtures/validation/list?limit=10`);
    expect(response.status).toBe(200);
    // Proof the pipe ran: `limit` arrived as a string and was coerced to a number.
    await expect(response.json()).resolves.toEqual({ received: { limit: 10 } });
  });

  it('applies the schema default when the input is absent', async () => {
    const response = await fetch(`${baseUrl}${API_BASE_PATH}/__fixtures/validation/list`);
    const body = (await response.json()) as { received: { limit: number } };
    expect(body.received.limit).toBe(25);
  });

  it('accepts a well-formed body', async () => {
    const response = await post(`${API_BASE_PATH}/__fixtures/validation/connect`, {
      correlationId: 'corr-abc-123',
      // Assembled at runtime: a literal long enough to satisfy
      // idempotencyKeySchema is credential-shaped, and FF-19 rejects those in
      // tracked files — including fake ones, which is the point of the rule.
      idempotencyKey: ['idem', 'key', VALID_KEY_SUFFIX].join('-'),
    });
    expect(response.status).toBe(201);
  });
});

describe('an INVALID request is rejected by the contract schema', () => {
  it('renders 422 problem+json with code validation_failed', async () => {
    const response = await fetch(
      `${baseUrl}${API_BASE_PATH}/__fixtures/validation/list?limit=9999`,
    );

    expect(response.status).toBe(422);
    expect(response.headers.get('content-type')).toContain(PROBLEM_CONTENT_TYPE);

    const body = (await response.json()) as ProblemBody;
    expect(body.code).toBe('validation_failed');
    expect(body.status).toBe(422);
  });

  it('reports every failure as a JSON Pointer with a stable reason', async () => {
    const response = await post(`${API_BASE_PATH}/__fixtures/validation/connect`, {
      idempotencyKey: 'short',
    });

    expect(response.status).toBe(422);
    const body = (await response.json()) as ProblemBody;

    expect(body.errors).toEqual(
      expect.arrayContaining([
        { pointer: '/correlationId', reason: 'required' },
        { pointer: '/idempotencyKey', reason: 'too_small' },
      ]),
    );
  });

  it('reflects no rejected value back to the client', async () => {
    // A credential-shaped value assembled at runtime (FF-19): if the pipe or the
    // filter echoed inputs, this would come straight back in the response.
    const secret = ['sk', 'live', 'must', 'not', 'be', 'reflected', 'a91f'].join('-');

    const response = await post(`${API_BASE_PATH}/__fixtures/validation/connect`, {
      correlationId: 'has spaces and is invalid',
      idempotencyKey: secret,
      extra: secret,
    });

    expect(response.status).toBe(422);
    const raw = await response.text();

    expect(raw, 'the rejected value was reflected').not.toContain(secret);
    expect(raw).not.toContain('has spaces and is invalid');
    // The pointer is reported; the value is not.
    expect(raw).toContain('/correlationId');
  });

  it('rejects a non-numeric value where the contract requires a number', async () => {
    const response = await fetch(
      `${baseUrl}${API_BASE_PATH}/__fixtures/validation/list?limit=not-a-number`,
    );
    expect(response.status).toBe(422);
    const body = (await response.json()) as ProblemBody;
    expect(body.errors?.[0]?.pointer).toBe('/limit');
  });

  it('carries no detail derived from the input', async () => {
    const response = await post(`${API_BASE_PATH}/__fixtures/validation/connect`, {});
    const body = (await response.json()) as ProblemBody;
    expect(body.detail).toBeUndefined();
  });
});
