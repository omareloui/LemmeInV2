import { ServiceTester } from "./service.test.helper.ts";
import { generateRandomText } from "../../utils/index.ts";

import { AuthService } from "../index.ts";

const serviceTester = new ServiceTester("auth", AuthService);

const randomText = generateRandomText(8);
const logData = {
  email: `${randomText}@hotmail.com`,
  password: "12345678",
};

serviceTester.test("should register user fine and get a token", async () => {
  const { token, user } = await AuthService.register({
    firstName: "omar",
    lastName: "eloui",
    ...logData,
  });
  serviceTester.shouldHaveProperty(token, "token");
  // deno-lint-ignore no-explicit-any
  serviceTester.shouldHaveProperty(user as any, "id");
});

serviceTester.test("should login the user fine and get a token", async () => {
  const { token, user } = await AuthService.login(logData);
  serviceTester.shouldHaveProperty(token, "token");
  // deno-lint-ignore no-explicit-any
  serviceTester.shouldHaveProperty(user as any, "id");
});

serviceTester.testAsyncError(
  "should throw error if provided email that doesn't exist",
  async () => {
    await AuthService.login({
      email: `${generateRandomText(9)}@gmail.com`,
      password: "13245678",
    });
  },
  "email or password is not correct",
);

serviceTester.testAsyncError(
  "should throw error if provided invalid password",
  async () => {
    await AuthService.login({
      email: logData.email,
      password: "no_valid_pass",
    });
  },
  "email or password is not correct",
);
