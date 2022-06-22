module.exports = {
  extends: ["custom", "plugin:vue/essential"],
  ignorePatterns: ["{.nuxt,.output,node_modules}/**/*"],
  plugins: ["vue"],
  rules: {
    "vue/multi-word-component-names": "off",
  },
};
