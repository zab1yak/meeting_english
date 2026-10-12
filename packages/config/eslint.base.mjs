import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Общая конфигурация ESLint для всех пакетов.
 * @param {string} tsconfigRootDir — каталог пакета (import.meta.dirname)
 */
export function createConfig(tsconfigRootDir) {
  return defineConfig([
    globalIgnores([
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/generated/**',
      '**/next-env.d.ts',
    ]),
    js.configs.recommended,
    tseslint.configs.strictTypeChecked,
    {
      languageOptions: {
        globals: globals.node,
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      },
    },
    {
      files: ['**/*.{js,mjs,cjs}'],
      extends: [tseslint.configs.disableTypeChecked],
    },
    prettier,
  ]);
}
