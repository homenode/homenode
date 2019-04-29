module.exports = {
  extends: [
    'airbnb-base',
  ],

  env: {
    node: true,
    es6: true,
  },

  rules: {

    'max-len': [
      'error',
      180,
      2,
      {
        ignoreUrls: true,
        ignoreComments: false,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],

    'no-param-reassign': [
      'error',
      {
        'props': true,
        'ignorePropertyModificationsFor': ['mod']
      }
    ],

    'arrow-parens': [
      'error',
      'always',
    ],

    'no-use-before-define': [
      'error',
      {
        'functions': false,
      },
    ],

    'prefer-destructuring': [0],
    'no-console': [0],
  },
};
