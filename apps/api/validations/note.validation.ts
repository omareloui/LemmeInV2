import { yup } from "../deps.ts";
import { requiredId } from "../utils/index.ts";

const createAndUpdateValidationBody = {
  body: yup.string().trim(),
  title: yup.string().trim(),
  tags: yup.array().of(requiredId),
};

export const createNoteValidation = {
  body: yup.object(createAndUpdateValidationBody),
};

export const getNotesValidation = {};

export const updateNoteValidation = {
  params: yup.object({ id: requiredId }),
  body: yup.object(createAndUpdateValidationBody),
};

export const deleteNoteValidation = {
  params: yup.object({ id: requiredId }),
};
