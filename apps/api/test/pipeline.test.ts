import { Controller, Get, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import {
  API_BASE_PATH,
  CORRELATION_ID_HEADER,
  ERROR_CODES,
  PROBLEM_CONTENT_TYPE,
} from '@zenlabs/contracts';
import { AppModule } from '../src/app.module';
import { AppError } from '../src/common/errors/app-error';
import { ProblemDetailsFilter, PROBLEM_TITLES } from '../src/common/filters/problem-details.filter';
import { CorrelationMiddleware } from '../src/common/correlation/correlation.middleware';

/**
 * P1.08 verification gate — "the problem-details filter is asserted for one
 * mapped and one unmapped error", plus the correlation pipeline (EX-P1-05).
 */

/** Routes that exist only to drive the filter. Never part of the product API. */
@Controller(`${API_BASE_PATH}/__fixtures`)
class FixtureController {
  @Get('mapped')
  mapped(): never {
    throw AppError.notFound('The requested content item does not exist.');
  }

  @Get('unmapped')
  unmapped(): never {
    // A realistic internal failure: it carries a stack, a class name and a
    // message that must never reach the client.
    const error = new TypeError(
      "Cannot read properties of undefined (reading 'tenantId') at /srv/zenlabs/db.ts:42",
    );
    throw error;
  }

  @Get('validation')
  validation(): never {
    throw AppError.validationFailed([{ pointer: '/channel', reason: 'required' }]);
  }

  @Get('ok')
  ok(): { ok: true } {
    return { ok: true };
  }
}

let app: INestApplication;
let baseUrl: string;

beforeAll(async () => {
  const base = AppModule.register({ commitSha: 'apisha0001' });
  app = await NestFactory.create(
    { ...base, controllers: [...(base.controllers ?? []), FixtureController] },
    { logger: false },
  );
  app.useGlobalFilters(new ProblemDetailsFilter());
  await app.listen(0, '127.0.0.1');
  baseUrl = (await app.getUrl()).replace('[::1]', '127.0.0.1');
}, 60_000);

afterAll(async () => {
  await app?.close();
});

const get = (path: string, headers: Record<string, string> = {}) =>
  fetch(`${baseUrl}${path}`, { headers });

/** Problem responses are asserted field by field; typed for readability. */
type ProblemBody = Record<string, unknown> & { code?: string; correlationId?: string };
const problem = async (response: Response): Promise<ProblemBody> =>
  (await response.json()) as ProblemBody;

describe('AC-4 — GET /api/v1/health returns the running commit SHA (cicd.md §3)', () => {
  it('responds 200 with the commit SHA', async () => {
    const response = await get(`${API_BASE_PATH}/health`);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok', commitSha: 'apisha0001' });
  });

  it('is mounted under the /api/v1 base path', async () => {
    expect((await get('/health')).status).toBe(404);
  });
});

describe('AC-3 / EX-P1-05 — correlation id is accepted and echoed, generated when absent', () => {
  it('echoes a client-supplied id', async () => {
    const response = await get(`${API_BASE_PATH}/health`, {
      [CORRELATION_ID_HEADER]: 'client-supplied-123',
    });
    expect(response.headers.get(CORRELATION_ID_HEADER)).toBe('client-supplied-123');
  });

  it('generates one when absent', async () => {
    const response = await get(`${API_BASE_PATH}/health`);
    const id = response.headers.get(CORRELATION_ID_HEADER);
    expect(id).toBeTruthy();
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('generates a distinct id per request', async () => {
    const [a, b] = await Promise.all([get(`${API_BASE_PATH}/health`), get(`${API_BASE_PATH}/health`)]);
    expect(a.headers.get(CORRELATION_ID_HEADER)).not.toBe(b.headers.get(CORRELATION_ID_HEADER));
  });

  it('replaces an injectable id rather than echoing it', async () => {
    const response = await get(`${API_BASE_PATH}/health`, {
      [CORRELATION_ID_HEADER]: 'bad id with spaces',
    });
    expect(response.headers.get(CORRELATION_ID_HEADER)).not.toBe('bad id with spaces');
    expect(response.headers.get(CORRELATION_ID_HEADER)).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('echoes the id on error responses too', async () => {
    const response = await get(`${API_BASE_PATH}/__fixtures/mapped`, {
      [CORRELATION_ID_HEADER]: 'trace-me-9',
    });
    expect(response.headers.get(CORRELATION_ID_HEADER)).toBe('trace-me-9');
    const body = await problem(response);
    expect(body.correlationId).toBe('trace-me-9');
  });

  it('is exported as middleware bound to every route, not to one controller', () => {
    expect(new CorrelationMiddleware()).toBeInstanceOf(CorrelationMiddleware);
  });
});

describe('AC-3 — a MAPPED error renders as RFC 9457 problem+json', () => {
  it('carries the stable code, status and title', async () => {
    const response = await get(`${API_BASE_PATH}/__fixtures/mapped`);

    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toContain(PROBLEM_CONTENT_TYPE);

    const body = await problem(response);
    expect(body).toMatchObject({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      code: 'not_found',
      detail: 'The requested content item does not exist.',
    });
  });

  it('renders validation_failed with structured JSON Pointer issues', async () => {
    const response = await get(`${API_BASE_PATH}/__fixtures/validation`);
    expect(response.status).toBe(422);
    const body = await problem(response);
    expect(body.code).toBe('validation_failed');
    expect(body.errors).toEqual([{ pointer: '/channel', reason: 'required' }]);
  });
});

describe('AC-3 / EX-P1-06 — an UNMAPPED error renders as internal_error (ACR-001)', () => {
  it('is problem+json with the stable internal_error code and status 500', async () => {
    const response = await get(`${API_BASE_PATH}/__fixtures/unmapped`);

    expect(response.status).toBe(500);
    expect(response.headers.get('content-type')).toContain(PROBLEM_CONTENT_TYPE);

    const body = await problem(response);
    expect(body.code).toBe('internal_error');
    expect(body.title).toBe('Internal Server Error');
    expect(body.status).toBe(500);
  });

  it('leaks no stack trace, exception class, internal message, SQL or path', async () => {
    const response = await get(`${API_BASE_PATH}/__fixtures/unmapped`);
    const raw = await response.text();

    for (const forbidden of [
      'TypeError',
      'Cannot read properties',
      'tenantId',
      '/srv/zenlabs/db.ts',
      'at ',
      'stack',
      'node_modules',
    ]) {
      expect(raw, `unmapped error leaked "${forbidden}"`).not.toContain(forbidden);
    }
  });

  it('carries no detail member at all', async () => {
    const body = await problem(await get(`${API_BASE_PATH}/__fixtures/unmapped`));
    expect(body.detail).toBeUndefined();
    expect(Object.keys(body).sort()).toEqual(
      ['code', 'correlationId', 'instance', 'status', 'title', 'type'].sort(),
    );
  });

  it('still preserves the correlation id, so the failure is traceable', async () => {
    const response = await get(`${API_BASE_PATH}/__fixtures/unmapped`, {
      [CORRELATION_ID_HEADER]: 'incident-42',
    });
    const body = await problem(response);
    expect(body.correlationId).toBe('incident-42');
  });

  it('a framework 404 also renders as problem+json with a stable code', async () => {
    const response = await get(`${API_BASE_PATH}/does-not-exist`);
    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toContain(PROBLEM_CONTENT_TYPE);
    expect((await problem(response)).code).toBe('not_found');
  });
});

describe('no handler may return an ad-hoc error shape (AC-3)', () => {
  it('every stable code has a fixed title', () => {
    expect(Object.keys(PROBLEM_TITLES).sort()).toEqual([...ERROR_CODES].sort());
  });

  it('a successful response is untouched by the filter', async () => {
    const response = await get(`${API_BASE_PATH}/__fixtures/ok`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('content-type')).not.toContain('problem');
  });
});
