import { authenticationGuard, authorizationGuard } from "server/utils";
import { AccountController } from "server/controllers";
import { createAccountValidation } from "server/validations";

export default defineEventHandler(async event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyAccounts");
  const body = await useBody(event);
  const data = createAccountValidation.body.parse(body);
  const parsedContext = createAccountValidation.context.parse(event.context);
  return AccountController.createMine(data, parsedContext.user._id);
});
