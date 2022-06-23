module.exports = {
  ignorePatterns: ["/**/node_modules"],
  extends: ["prettier"],
  rules: {
    "import/prefer-default-export": "off",
    "import/prefer-default-export": "off",
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],
    curly: ["error", "multi"],
  },
};
