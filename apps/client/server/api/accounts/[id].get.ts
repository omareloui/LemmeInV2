import { AccountController } from "server/controllers";
import { authenticationGuard, authorizationGuard } from "server/utils";
import { getAccountValidation } from "server/validations";

export default defineEventHandler(event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyAccounts");

  const context = getAccountValidation.context.parse(event.context);

  return AccountController.getOneMine(context.params.id, context.user._id);
});
