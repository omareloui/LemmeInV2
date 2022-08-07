import { registerValidation } from "server/validations";
import { AuthController } from "server/controllers";

export default defineEventHandler(async event => {
  // TODO: add policy you shouldn't be signed

  const body = await useBody(event);
  const data = registerValidation.body.parse(body);

  return AuthController.register(data);
});
