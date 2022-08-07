import { updateMeValidation } from "server/validations";
import { AuthController } from "server/controllers";

export default defineEventHandler(async event => {
  // TODO: add policy you should be signed
  const body = await useBody(event);
  const bodyData = updateMeValidation.body.parse(body);
  const contextData = updateMeValidation.context.parse(event.context);
  return AuthController.updateMe(bodyData, contextData.user.id);
});
