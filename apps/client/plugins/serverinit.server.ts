import { useAuthStore } from "~~/store/useAuth";
import { useResourcesStore } from "~~/store/useResources";

export default defineNuxtPlugin(async () => {
  const route = useRoute();
  const authStore = useAuthStore();
  const resourcesStore = useResourcesStore();

  await authStore.setMe();
  // await authStore.setKeyFromCookie();
  await resourcesStore.load();

  if (route.fullPath === "/" && authStore.isSigned) navigateTo("/home");
});
