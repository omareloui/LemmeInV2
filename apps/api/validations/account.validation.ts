import { yup } from "../deps.ts";
import { requiredId } from "../utils/index.ts";

const createAndUpdateAccountBody = {
  app: yup.string().min(3).max(256).trim().required(`Field "app" is required`),
  password: yup
    .string()
    .min(3)
    .max(256)
    .trim()
    .required(`Field "password" is required`),
  isNative: yup.boolean().required(),
  accountIdentifier: yup.string().trim(),
  note: yup.string().trim(),
  site: yup.string().trim(),
  tags: yup.array().of(yup.string()),
};

export const createAccountValidation = {
  body: yup.object(createAndUpdateAccountBody),
};

export const getAccountValidation = {
  params: yup.object({ id: requiredId }),
};

export const getAccountsValidation = {};

export const updateAccountValidation = {
  params: yup.object({ id: requiredId }),
  body: yup.object(createAndUpdateAccountBody),
};

export const updateAccountLastUsedValidation = {
  params: yup.object({ id: requiredId }),
};

export const deleteAccountValidation = {
  params: yup.object({
    id: requiredId,
  }),
};
