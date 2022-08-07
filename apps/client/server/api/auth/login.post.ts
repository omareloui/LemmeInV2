import { loginValidation } from "server/validations";
import { AuthController } from "server/controllers";

export default defineEventHandler(async event => {
  // TODO: add policy you shouldn't be signed

  const body = await useBody(event);
  const data = loginValidation.body.parse(body);

  return AuthController.login(data);
});
