import { Body, Query, Param } from '@nestjs/common';
import type { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

/**
 * The canonical way to bind a contracted input in `apps/api` (P1.08 AC-3).
 *
 * These are the standard NestJS parameter decorators with a parameter-scoped
 * pipe already attached — the framework's own mechanism, not a new convention.
 * A single global pipe cannot work here: NestJS global pipes receive one schema
 * for every route, and each route has its own contract.
 *
 * Using them is what makes the rule enforceable:
 *
 *   @Post()
 *   create(@ContractBody(createContentRequestSchema) body: CreateContentRequest) {}
 *
 * Because the schema is an argument, an input cannot be bound without naming
 * the `packages/contracts` schema that governs it, and a second validation
 * authority cannot be introduced silently — there is nowhere to put it.
 * `test/architecture/validation-authority.test.mjs` enforces that every bound
 * input in `apps/api` goes through one of these.
 */

/** Validate the request body against a `packages/contracts` Zod schema. */
export const ContractBody = <T extends z.ZodTypeAny>(schema: T): ParameterDecorator =>
  Body(new ZodValidationPipe(schema));

/** Validate the query string against a `packages/contracts` Zod schema. */
export const ContractQuery = <T extends z.ZodTypeAny>(schema: T): ParameterDecorator =>
  Query(new ZodValidationPipe(schema));

/** Validate a route parameter against a `packages/contracts` Zod schema. */
export const ContractParam = <T extends z.ZodTypeAny>(
  name: string,
  schema: T,
): ParameterDecorator => Param(name, new ZodValidationPipe(schema));
