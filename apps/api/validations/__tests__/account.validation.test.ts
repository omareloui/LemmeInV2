import {
  ValidationTester,
  ValidData,
  ErrorValidationDataForCreationAndUpdate,
} from "./validate.test.helper.ts";

import {
  getAccountValidation,
  getAccountsValidation,
  createAccountValidation,
  updateAccountValidation,
  deleteAccountValidation,
} from "../index.ts";

const validationTester = new ValidationTester("account");

const errorValidationData: ErrorValidationDataForCreationAndUpdate[] = [
  {
    description:
      "should have 'app' as required on creating and updating account",
    body: { password: "valid pass" },
    errorIncludes: '"app" is required',
  },
  {
    description:
      "should have 'password' as required on creating and updating account",
    body: { app: "google.com" },
    errorIncludes: '"password" is required',
  },
  {
    description:
      "should throw error on password less than 3 characters on creating and updating account",
    body: { app: "some app", password: "no" },
    errorIncludes: "at least 3 characters",
  },
  {
    description:
      "should throw error on providing extra field on creating and updating account",
    body: { app: "some app", password: "validPass", notValidField: false },
    errorIncludes: "notValidField is not allowed",
  },
];

const passingValidations: ValidData[] = [
  {
    description:
      "should pass on providing only app and password on creating account",
    schema: createAccountValidation,
    body: {
      app: "google.com",
      password: "SomePassword",
    },
  },
  {
    description: "should accept accountIdentifier",
    schema: createAccountValidation,
    body: {
      app: "google.com",
      password: "SomePassword",
      accountIdentifier: "omarelwy@gmail.com",
    },
  },
  {
    description: "should accept note",
    schema: createAccountValidation,
    body: {
      app: "google.com",
      password: "SomePassword",
      note: "some note",
    },
  },
  {
    description: "should accept site",
    schema: createAccountValidation,
    body: {
      app: "google.com",
      password: "SomePassword",
      site: "https://google.com",
    },
  },
  {
    description: "should take id on requesting an account",
    schema: getAccountValidation,
    params: {
      id: "ea22f9203c4ea22fa21123c4",
    },
  },
  {
    description: "should take nothing on requesting all accounts",
    schema: getAccountsValidation,
  },
  {
    description: "should take id for deleting account",
    schema: deleteAccountValidation,
    params: {
      id: "ea22f9203c4ea22fa21123c4",
    },
  },
];

validationTester.validateCreateAndUpdateErrors(
  errorValidationData,
  createAccountValidation,
  updateAccountValidation,
);
validationTester.testValidData(passingValidations);
