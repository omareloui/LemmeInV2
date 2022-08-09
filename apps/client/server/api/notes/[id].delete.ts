import { authenticationGuard, authorizationGuard } from "server/utils";
import { NoteController } from "server/controllers";
import { deleteNoteValidation } from "server/validations";

export default defineEventHandler(event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyNotes");
  const context = deleteNoteValidation.context.parse(event.context);
  return NoteController.removeOneMine(context.params.id, context.user._id);
});
