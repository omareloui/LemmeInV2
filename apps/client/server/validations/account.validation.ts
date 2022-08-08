import z from "zod";
import { mongoId } from "./utils";

const createAndUpdateAccountBody = {
  app: z
    .string()
    .trim()
    .min(3, 'Field "app" has to be at least 3 character long.')
    .max(256),
  password: z
    .string()
    .min(3, 'Field "password" has to be at least 3 characters long.')
    .max(256)
    .trim(),
  kind: z.enum(["Native", "OAuthed"]),
  accountIdentifier: z.string().trim().optional(),
  note: z.string().trim().optional(),
  site: z.string().trim().optional(),
  tags: mongoId.array().optional(),
};

export const createAccountValidation = {
  body: z.object(createAndUpdateAccountBody),
};

export const getAccountValidation = {
  params: z.object({ id: mongoId }),
};

export const getAccountsValidation = {};

export const updateAccountValidation = {
  params: z.object({ id: mongoId }),
  body: z.object(createAndUpdateAccountBody),
};

export const updateAccountLastUsedValidation = {
  params: z.object({ id: mongoId }),
};

export const deleteAccountValidation = {
  params: z.object({
    id: mongoId,
  }),
};
