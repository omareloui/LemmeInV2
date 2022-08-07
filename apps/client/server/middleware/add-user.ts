import { verifyToken } from "server/utils";
import { config } from "server/config";

import type { AccessTokenContent } from "types";

function verify(token: string) {
  try {
    return verifyToken<AccessTokenContent>(token, config.tokens.access.secret);
  } catch (e) {
    return false;
  }
}

export default defineEventHandler(event => {
  const { req, context } = event;
  const token = (req.headers.authorization as string | undefined)?.split(
    "Bearer ",
  )[1];
  if (token) {
    const payload = verify(token);
    if (payload) context.user = payload;
  }
});
