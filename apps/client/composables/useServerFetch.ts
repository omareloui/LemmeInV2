import Cookie from "cookie-universal";
// eslint-disable-next-line import/no-cycle
import { useAuthStore } from "~~/store/useAuth";

export function useServerFetch(
  ...params: Parameters<typeof $fetch>
): ReturnType<typeof $fetch> {
  const authStore = useAuthStore();
  const cookies = Cookie();

  // FIXME:
  const config = { public: { apiUrl: "http://localhost:8000" } }; // useRuntimeConfig();
  const { apiUrl } = config.public;

  const token = cookies.get(authStore.AUTH_COOKIE_NAME);

  return $fetch(`${apiUrl}${params[0]}`, {
    ...params[1],
    headers: {
      ...params[1]?.headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
}
