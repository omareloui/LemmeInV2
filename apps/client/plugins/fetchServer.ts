import Cookie from "cookie-universal";
import { useAuthStore } from "~~/store/useAuth";

type FetchParams = Parameters<typeof $fetch>;

function fetchServer(
  ...params: Parameters<typeof $fetch>
): ReturnType<typeof $fetch> {
  const authStore = useAuthStore();
  const cookies = Cookie();
  const config = useRuntimeConfig();

  const token = cookies.get(authStore.AUTH_COOKIE_NAME);

  return $fetch(`${config.public.apiUrl}${params[0]}`, {
    ...params[1],
    headers: {
      ...params[1]?.headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
}

export class FetchServer {
  static get(url: FetchParams[0], options?: Omit<FetchParams[1], "method">) {
    return fetchServer(url, options);
  }

  static post(
    url: FetchParams[0],
    body?: Record<string, unknown>,
    options?: Omit<FetchParams[1], "method" | "body">,
  ) {
    return fetchServer(url, { ...options, method: "POST", body });
  }

  static put(
    url: string,
    body?: Record<string, unknown>,
    options?: Omit<FetchParams[1], "method" | "body">,
  ) {
    return fetchServer(url, { ...options, method: "POST", body });
  }

  static delete(
    url: string,
    body?: Record<string, unknown>,
    options?: Omit<FetchParams[1], "method" | "body">,
  ) {
    return fetchServer(url, { ...options, method: "DELETE", body });
  }
}

export default defineNuxtPlugin(() => ({
  provide: {
    fetchServer: FetchServer,
  },
}));
