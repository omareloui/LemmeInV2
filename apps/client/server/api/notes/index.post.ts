import { authenticationGuard, authorizationGuard } from "server/utils";
import { NoteController } from "server/controllers";
import { createNoteValidation } from "server/validations";

export default defineEventHandler(async event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyNotes");
  const body = await useBody(event);
  const context = createNoteValidation.context.parse(event.context);
  const parsedBody = createNoteValidation.body.parse(body);
  return NoteController.createMine(parsedBody, context.user._id);
});
