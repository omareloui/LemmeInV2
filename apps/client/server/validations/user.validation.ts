import z from "zod";

import { mongoId, name, role } from "server/validations/utils";

export const createUserValidation = {
  body: z.object({
    firstName: name,
    lastName: name,
    email: z.string().trim().min(1, { message: "Email is required." }).email(),
    password: z.string().min(8, { message: "Password is required." }).max(255),
    role: role.default("user"),
    isDisabled: z.boolean().default(false),
  }),
};

export const getUserValidation = {
  params: z.object({ id: mongoId }),
};

export const getUsersValidation = {};

export const updateUserValidation = {
  params: z.object({ id: mongoId }),
  body: z.object({
    firstName: name.optional(),
    lastName: name.optional(),
    role: role.optional(),
    isDisabled: z.boolean().optional(),
  }),
};

export const deleteUserValidation = {
  params: z.object({ id: mongoId }),
};
