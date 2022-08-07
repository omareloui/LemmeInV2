import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "utils/constants";

export function useAuthHeaders() {
  const accessToken = useCookie(ACCESS_TOKEN_COOKIE_NAME).value;
  const refreshToken = useCookie(REFRESH_TOKEN_COOKIE_NAME).value;

  return {
    "authorization": accessToken ? `Bearer ${accessToken}` : undefined,
    "x-refresh-token": refreshToken,
  };
}
