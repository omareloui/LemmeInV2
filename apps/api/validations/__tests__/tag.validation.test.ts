import {
  ValidationTester,
  ValidData,
  ErrorValidationDataForCreationAndUpdate,
} from "./validate.test.helper.ts";

import {
  createTagValidation,
  deleteTagValidation,
  getTagsValidation,
  updateTagValidation,
} from "../index.ts";

const validationTester = new ValidationTester("tag");

const errorValidationData: ErrorValidationDataForCreationAndUpdate[] = [
  {
    description: "should have tag as required",
    body: { color: "#333" },
    errorIncludes: `Field "name" is required`,
  },
  {
    description: "should have color as required",
    body: { name: "validTag" },
    errorIncludes: `Field "color" is required`,
  },
  {
    description: "should not accept spaces in tags",
    body: { name: "invalid name", color: "#333" },
    errorIncludes: "can't have spaces",
  },
  {
    description: "should not accept special characters in tags",
    body: { name: "invalid-name", color: "#333" },
    errorIncludes: "can't have spaces or special character",
  },
];

const passingValidations: ValidData[] = [
  {
    description: "should need nothing on getting tags",
    schema: getTagsValidation,
  },
  {
    description: "should take id on deleting a tag",
    schema: deleteTagValidation,
    params: {
      id: "ea22f9203c4ea22fa21123c4",
    },
  },
];

validationTester.validateCreateAndUpdateErrors(
  errorValidationData,
  createTagValidation,
  updateTagValidation,
);
validationTester.testValidData(passingValidations);
