import { UserController } from "server/controllers";
import { authenticationGuard, authorizationGuard } from "server/utils";

export default defineEventHandler(event => {
  authenticationGuard(event);
  authorizationGuard(event, "getUsers");
  return UserController.getAll();
});
