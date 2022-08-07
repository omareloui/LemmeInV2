import type { AuthenticationPayload } from "types";

import { useAuthStore } from "store/useAuth";
import { useAuthHeaders } from "~~/composables/useAuthHeaders";

export async function useTokenedFetch(...params: Parameters<typeof $fetch>) {
  const headers = useAuthHeaders();

  let finalAccessToken = headers.authorization;
  let finalRefreshToken = headers["x-refresh-token"];

  if (!headers.authorization && finalRefreshToken) {
    const authStore = useAuthStore();
    const { accessToken, refreshToken } = (await $fetch(
      "/api/auth/refresh-tokens",
      {
        headers: { "x-refresh-token": finalRefreshToken },
      },
    )) as AuthenticationPayload;
    finalAccessToken = `Bearer ${accessToken.body}`;
    finalRefreshToken = refreshToken.body;
    authStore.setTokens(accessToken, refreshToken);
  }

  return $fetch(params[0], {
    ...params[1],
    headers: {
      ...params[1]?.headers,
      ...(finalAccessToken ? { authorization: finalAccessToken } : {}),
      ...(finalRefreshToken ? { "x-refresh-token": finalRefreshToken } : {}),
    },
  });
}
