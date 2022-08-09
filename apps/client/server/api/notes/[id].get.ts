import { authenticationGuard, authorizationGuard } from "server/utils";
import { NoteController } from "server/controllers";
import { getNoteValidation } from "server/validations";

export default defineEventHandler(event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyNotes");
  const context = getNoteValidation.context.parse(event.context);
  return NoteController.getOneMine(context.params.id, context.user._id);
});
