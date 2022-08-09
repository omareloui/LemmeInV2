import { TagController } from "server/controllers";
import { authenticationGuard, authorizationGuard } from "server/utils";
import { deleteTagValidation } from "server/validations";

export default defineEventHandler(event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyTags");

  const context = deleteTagValidation.context.parse(event.context);

  return TagController.removeOneMine(context.params.id, context.user._id);
});
