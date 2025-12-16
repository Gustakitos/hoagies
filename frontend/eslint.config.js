const expo = require('eslint-config-expo/flat');

module.exports = [
  {
    ignores: ['.expo/', 'android/', 'ios/', 'node_modules/'],
  },
  ...expo,
];

