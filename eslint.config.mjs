// ZENLABS — root ESLint flat configuration.
//
// P1.01 establishes the recursive `pnpm lint` entry point.
// P1.03 layers the architecture boundary rules (architecture.md §4.1, §4.2)
// on top of this base via `eslint.boundaries.mjs`.

import tseslint from 'typescript-eslint';
import boundaries from './eslint.boundaries.mjs';

export default tseslint.config(
  {
    // Never lint generated or vendored output.
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      'docs/**',
      '**/*.d.ts',
    ],
  },

  // Base JS/TS recommended rules, type-unaware so lint stays fast and
  // independent of build order across the workspace.
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,mts,cts}'],
    rules: {
      // A silently unused symbol is usually an incomplete refactor.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // `any` erases the contract discipline packages/contracts exists to hold.
      '@typescript-eslint/no-explicit-any': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': 'off',
    },
  },

  // Tooling scripts are plain Node ESM, not part of a workspace tsconfig.
  {
    files: ['scripts/**/*.mjs', '*.config.{js,mjs,cjs,ts}', '*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // architecture.md §4.1 / §4.2 boundary rules (P1.03). Last so they win.
  ...boundaries,
);
