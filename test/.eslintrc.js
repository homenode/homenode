module.exports = {
  root: true,

  plugins: [
    'mocha',
  ],

  env: {
    es6: true,
    node: true,
    mocha: true,
  },

  rules: {
    'mocha/handle-done-callback': "error",
    'mocha/max-top-level-suites': "error",
    'mocha/no-exclusive-tests': "error",
    'mocha/no-global-tests': "error",
    'mocha/no-hooks-for-single-case': "error",
    'mocha/no-identical-title': "error",
    'mocha/no-mocha-arrows': "error",
    'mocha/no-nested-tests': "error",
    'mocha/no-pending-tests': "error",
    'mocha/no-return-and-callback': "error",
    'mocha/no-sibling-hooks': "error",
    'mocha/no-skipped-tests': "error",
    'mocha/no-top-level-hooks': "error",
  },
};
