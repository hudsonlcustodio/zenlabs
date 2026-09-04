/**
 * ZENLABS — architecture boundary rules for ESLint (P1.03).
 *
 * These encode architecture.md §4.1 and §4.2 so a violation fails `pnpm lint`
 * rather than becoming permanent debt. They are the editor-and-CI half of
 * FF-04; the graph-wide half (declared edges, cycles) is
 * scripts/fitness/ff-04-dependency-graph.mjs.
 *
 * The rules exist now, before the modules they constrain: adding boundary lint
 * after modules exist turns violations into debt that is never paid, which is
 * the stated reason epic P1 comes first.
 */

/** architecture.md §4.1 rule 3 — a domain layer imports contracts only. */
const DOMAIN_FORBIDDEN = [
  { group: ['aws-sdk', 'aws-sdk/*', '@aws-sdk/*'], message: 'architecture.md §4.1 rule 3: domain/ may not import aws-sdk.' },
  { group: ['drizzle-orm', 'drizzle-orm/*', 'pg', 'postgres'], message: 'architecture.md §4.1 rule 3: domain/ may not import the ORM or a database driver.' },
  { group: ['openai', 'openai/*', '@deepseek/*', '*heygen*', '*elevenlabs*', 'facebook-nodejs*', '*tiktok*'], message: 'architecture.md §4.1 rule 3: domain/ may not import a provider SDK. Go through packages/providers ports.' },
  { group: ['@zenlabs/providers', '@zenlabs/providers/*'], message: 'architecture.md §4.2: domain/ may not import packages/providers.' },
  { group: ['@zenlabs/database', '@zenlabs/database/*'], message: 'architecture.md §4.2: domain/ may not import packages/database.' },
  { group: ['@nestjs/*'], message: 'architecture.md §4.2: domain/ is framework-free.' },
  { group: ['**/infrastructure/**'], message: 'architecture.md §4.2: domain/ may not reach into infrastructure/.' },
  { group: ['**/application/**'], message: 'architecture.md §4.2: domain/ may not reach into application/.' },
];

export default [
  // §4.2 — the domain layer is pure.
  {
    files: ['apps/api/src/modules/*/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: DOMAIN_FORBIDDEN }],
    },
  },

  // §4.2 — application/ imports domain and ports, never infrastructure.
  {
    files: ['apps/api/src/modules/*/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**'],
              message: 'architecture.md §4.2: application/ may not import infrastructure/.',
            },
            {
              group: ['aws-sdk', 'aws-sdk/*', '@aws-sdk/*', 'drizzle-orm', 'drizzle-orm/*'],
              message:
                'architecture.md §4.1 rule 3: application/ reaches infrastructure through ports, not SDKs.',
            },
          ],
        },
      ],
    },
  },

  // §4.1 rule 2 — another module's internals are unreachable from anywhere.
  {
    files: ['apps/api/src/modules/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*/domain/*', '../*/domain/**', '../../*/domain/**'],
              message:
                "architecture.md §4.1 rule 2: import another module's published application service or listen for a domain event; its domain/ is internal.",
            },
            {
              group: [
                '../*/infrastructure/*',
                '../*/infrastructure/**',
                '../../*/infrastructure/**',
              ],
              message:
                "architecture.md §4.1 rule 2: another module's infrastructure/ is internal.",
            },
          ],
        },
      ],
    },
  },

  // §2.2 — packages/contracts is the zero-I/O root.
  //
  // Scoped to src/ only: the package's own architecture tests legitimately read
  // the repository from disk to assert these very rules, and a test is not
  // shipped runtime code.
  //
  // Node builtins are listed as exact `paths` rather than glob `patterns`,
  // because a bare pattern like `http` also matches the package's own
  // `./http/headers` module.
  {
    files: ['packages/contracts/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            ...[
              'fs',
              'fs/promises',
              'net',
              'http',
              'https',
              'dgram',
              'dns',
              'child_process',
              'worker_threads',
              'cluster',
              'tls',
            ].flatMap((name) => [name, `node:${name}`]),
          ].map((name) => ({
            name,
            message:
              'architecture.md §2.2: packages/contracts performs no I/O. Move this to the package that owns the side effect.',
          })),
          patterns: [
            {
              group: ['@zenlabs/*'],
              message:
                'architecture.md §2.2: packages/contracts depends on no sibling package — it is the root of the graph.',
            },
            {
              group: [
                'aws-sdk',
                '@aws-sdk/*',
                'drizzle-orm',
                'drizzle-orm/*',
                'pg',
                'postgres',
                '@nestjs/*',
                'express',
                'next',
                'axios',
                'node-fetch',
                'undici',
                'got',
              ],
              message:
                'architecture.md §2.2: packages/contracts is schemas only — no framework, no driver, no HTTP client.',
            },
          ],
        },
      ],
    },
  },
];
