import { updateMeValidation } from "server/validations";
import { AuthController } from "server/controllers";
import { authenticationGuard } from "server/utils";

export default defineEventHandler(async event => {
  authenticationGuard(event);
  const body = await useBody(event);
  const bodyData = updateMeValidation.body.parse(body);
  const contextData = updateMeValidation.context.parse(event.context);
  return AuthController.updateMe(bodyData, contextData.user._id);
});
