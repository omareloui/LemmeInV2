import { Tester } from "../../helpers/index.ts";
import { convertUnit8ArrayToHex } from "../index.ts";

const tester = new Tester("utils/convertUnit8ArrayToHex:");

tester.test("should convert from unit 8 array to hex correctly", () => {
  const hex = convertUnit8ArrayToHex(
    new Uint8Array([18, 52, 86, 171, 205, 239]),
  );
  tester.shouldEquals(hex, "123456abcdef");
});
