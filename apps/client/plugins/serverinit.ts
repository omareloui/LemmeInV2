import type { ClientUser as User } from "types";
import { useAuthStore } from "~~/store/useAuth";
import { useResourcesStore } from "~~/store/useResources";

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  const resourcesStore = useResourcesStore();

  let shouldRemoveTokens = false;

  try {
    const headers = useAuthHeaders();
    if (!headers.authorization && !headers["x-refresh-token"]) return;

    const user = (await useTokenedFetch("/api/me")) as User | undefined;
    if (!user) return;
    authStore.user = user;
    if (useRoute().fullPath === "/") {
      await nextTick();
      navigateTo("/home");
    }
    // TODO:
    // await authStore.setKeyFromCookie();
    await resourcesStore.load();
  } catch (e) {
    shouldRemoveTokens = true;
  }

  if (process.client && shouldRemoveTokens) authStore.signout();
});
