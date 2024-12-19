import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import globals from 'globals';
import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';
import pluginJest from 'eslint-plugin-jest';
import jest from 'eslint-plugin-jest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    plugins: { jest: pluginJest },
    languageOptions: { globals: globals.node },
  },
  pluginJs.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  {
    ignores: ['node-modules'],
  },
  {
    files: ['**/*.test.js'],
    ...jest.configs['flat/recommended'],
  },
  ...compat.config({
    plugins: ['require-extensions'],
    extends: 'plugin:require-extensions/recommended',
    ignorePatterns: ['**/*.test.js'],
  }),
];
