import z from "zod";
import { contextId, mongoId, userAndParamsContextIds } from "./utils";

const createAndUpdateValidationBody = {
  body: z.string().trim(),
  title: z.string().trim(),
  tags: mongoId.array(),
};

export const createNoteValidation = {
  context: contextId,
  body: z.object(createAndUpdateValidationBody),
};

export const getNotesValidation = {
  context: contextId,
};

export const getNoteValidation = {
  context: userAndParamsContextIds,
};

export const updateNoteValidation = {
  context: userAndParamsContextIds,
  body: z.object(createAndUpdateValidationBody),
};

export const deleteNoteValidation = {
  context: userAndParamsContextIds,
};
