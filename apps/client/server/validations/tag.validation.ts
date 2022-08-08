import z from "zod";
import { TAG_NAME_REGEX } from "server/utils";
import tagColors from "~~/config/tag-colors";
import { mongoId } from "./utils";

const createAndUpdateValidationBody = {
  name: z
    .string()
    .trim()
    .min(2, { message: "Tag name must be at least 2 characters long." })
    .max(16)
    .regex(
      TAG_NAME_REGEX,
      "You can't have spaces or special character in the tag name.",
    ),
  color: z.enum(tagColors),
};

export const createTagValidation = {
  body: z.object(createAndUpdateValidationBody),
};

export const getTagsValidation = {};

export const updateTagValidation = {
  params: z.object({ id: mongoId }),
  body: z.object(createAndUpdateValidationBody),
};

export const deleteTagValidation = {
  params: z.object({ id: mongoId }),
};
