import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginJest from 'eslint-plugin-jest';
import jest from 'eslint-plugin-jest';

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
];
