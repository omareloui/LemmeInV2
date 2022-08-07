import { meValidation } from "server/validations";
import { AuthController } from "server/controllers";
import { authenticationGuard } from "server/utils";

export default defineEventHandler(event => {
  authenticationGuard(event);
  const data = meValidation.context.parse(event.context);
  return AuthController.me(data.user._id);
});
