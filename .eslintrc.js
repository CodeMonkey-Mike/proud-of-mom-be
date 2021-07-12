module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: '16.13.1',
    },
  },
  env: {
    browser: true,
    es6: true,
  },
  extends: [],
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    '@typescript-eslint/no-array-constructor': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
    'import/newline-after-import': 'warn',
    'import/no-cycle': 'error',
    'import/no-extraneous-dependencies': 'error',
    'no-var': 'warn',
    'prefer-arrow-callback': 'warn',
    'prefer-const': 'warn',
  },
};
