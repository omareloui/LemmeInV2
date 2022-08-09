import { AccountController } from "server/controllers";
import { authenticationGuard, authorizationGuard } from "server/utils";
import { updateAccountValidation } from "server/validations";

export default defineEventHandler(async event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyAccounts");

  const body = await useBody(event);
  const context = updateAccountValidation.context.parse(event.context);
  const parsedBody = updateAccountValidation.body.parse(body);

  return AccountController.updateOneMine(
    context.params.id,
    { id: context.params.id, ...parsedBody },
    context.user._id,
  );
});
