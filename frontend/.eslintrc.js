module.exports = {
  extends: ['expo', 'plugin:react-native/all'],
  plugins: ['react-native'],
  rules: {
    'react-native/no-inline-styles': 'warn',
    'react-native/no-raw-text': 'off',
    'react-native/no-color-literals': 'off',
    'react-native/no-unused-styles': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
  ignorePatterns: ['/dist/*', '/node_modules/*'],
};
