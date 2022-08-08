import z from "zod";
import { mongoId } from "./utils";

const createAndUpdateValidationBody = {
  body: z.string().trim(),
  title: z.string().trim(),
  tags: mongoId.array(),
};

export const createNoteValidation = {
  body: z.object(createAndUpdateValidationBody),
};

export const getNotesValidation = {};

export const updateNoteValidation = {
  params: z.object({ id: mongoId }),
  body: z.object(createAndUpdateValidationBody),
};

export const deleteNoteValidation = {
  params: z.object({ id: mongoId }),
};
