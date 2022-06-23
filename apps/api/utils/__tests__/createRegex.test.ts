import { Tester } from "../../helpers/index.ts";
import { createRegex } from "../index.ts";

const tester = new Tester("utils/creteRegex:");

tester.test("should create regex with no options", () => {
  const regex = createRegex("test");
  tester.shouldEquals(regex, /test/);
});

tester.test("should create regex with i and g options when provided", () => {
  const regex = createRegex("test", { i: true, g: true });
  tester.shouldEquals(regex, /test/gi);
});

tester.test("should create exact match regex if passed the option to", () => {
  const regex = createRegex("test", { exactMatch: true });
  tester.shouldEquals(regex, /^test$/);
});

tester.test(
  "should normalize the text if provided with regex symbols with the text",
  () => {
    const regex = createRegex("test^$/\\|()[]<>.+");
    tester.shouldEquals(regex, /test\^\$\/\\\|\(\)\[\]\<\>\.\+/);
  },
);
