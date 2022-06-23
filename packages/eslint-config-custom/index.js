module.exports = {
  ignorePatterns: ["/**/node_modules"],
  extends: ["prettier"],
  rules: {
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],
    curly: ["error", "multi"],
  },
};
