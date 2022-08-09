import { authenticationGuard, authorizationGuard } from "server/utils";
import { NoteController } from "server/controllers";
import { getNotesValidation } from "server/validations";

export default defineEventHandler(event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyNotes");
  const data = getNotesValidation.context.parse(event.context);
  return NoteController.getAllMine(data.user._id);
});
