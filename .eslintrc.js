module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  extends: ['plugin:react/recommended', 'standard'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
  plugins: ['react'],
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    'comma-dangle': ['error', 'never'],
    quotes: ['error', 'single'],
    'react/no-unescaped-entities': 0,
    'react/display-names': 'off',
    'no-use-before-define': 0,
    'react/display-name': 0,
    'jsx-quotes': ['warn', 'prefer-single'],
    semi: ['error', 'always'],
    'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 1 }],
  },
};
