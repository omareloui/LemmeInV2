import {
  ValidationTester,
  ValidData,
  ErrorValidationDataForCreationAndUpdate,
} from "./validate.test.helper.ts";

import {
  getNotesValidation,
  createNoteValidation,
  updateNoteValidation,
  deleteNoteValidation,
} from "../index.ts";

const validationTester = new ValidationTester("note");

const errorValidationData: ErrorValidationDataForCreationAndUpdate[] = [
  {
    description:
      "should throw error on providing extra field on creating and updating note",
    body: {
      title: "some note",
      body: "and that's the note body",
      notValidField: false,
    },
    errorIncludes: "notValidField is not allowed",
  },
];

const passingValidations: ValidData[] = [
  {
    description: "should pass on providing only title on creating note",
    schema: createNoteValidation,
    body: { title: "title" },
  },
  {
    description: "should pass on providing only body on creating note",
    schema: createNoteValidation,
    body: { body: "body" },
  },
  {
    description: "should accept tags on creating a note with valid ids",
    schema: createNoteValidation,
    body: {
      tags: ["01234567890123456789abcd"],
    },
  },
  {
    description: "should take nothing on requesting all notes",
    schema: getNotesValidation,
  },
  {
    description: "should take id for deleting note",
    schema: deleteNoteValidation,
    params: { id: "ea22f9203c4ea22fa21123c4" },
  },
];

validationTester.validateCreateAndUpdateErrors(
  errorValidationData,
  createNoteValidation,
  updateNoteValidation,
);
validationTester.testValidData(passingValidations);
