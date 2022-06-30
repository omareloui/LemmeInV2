/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  ignorePatterns: ["/**/node_modules"],
  extends: ["prettier"],
  rules: {
    "import/prefer-default-export": "off",
    "import/prefer-default-export": "off",

    "@typescript-eslint/no-unused-vars": "warn",

    "quotes": ["warn", "double", { avoidEscape: true }],
    "semi": ["warn", "always"],
    "comma-dangle": ["warn", "always-multiline"],
    "curly": ["warn", "multi"],
  },
};
