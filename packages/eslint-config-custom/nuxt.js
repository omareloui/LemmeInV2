module.exports = {
  ignorePatterns: ["{.nuxt,.output}/**/*"],
  extends: ["@nuxtjs/eslint-config-typescript"],
  parserOptions: {
    extraFileExtensions: [".vue"],
  },
  rules: {
    "vue/no-multiple-template-root": "off",
    "vue/multi-word-component-names": "off",
  },
};
