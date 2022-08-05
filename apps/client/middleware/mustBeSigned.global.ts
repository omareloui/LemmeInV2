import { useAuthStore } from "store/useAuth";

// eslint-disable-next-line consistent-return
export default defineNuxtRouteMiddleware(() => {
  const route = useRoute();

  const isProtectedRoute = !!route.fullPath.match(
    /^\/(vault|tags|settings|home)/,
  );

  if (isProtectedRoute) {
    const authStore = useAuthStore();

    if (!authStore.isSigned && process.server) return navigateTo("/signin");
  }
});
