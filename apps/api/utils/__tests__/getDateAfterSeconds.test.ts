import { Tester } from "../../helpers/index.ts";
import { getDateAfterSeconds } from "../index.ts";

const tester = new Tester("utils/getDateAfterSeconds:");

tester.test("should get the correct date after 100 seconds", () => {
  const currentDate = new Date();
  const dateToUpdate = new Date();
  const secsDelay = 100;
  const dateAfter100Secs = getDateAfterSeconds(secsDelay, dateToUpdate);

  tester.shouldEquals(
    Number(dateAfter100Secs) - Number(currentDate),
    secsDelay * 1000,
  );
});
