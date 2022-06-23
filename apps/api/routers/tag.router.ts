import { Router } from "../deps.ts";

import { TagController } from "../controllers/index.ts";

import { auth, validate } from "../middlewares/index.ts";

import {
  createTagValidation,
  deleteTagValidation,
  getTagsValidation,
  updateTagValidation,
} from "../validations/index.ts";

const router = new Router();

router.get(
  "/tags",
  validate(getTagsValidation),
  auth("manageMyTags"),
  TagController.viewAllMine,
);

router.post(
  "/tags",
  validate(createTagValidation),
  auth("manageMyTags"),
  TagController.create,
);

router.put(
  "/tags/:id",
  validate(updateTagValidation),
  auth("manageMyTags"),
  TagController.updateMine,
);

router.delete(
  "/tags/:id",
  validate(deleteTagValidation),
  auth("manageMyTags"),
  TagController.deleteMine,
);

export default router;
