import { Tester } from "../../helpers/index.ts";
import { yup } from "../../deps.ts";
import { requiredId } from "../index.ts";

const tester = new Tester("utils/checkIfMongoId:");

interface ErrorValidationData {
  description: string;
  id: string;
  errorIncludes: string;
}

const errorValidationData: ErrorValidationData[] = [
  {
    description:
      "should throw error if string shorter than 24 characters is provided",
    id: "ab3ca91c2f7c2",
    errorIncludes: "must be exactly 24",
  },
  {
    description:
      "should throw error if string larger than 24 characters is provided",
    id: "aab3ca91c2f7c2ab3ca91c2f7c2ab3ca91c2f7c2ab3ca91c2f7c7c2",
    errorIncludes: "must be exactly 24",
  },
  {
    description: "should throw error if not hex code",
    id: "ax3ca12572b0a3ca91c2f7c2",
    errorIncludes: "has to be valid id",
  },
];

tester.test("should not throw error if valid mongo id provided", async () => {
  const validId = "ab3ca12572b0a3ca91c2f7c2";
  await yup.object({ id: requiredId }).validate({ id: validId });
  tester.shouldEquals(true, true);
});

errorValidationData.forEach(x =>
  tester.testAsyncError(
    x.description,
    async () => {
      await yup.object({ id: requiredId }).validate({ id: x.id });
    },
    x.errorIncludes,
  ),
);
