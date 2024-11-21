// eslint.config.mjs

/** @type {import('eslint').Linter.FlatConfig[]} */
import js from '@eslint/js'
import globals from 'globals'

import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import reactPlugin from 'eslint-plugin-react'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import eslintConfigPrettier from 'eslint-config-prettier'

const __dirname = new URL('.', import.meta.url).pathname

export default [
  js.configs.recommended,
  {
    ignores: [
      'build/**/*',
      'eslint.config.js',
      'node_modules/**/*',
      '**/*.test.{js,ts,jsx,tsx}',
      '**/*.spec.{js,ts,jsx,tsx}',
    ],
  },
  // React configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es6,
        ...globals.jest,
        process: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
    },
    settings: {
      react: {
        version: 'detect',
      },
      formComponents: ['Form'],
      linkComponents: [
        { name: 'Link', linkAttribute: 'to' },
        { name: 'NavLink', linkAttribute: 'to' },
      ],
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
      'import/ignore': ['.(css)$'],
    },
  },
  // TypeScript configuration
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
      globals: {
        ...globals.node,
        React: 'readonly',
        NodeJS: 'readonly',
      },
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'react/prop-types': 'off',
    },
  },
  { files: ['**/*-schema.ts'], rules: { '@typescript-eslint/no-unused-vars': 'off' } },
  // Node environment for eslint.config.mjs
  {
    files: ['eslint.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  eslintConfigPrettier,
]
