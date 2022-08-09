import { TagController } from "server/controllers";
import { authenticationGuard, authorizationGuard } from "server/utils";
import { getTagsValidation } from "server/validations";

export default defineEventHandler(event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyTags");

  const context = getTagsValidation.context.parse(event.context);

  return TagController.getAllMine(context.user._id);
});
