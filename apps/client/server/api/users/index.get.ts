import { UserController } from "server/controllers";

export default defineEventHandler(() => UserController.getAll());
