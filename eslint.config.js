const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  { ignores: [ "node_modules/**", "dist/**", "coverage/**" ] },
  js.configs.recommended,
  {
    files: [ "**/*.js" ],
    languageOptions: { sourceType: "commonjs", globals: globals.node },
    rules: {
      semi: [ "warn", "always" ],
      quotes: [ "warn", "double" ],
      indent: [ "warn", 2, { SwitchCase: 1 } ],
      "comma-dangle": [ "warn", "always-multiline" ],
      "eol-last": [ "warn", "always" ],
      "spaced-comment": [ "warn", "always" ],
      "object-curly-spacing": [ "warn", "always" ],
      "array-bracket-spacing": [ "warn", "always" ],
      "object-curly-newline": [ "warn", { ImportDeclaration: { multiline: true, minProperties: 4 } } ],
    },
  },
  {
    files: [ "src/**/*.js" ],
    ignores: [ "src/**/page.config.js" ],
    languageOptions: {
      sourceType: "module",
      globals: { ...Object.fromEntries(Object.keys(globals.node).map((name) => [ name, "off" ])), ...globals.browser },
    },
  },
];
