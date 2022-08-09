import z from "zod";

import { MONGO_DB_ID_REGEX } from "server/utils";
import { roles } from "server/config";

export const mongoId = z
  .string()
  .regex(MONGO_DB_ID_REGEX, { message: "Invalid id." });

export const name = z
  .string()
  .trim()
  .min(3, {
    message: "First and last names have to be at least 3 characters long.",
  })
  .regex(
    /^[^.,<>`~+*!@#$%^&()[\]'"/\\?:;-]+$/,
    "You can't have special character in names.",
  )
  .max(255);

export const email = z.string().email();

export const password = z
  .string()
  .min(8, { message: "Password has to be at least 8 characters long." });

export const role = z.enum(roles);

export const contextId = z.object({
  user: z.object({
    _id: mongoId,
  }),
});

export const paramsId = z.object({
  params: z.object({
    id: mongoId,
  }),
});

export const userAndParamsContextIds = z.object({
  user: z.object({ _id: mongoId }),
  params: z.object({ id: mongoId }),
});
