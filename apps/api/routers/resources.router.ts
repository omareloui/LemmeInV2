import { Router } from "../deps.ts";

import { ResourcesController } from "../controllers/index.ts";

import { auth, validate } from "../middlewares/index.ts";

import { getResources } from "../validations/index.ts";

const router = new Router();

router.get(
  "/resources",
  validate(getResources),
  auth("manageMyResources"),
  ResourcesController.getMine,
);

export default router;
