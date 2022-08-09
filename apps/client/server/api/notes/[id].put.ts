import { authenticationGuard, authorizationGuard } from "server/utils";
import { NoteController } from "server/controllers";
import { updateNoteValidation } from "server/validations";

export default defineEventHandler(async event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyNotes");
  const body = await useBody(event);
  const context = updateNoteValidation.context.parse(event.context);
  const parsedBody = updateNoteValidation.body.parse(body);
  return NoteController.updateOneMine(
    { id: context.params.id, ...parsedBody },
    context.user._id,
  );
});
