import { Tester } from "../../helpers/index.ts";
import { getDateBeforeSeconds } from "../index.ts";

const tester = new Tester("utils/getDateAfterSeconds:");

tester.test("should get the correct date after 100 seconds", () => {
  const currentDate = new Date();
  const dateToUpdate = new Date();
  const secsDelay = 100;
  const dateBefore100Secs = getDateBeforeSeconds(secsDelay, dateToUpdate);

  tester.shouldEquals(
    Number(currentDate) - Number(dateBefore100Secs),
    secsDelay * 1000,
  );
});
