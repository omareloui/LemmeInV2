import { useThemeStore } from "~~/store/useTheme";
// import { useAuthStore } from "~~/store/useAuth";
// import { useResourcesStore } from "~~/store/useResources";

export default defineNuxtPlugin(() => {
  // const route = useRoute();
  const themeStore = useThemeStore();
  // const authStore = useAuthStore();
  // const resourcesStore = useResourcesStore();

  themeStore.load();
  if (process.client) {
    themeStore.updateHtmlAttrs();
    themeStore.loadMediaQuery();
  }

  // await authStore.setMe();
  // await authStore.setKeyFromCookie();
  // await resourcesStore.load();

  // if (route.fullPath === "/" && authStore.isSigned) navigateTo("/home");
});
