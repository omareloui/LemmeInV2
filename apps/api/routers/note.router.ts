import { Router } from "../deps.ts";

import { NoteController } from "../controllers/index.ts";

import { auth, validate } from "../middlewares/index.ts";

import {
  getNotesValidation,
  createNoteValidation,
  deleteNoteValidation,
  updateNoteValidation,
} from "../validations/index.ts";

const router = new Router();

router.get(
  "/notes",
  validate(getNotesValidation),
  auth("manageMyNotes"),
  NoteController.viewAllMine,
);

router.post(
  "/notes",
  validate(createNoteValidation),
  auth("manageMyNotes"),
  NoteController.create,
);

router.put(
  "/notes/:id",
  validate(updateNoteValidation),
  auth("manageMyNotes"),
  NoteController.updateMine,
);

router.delete(
  "/notes/:id",
  validate(deleteNoteValidation),
  auth("manageMyNotes"),
  NoteController.deleteMine,
);

export default router;
