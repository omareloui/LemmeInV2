import { yup } from "../deps.ts";

const name = ({ isRequired = true, isLastName = false } = {}) => {
  const nameValue = isLastName ? "last" : "first";
  const nameValidation = yup
    .string()
    .min(3)
    .max(255)
    .trim()
    .matches(
      /^[^.,<>`~+*!@#$%^&()[\]'"\/\\?:;-]+$/,
      `You can't have special character in the ${nameValue} name field.`,
    );

  if (isRequired)
    return nameValidation.required(`${nameValue} name is required`);
  return nameValidation;
};

const email = ({ isRequired = true } = {}) => {
  const emailValidation = yup.string().email().trim();
  if (isRequired) return emailValidation.required(`email is required`);
  return emailValidation;
};

const password = ({ isRequired = true, passwordName = "password" } = {}) => {
  const passValidation = yup.string().min(8).max(255);
  if (isRequired) return passValidation.required(`${passwordName} is required`);
  return passValidation;
};

export const loginValidation = {
  body: yup.object({
    email: email(),
    password: password(),
  }),
};

export const registerValidation = {
  body: yup.object({
    firstName: name(),
    lastName: name({ isLastName: true }),
    email: email(),
    password: password(),
  }),
};

export const meValidation = {};

export const updateMeValidation = {
  body: yup.object({
    firstName: name({ isRequired: false }),
    lastName: name({ isRequired: false, isLastName: true }),
    email: email({ isRequired: false }),
    password: password({ isRequired: false }),
    oldPassword: password({ isRequired: false, passwordName: "old password" }),
  }),
};
