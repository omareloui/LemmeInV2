// eslint-disable-next-line import/no-extraneous-dependencies
import { defineNuxtConfig } from "nuxt";
import { fileURLToPath } from "node:url";
import { readdirSync } from "fs";

const components = readdirSync("./components");
const globalComponents = ["Icon", "Input"];

export default defineNuxtConfig({
  typescript: {
    shim: false,
  },

  alias: {
    store: fileURLToPath(new URL("./store", import.meta.url)),
    utils: fileURLToPath(new URL("./assets/utils", import.meta.url)),
  },

  components: {
    dirs: [
      ...components.map(c => ({
        path: `~~/components/${c}`,
        prefix: c,
        global: globalComponents.includes(c),
      })),
    ],
  },

  meta: {
    title: "Lemme In",

    htmlAttrs: {
      lang: "en",
    },

    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "Lemme in is an account/password manager app.",
      },
      { name: "color-scheme", content: "light dark" },
    ],

    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: true,
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Be+Vietnam:ital,wght@0,100;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,300;1,400;1,500;1,600;1,700;1,800&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap",
      },
    ],
  },

  css: [
    "~/assets/scss/core/index.scss",
    "~/assets/scss/variables/index.scss",
    "~/assets/scss/base/index.scss",
    "~/assets/scss/utilities/index.scss",
  ],

  buildModules: ["@pinia/nuxt"],
});
