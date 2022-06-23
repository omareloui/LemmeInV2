import { yup, RouterContext } from "../../deps.ts";
import { MiddlewareTester } from "./middleware.test.helper.ts";

import { validate } from "../index.ts";

const middlewareTester = new MiddlewareTester("validate");

const next = middlewareTester.mockNext();

interface ValidTests {
  description: string;
  context: RouterContext;
  schema: Record<string, unknown>;
}

interface ErrorTest extends ValidTests {
  errorIncludes: string;
}

const validTests: ValidTests[] = [
  {
    description:
      "should pass with providing the exact needed values to the body",
    schema: {
      body: yup.object({
        name: yup.string().min(1).max(255).trim().required(`name is required`),
      }),
    },
    context: middlewareTester.mockContext({ body: { name: "test" } }),
  },
  {
    description:
      "should pass with providing the exact needed values to the params",
    schema: {
      params: yup.object({
        name: yup.string().min(1).max(255).trim().required(`name is required`),
      }),
    },
    context: middlewareTester.mockContext({ params: { name: "test" } }),
  },
];

const errorTests: ErrorTest[] = [
  {
    description: "should throw error on providing data that was not requested",
    schema: {
      body: yup.object({
        name: yup.string().min(1).max(255).trim().required(`name is required`),
      }),
    },
    context: middlewareTester.mockContext({
      body: { name: "no", notNeeded: true },
    }),
    errorIncludes: "notNeeded is not allowed",
  },
  {
    description: "should throw error on not providing the needed data",
    schema: {
      body: yup.object({
        name: yup.string().min(1).max(255).trim().required(`name is required`),
      }),
    },
    context: middlewareTester.mockContext({ body: {} }),
    errorIncludes: "name is required",
  },
];

validTests.forEach(({ description, context, schema }) => {
  middlewareTester.test(description, async () => {
    await validate(schema)(context, next);
  });
});

errorTests.forEach(({ description, context, schema, errorIncludes }) => {
  middlewareTester.testAsyncError(
    description,
    async () => {
      await validate(schema)(context, next);
    },
    errorIncludes,
  );
});
