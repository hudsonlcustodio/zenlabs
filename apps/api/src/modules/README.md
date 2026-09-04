# `apps/api/src/modules`

The **single** registration point for domain modules (`architecture.md` §4).

A domain module is registered in `AppModule` and **nowhere else**. That rule is
what keeps the §4.1 dependency boundaries meaningful after contact with a DI
framework: if modules could import one another's providers directly, the
`allowedDependencies` manifest would describe a graph that no longer matches the
one the container actually builds.

## Binding a contracted input

Use the decorators in `src/common/pipes/contract.ts` — `ContractBody`,
`ContractQuery`, `ContractParam` — never a bare `@Body()`, `@Query()` or
`@Param()`:

```ts
@Post()
create(@ContractBody(createContentRequestSchema) body: CreateContentRequest) {}
```

They are the standard NestJS parameter decorators with a parameter-scoped
`ZodValidationPipe` attached. Because the schema is an argument, a route cannot
accept input without naming the `packages/contracts` schema that governs it, so
a second validation authority has nowhere to hide (P1.04 AC-1, P1.08 AC-3).
`test/architecture/validation-authority.test.mjs` enforces this.

A single global pipe is not an option: NestJS global pipes receive one schema for
every route, and each route has its own contract.

## Adding a module

1. Create `apps/api/src/modules/<name>/` with `domain/`, `application/` and
   `infrastructure/` (`architecture.md` §4.2).
2. Add `module.manifest.json` declaring `allowedDependencies` — FF-04 fails on a
   module without one.
3. Register it in `AppModule`'s `DOMAIN_MODULES` array.

The `identity` module is the first Wave 1 slice. It is contract-tested and
kept out of Nest registration until its HTTP/authentication contract is ready.
