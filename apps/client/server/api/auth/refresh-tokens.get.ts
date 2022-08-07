import { AuthController } from "server/controllers";
import { refreshTokenValidation } from "server/validations";

export default defineEventHandler(event => {
  const parsedHeader = refreshTokenValidation.headers.parse(event.req.headers);
  return AuthController.refreshTokens(parsedHeader["x-refresh-token"]);
});
