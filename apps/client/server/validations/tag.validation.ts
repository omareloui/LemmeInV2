import z from "zod";
import { TAG_NAME_REGEX } from "server/utils";
import tagColors from "~~/config/tag-colors";
import { contextId, userAndParamsContextIds } from "./utils";

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
  context: contextId,
  body: z.object(createAndUpdateValidationBody),
};

export const getTagValidation = {
  context: userAndParamsContextIds,
};

export const getTagsValidation = {
  context: contextId,
};

export const updateTagValidation = {
  context: userAndParamsContextIds,
  body: z.object(createAndUpdateValidationBody),
};

export const deleteTagValidation = {
  context: userAndParamsContextIds,
};
