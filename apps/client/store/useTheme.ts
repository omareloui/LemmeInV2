import Cookie from "cookie-universal";
import { defineStore, acceptHMRUpdate } from "pinia";

import { ThemeOption } from "~~/types";

const THEME_COOKIE_NAME = "theme";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    currentTheme: "default" as ThemeOption,
  }),

  getters: {
    htmlAttr: state => (state.currentTheme === "dark" ? "dark" : false),
  },

  actions: {
    load() {
      const cookie = this.getThemeFromCookie() as ThemeOption;
      this.changeTheme(cookie);
    },

    changeTheme(theme: ThemeOption) {
      this.currentTheme = theme;
      this.setThemeToCookie(theme);
      this.updateHtmlAttrs();
    },

    toggleTheme() {
      this.changeTheme(this.currentTheme === "dark" ? "light" : "dark");
    },

    updateHtmlAttrs() {
      useHead({
        htmlAttrs: {
          theme: this.htmlAttr,
        },
      });
    },

    setThemeToCookie(theme: ThemeOption) {
      const cookies = Cookie();
      cookies.set(THEME_COOKIE_NAME, theme, {
        path: "/",
        sameSite: "lax",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    },

    getThemeFromCookie() {
      const cookies = Cookie();
      const cookie =
        useCookie(THEME_COOKIE_NAME).value || cookies.get(THEME_COOKIE_NAME);
      if (!cookie) this.setThemeToCookie("default");
      return cookie as ThemeOption;
    },

    loadMediaQuery() {
      this.setFromMediaQueryIfNeeded();
      this.listenForDefaultChange();
    },

    setFromMediaQueryIfNeeded() {
      if (this.currentTheme === "default") {
        const theme = this.getThemeFromMediaQuery();
        this.changeTheme(theme);
      }
    },

    getThemeFromMediaQuery() {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      )
        return "dark";
      return "light";
    },

    listenForDefaultChange() {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", e => {
          this.changeTheme(e.matches ? "dark" : "light");
        });
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useThemeStore, import.meta.hot));
