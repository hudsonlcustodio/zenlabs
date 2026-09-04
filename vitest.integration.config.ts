import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));

/** Workspace packages resolve to source, matching tsconfig `paths`. */
const workspaceAliases = [
  'contracts',
  'database',
  'providers',
  'security',
  'observability',
  'config',
  'ui',
].map((name) => ({
  find: `@zenlabs/${name}`,
  replacement: join(ROOT, 'packages', name, 'src', 'index.ts'),
}));

/**
 * CI stage 4 — `integration` (cicd.md §1).
 *
 * The stage exists from the first commit so every later epic has a place to
 * attach: P2 brings the ephemeral PostgreSQL suites, P4 brings LocalStack.
 * Until then the suite is legitimately empty and the stage is green.
 */
export default defineConfig({
  resolve: { alias: workspaceAliases },
  test: {
    passWithNoTests: true,
    include: [
      'apps/*/test/**/*.integration.test.ts',
      'packages/*/test/**/*.integration.test.ts',
      'test/**/*.integration.test.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    environment: 'node',
    restoreMocks: true,
    // Integration work talks to real ephemeral infrastructure; it needs more
    // room than a unit test and must never run in parallel against one database.
    testTimeout: 60_000,
    fileParallelism: false,
  },
});
