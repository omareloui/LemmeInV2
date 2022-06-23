import { yup } from "../deps.ts";

export const notRequiredId = yup
  .string()
  .length(24)
  .matches(/^[\da-f]{24}$/i, "It has to be valid id")
  .trim();

export const requiredId = notRequiredId.required();
