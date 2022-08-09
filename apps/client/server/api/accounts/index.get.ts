import { AccountController } from "server/controllers";
import { authenticationGuard, authorizationGuard } from "server/utils";
import { getAccountsValidation } from "server/validations";

export default defineEventHandler(event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyAccounts");

  const context = getAccountsValidation.context.parse(event.context);

  return AccountController.getAllMine(context.user._id);
});
