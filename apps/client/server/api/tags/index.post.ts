import { TagController } from "server/controllers";
import { authenticationGuard, authorizationGuard } from "server/utils";
import { createTagValidation } from "server/validations";

export default defineEventHandler(async event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyTags");

  const body = await useBody(event);
  const parsedBody = createTagValidation.body.parse(body);
  const context = createTagValidation.context.parse(event.context);

  return TagController.createMine(parsedBody, context.user._id);
});
