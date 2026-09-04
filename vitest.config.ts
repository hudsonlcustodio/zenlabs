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

// Root test entry point. `pnpm test` runs every workspace's tests from here so
// there is exactly one recursive command (P1.01 AC-3).
export default defineConfig({
  resolve: { alias: workspaceAliases },
  test: {
    // P1.01's verification gate is explicitly "green on an empty workspace set".
    // Later stories add real suites; this keeps the gate meaningful rather than
    // failing for the absence of files.
    passWithNoTests: true,
    include: [
      'apps/*/test/**/*.test.ts',
      'apps/*/src/**/*.test.ts',
      'packages/*/test/**/*.test.ts',
      'packages/*/src/**/*.test.ts',
      'scripts/**/*.test.mjs',
      'test/**/*.test.ts',
      'test/**/*.test.mjs',
    ],
    // cicd.md §1 keeps `unit` and `integration` as separate blocking stages.
    // Integration suites (ephemeral PostgreSQL + LocalStack, P2 onward) run
    // from vitest.integration.config.ts, never here.
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.integration.test.{ts,mts,mjs}'],
    environment: 'node',
    restoreMocks: true,
  },
});
