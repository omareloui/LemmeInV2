module.exports = {
  ignorePatterns: ["{.nuxt,.output}/**/*"],
  extends: ["@nuxtjs/eslint-config-typescript"],
  parserOptions: {
    extraFileExtensions: [".vue"],
  },
};
