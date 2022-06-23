import {
  ValidationTester,
  ValidData,
  ErrorValidationData,
} from "./validate.test.helper.ts";

import { loginValidation, registerValidation, meValidation } from "../index.ts";

const validationTester = new ValidationTester("auth");

const errorValidationData: ErrorValidationData[] = [
  {
    description: "should get error on logging in with no email",
    schema: loginValidation,
    body: { password: "123456789" },
    errorIncludes: "email is required",
  },
  {
    description: "should get error on logging in with no password",
    schema: loginValidation,
    body: { email: "omareloui@hotmail.com" },
    errorIncludes: "password is required",
  },
  {
    description: "should get error on logging in with invalid email",
    schema: loginValidation,
    body: {
      email: "no_email",
      password: "12345678",
    },
    errorIncludes: "must be a valid email",
  },
  {
    description: "should get error on logging in with too short password",
    schema: loginValidation,
    body: { email: "email@email.com", password: "1234" },
    errorIncludes: "must be at least 8 characters",
  },

  {
    description: "should get error on registering with no email",
    schema: registerValidation,
    body: { firstName: "omar", lastName: "eloui", password: "123456789" },
    errorIncludes: "email is required",
  },
  {
    description: "should get error on registering with no first name",
    schema: registerValidation,
    body: {
      lastName: "eloui",
      email: "omareloui@hotmail.com",
      password: "123456789",
    },
    errorIncludes: "first name is required",
  },
  {
    description: "should get error on registering with no last name",
    schema: registerValidation,
    body: {
      firstName: "omar",
      email: "omareloui@hotmail.com",
      password: "123456789",
    },
    errorIncludes: "last name is required",
  },
  {
    description: "should get error on registering with no password",
    schema: registerValidation,
    body: {
      firstName: "omar",
      lastName: "eloui",
      email: "omareloui@hotmail.com",
    },
    errorIncludes: "password is required",
  },
];

const passingValidations: ValidData[] = [
  {
    description: "should pass logging in with valid email and a password",
    schema: loginValidation,
    body: { email: "omareloui@hotmail.com", password: "123456789" },
  },
  {
    description: "should pass register with valid email, username and password",
    schema: registerValidation,
    body: {
      email: "omareloui@hotmail.com",
      firstName: "omar",
      lastName: "eloui",
      password: "123456789",
    },
  },
  {
    description: "should pass me validation with no requirements",
    schema: meValidation,
  },
];

validationTester.testValidData(passingValidations);
validationTester.testWithValidationMiddlewareWithError(errorValidationData);
