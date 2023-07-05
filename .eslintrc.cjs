const { error } = require("console");

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    ecmaVersion: 2021, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    tsconfigRootDir: __dirname,
  },
  // overrides: [
  //   {
  //     files: ['*.ts', '*.tsx'],
  //     parserOptions: {
  //       project: ['./tsconfig.json'],
  //     },
  //   },
  // ],
  root: true,
  plugins: [
    '@typescript-eslint',
    'import'
  ],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    // 'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  rules: {
    ////////////////////////////////////////////////////////////////////////////// standard rules 
    'eqeqeq': 'error', // force use of === and !== instead of == and !=
    // 'no-underscore-dangle' : ['error', {allowAfterThis: true}],
    'no-underscore-dangle': ['off'], // allow identifiers starting with _ 
    'max-classes-per-file': ['warn', { max: 3 }],
    // 'max-len': ["error", { "code": 120 ,"ignoreComments": true  }],
    'class-methods-use-this': 'off',
    'no-plusplus': 'off', // allow i++ syntax
    'semi': 'error', // force semi-colon


    ////////////////////////////////////////////////////////////////////////////// rule from import plugin 
    'import/extensions': [ 'error', 'never' ], // force import without file extension (import {abc} from "xyz")
    'import/prefer-default-export': 'off', // no need to export default for a class 
    //
    ////////////////////////////////////////////////////////////////////////////// rule from typescript-eslint plugin  
    '@typescript-eslint/quotes': ['error', 'single'],
    '@typescript-eslint/explicit-function-return-type': 'off', // dont force to specify return type for function/methods
    '@typescript-eslint/explicit-module-boundary-types': 'off', // dont force to specify return type for public methods/func
    // '@typescript-eslint/indent': ["error", 2],
    //
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'parameter',
        modifiers: ['unused'],
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
    ],
    '@typescript-eslint/no-empty-interface': [ /// not alllow empty interface
      'error',
      {
        allowSingleExtends: true,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_', // https://github.com/typescript-eslint/typescript-eslint/issues/1054
      },
    ],
    '@typescript-eslint/no-explicit-any': ['warn'], // warn on use of any
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: true }], // not allow use class before declaration
    '@typescript-eslint/no-shadow': ['warn'], // warn if shadowing a variable (variable that have the same name with another within context)
    '@typescript-eslint/no-throw-literal': ['error'], // force throw new Error('message') syntax
    // only allow declare module for external modules in .d.ts files
    '@typescript-eslint/no-namespace': ['error'],// not allow use namespace which deprecated in es2015
    // prefer foo as string type assertion to <string>foo
    // and prefer `const foo:someType = bar` over `const foo = bar as someType`
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
    ],
  },
};
