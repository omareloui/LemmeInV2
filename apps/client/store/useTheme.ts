import Cookie from "cookie-universal";
import { defineStore, acceptHMRUpdate } from "pinia";

type ThemeOption = "light" | "dark" | "default";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    THEME_COOKIE_NAME: "theme",
    currentTheme: "light" as ThemeOption,
  }),

  actions: {
    setThemeState(value: ThemeOption) {
      this.currentTheme = value;
    },

    load() {
      this.loadSetTheme();
    },

    loadMediaQuery() {
      this.setFromMediaQueryIfNeeded();
      this.listenForDefaultChange();
    },

    toggleTheme() {
      const neededTheme = this.currentTheme === "dark" ? "light" : "dark";
      this.changeTheme(neededTheme);
    },

    changeTheme(theme: ThemeOption) {
      this.setThemeState(theme);
      this.setThemeToCookie(theme);
    },

    async loadSetTheme() {
      const cookie = await this.getThemeFromCookie();
      this.changeTheme(cookie);
    },

    setThemeToCookie(theme: ThemeOption) {
      const cookies = Cookie();
      cookies.set(this.THEME_COOKIE_NAME, theme, {
        sameSite: "lax",
        path: "/",
      });
    },

    getThemeFromCookie() {
      const cookies = Cookie();
      let theme = cookies.get(this.THEME_COOKIE_NAME);
      if (!theme) theme = "default";
      return theme;
    },

    async setFromMediaQueryIfNeeded() {
      if (this.currentTheme === "default") {
        const theme = await this.getThemeFromMediaQuery();
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
