import { AccountController } from "server/controllers";
import { authenticationGuard, authorizationGuard } from "server/utils";
import { deleteAccountValidation } from "server/validations";

export default defineEventHandler(event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyAccounts");

  const context = deleteAccountValidation.context.parse(event.context);

  return AccountController.removeOneMine(context.params.id, context.user._id);
});
