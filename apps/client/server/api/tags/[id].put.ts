import { TagController } from "server/controllers";
import { authenticationGuard, authorizationGuard } from "server/utils";
import { updateTagValidation } from "server/validations";

export default defineEventHandler(async event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyTags");

  const body = await useBody(event);
  const context = updateTagValidation.context.parse(event.context);
  const parsedBody = updateTagValidation.body.parse(body);

  return TagController.updateOneMine(
    context.params.id,
    parsedBody,
    context.user._id,
  );
});
