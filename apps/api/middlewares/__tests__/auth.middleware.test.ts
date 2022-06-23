import { MiddlewareTester } from "./middleware.test.helper.ts";

import { auth } from "../index.ts";

import type { RouterContext } from "../../deps.ts";
import type { Right } from "../../@types/index.ts";

const middlewareTester = new MiddlewareTester("auth");

const userToken = await middlewareTester.getToken();
const adminToken = await middlewareTester.getToken("admin");

const notSignedContext = middlewareTester.mockContext();
const userContext = middlewareTester.mockContext({ authToken: userToken });
const adminContext = middlewareTester.mockContext({ authToken: adminToken });

const next = middlewareTester.mockNext();

interface ValidTests {
  description: string;
  context: RouterContext;
  right: Right;
}

interface ErrorTest extends ValidTests {
  errorIncludes?: string;
}

const validTests: ValidTests[] = [
  {
    description: "should pass admin context on user right",
    context: adminContext,
    right: "me",
  },
  {
    description: "should pass admin context on admin right",
    context: adminContext,
    right: "manageUsers",
  },
  {
    description: "should pass user context on user right",
    context: userContext,
    right: "me",
  },
];

const errorTests: ErrorTest[] = [
  {
    description: "should throw error on user right with not signed context",
    context: notSignedContext,
    right: "me",
    errorIncludes: "Invalid token",
  },
  {
    description: "should throw error on admin right with user context",
    context: userContext,
    right: "getUsers",
  },
];

validTests.forEach(({ description, context, right }) => {
  middlewareTester.test(description, async () => {
    await auth(right)(context, next);
  });
});

errorTests.forEach(({ description, context, right, errorIncludes }) => {
  middlewareTester.testAsyncError(
    description,
    async () => {
      await auth(right)(context, next);
    },
    errorIncludes || "Insufficient rights",
  );
});
