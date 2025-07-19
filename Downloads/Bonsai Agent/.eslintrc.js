module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-console': 'off',
    'react/no-unescaped-entities': 'off',
    'react/jsx-no-undef': 'off',
    'import/no-anonymous-default-export': 'off'
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'dist/',
    'build/',
    '*.config.js',
    '*.config.ts',
    'apps/'
  ]
}