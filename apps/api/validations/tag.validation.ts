import { yup } from "../deps.ts";
import { requiredId } from "../utils/index.ts";

const createAndUpdateValidationBody = {
  name: yup
    .string()
    .min(2)
    .max(16)
    .matches(
      /^[^\s.,<>`~+*!@#$%^&()[\]'"\/\\?:;-]+$/,
      "You can't have spaces or special character in the tag name.",
    )
    .trim()
    .required(`Field "name" is required`),
  color: yup
    .string()
    .min(2)
    .max(30)
    .trim()
    .required(`Field "color" is required`),
};

export const createTagValidation = {
  body: yup.object(createAndUpdateValidationBody),
};

export const getTagsValidation = {};

export const updateTagValidation = {
  params: yup.object({ id: requiredId }),
  body: yup.object(createAndUpdateValidationBody),
};

export const deleteTagValidation = {
  params: yup.object({ id: requiredId }),
};
