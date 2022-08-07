import { meValidation } from "server/validations";
import { AuthController } from "server/controllers";

export default defineEventHandler(event => {
  // TODO: add policy you should be signed
  const data = meValidation.context.parse(event.context);
  return AuthController.me(data.user._id);
});
