import z from "zod";

import { email, password, name, contextId } from "server/validations/utils";

export const loginValidation = {
  body: z.object({
    email,
    password,
  }),
};

export const registerValidation = {
  body: z.object({
    firstName: name,
    lastName: name,
    email,
    password,
  }),
};

export const meValidation = {
  context: contextId,
};

export const updateMeValidation = {
  context: contextId,
  body: z.object({
    firstName: name.optional(),
    lastName: name.optional(),
    email: email.optional(),
    password: password.optional(),
    oldPassword: password.optional(),
  }),
};

export const refreshTokenValidation = {
  headers: z.object({
    "x-refresh-token": z.string().regex(/[\w-]+\.[\w-]+\.[\w-]+/),
  }),
};
