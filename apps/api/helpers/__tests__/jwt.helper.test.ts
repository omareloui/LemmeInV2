import { Tester, JwtHelper } from "../index.ts";
import { sleep } from "../../utils/index.ts";

const tester = new Tester("helpers/jwt:");

tester.test("should create a token", async () => {
  const token = await JwtHelper.create(100, { id: "2a2fec4798" });
  tester.shouldEquals(token.split(".").length, 3);
});

tester.test("should verifying a token and return true", async () => {
  const token = await JwtHelper.create(100);
  const validationResult = await JwtHelper.verify(token);
  tester.shouldEquals(validationResult, true);
});

tester.test("should return false on verifying invalid token", async () => {
  const token = await JwtHelper.create(100);
  const invalidatedToken = token.replace(/a/g, "b");
  const validationResult = await JwtHelper.verify(invalidatedToken);
  tester.shouldEquals(validationResult, false);
});

tester.test(
  "should return false on verifying after the expiration date is exceeded",
  async () => {
    const token = await JwtHelper.create(1);
    const validationResultBefore = await JwtHelper.verify(token);
    tester.shouldEquals(validationResultBefore, true);
    await sleep(3);
    const validationResultAfter = await JwtHelper.verify(token);
    tester.shouldEquals(validationResultAfter, false);
  },
);

tester.test("should get the payload as it was", async () => {
  const userId = "1e201324ffc09ac";
  const token = await JwtHelper.create(10, { id: userId });
  const tokenPayload = await JwtHelper.getPayload(token);
  tester.shouldEquals(tokenPayload.id, userId);
});
