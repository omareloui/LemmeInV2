import { TagController } from "server/controllers";
import { authenticationGuard, authorizationGuard } from "server/utils";
import { getTagValidation } from "server/validations";

export default defineEventHandler(event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyTags");

  const context = getTagValidation.context.parse(event.context);

  return TagController.getOneMine(context.params.id, context.user._id);
});
