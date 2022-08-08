import { authenticationGuard, authorizationGuard } from "server/utils";
import { ResourcesController } from "server/controllers";
import { getResources } from "server/validations";

export default defineEventHandler(event => {
  authenticationGuard(event);
  authorizationGuard(event, "me", "manageMyResources");
  const data = getResources.context.parse(event.context);
  return ResourcesController.getMine(data.user._id);
});
