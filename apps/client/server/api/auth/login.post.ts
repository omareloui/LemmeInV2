import { loginValidation } from "server/validations";
import { AuthController } from "server/controllers";
import { alreadySignedGuard } from "server/utils";

export default defineEventHandler(async event => {
  alreadySignedGuard(event);
  const body = await useBody(event);
  const data = loginValidation.body.parse(body);
  return AuthController.login(data);
});
