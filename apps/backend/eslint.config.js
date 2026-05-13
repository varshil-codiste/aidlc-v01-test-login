import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import sonarjs from 'eslint-plugin-sonarjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: './tsconfig.json' },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      sonarjs,
    },
    rules: {
      // NFR-MAINT-002 — cyclomatic complexity ≤ 10
      'sonarjs/cognitive-complexity': ['error', 10],
      'complexity': ['error', 10],

      // NFR-S07 — no plaintext secrets in code
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^(eyJ|--BEGIN .* PRIVATE KEY--).*/]',
          message: 'Hardcoded JWT or PEM detected. Load via env var instead.',
        },
      ],

      // P-PERF-001 — pg.Pool import only from repositories
      // (enforced at review stage; lint rule below catches direct usage)
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'pg', message: 'Import the Prisma client from `@prisma/client` instead.' },
          ],
        },
      ],

      // TS strictness
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // NFR-S07 — structured logging only (pino). The one allowed console.error in main.ts
      // is the pre-bootstrap env-fail-fast path and is covered by an explicit disable directive.
      'no-console': 'error',
    },
  },
];
