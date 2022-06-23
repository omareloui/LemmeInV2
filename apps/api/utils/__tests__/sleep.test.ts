import { Tester } from "../../helpers/index.ts";
import { sleep } from "../index.ts";

const tester = new Tester("utils/sleep:");

tester.test("should sleep 1 second", async () => {
  const delay = 1;
  const currentDate = new Date();
  await sleep(delay);
  const dateAfter = new Date();
  tester.shouldEquals(
    Math.floor((Number(dateAfter) - Number(currentDate)) / 1000),
    delay,
  );
});
