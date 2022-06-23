import { Tester } from "../../helpers/index.ts";
import { capitalize } from "../index.ts";

const tester = new Tester("utils/capitalize");

tester.test("should work", () => {
  const string = "hello, world!";
  const capitalizedString = capitalize(string);
  tester.shouldEquals(capitalizedString, "Hello, World!");
});
