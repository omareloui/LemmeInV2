import { Tester, HashHelper } from "../index.ts";

const tester = new Tester("helpers/hash:");

const textToHash = "someTextToHash";

tester.test("should hash and compare with true result", async () => {
  const hash = await HashHelper.hash(textToHash);
  const compareResult = await HashHelper.compare(textToHash, hash);
  tester.shouldEquals(compareResult, true);
});
