import { Tester } from "../../helpers/index.ts";
import { convertHexToUnit8Array } from "../index.ts";

const tester = new Tester("utils/convertHexToUnit8Array:");

tester.testError(
  "should throw error on providing invalid hex with wrong hex values",
  () => convertHexToUnit8Array("22ss45ff"),
  "not valid hex",
);

tester.testError(
  "should throw error on providing invalid hex with odd number length",
  () => convertHexToUnit8Array("111"),
  "not valid hex",
);

tester.test("should convert from hex to unit 8 array correctly", () => {
  const unit8 = convertHexToUnit8Array("123456abcdef");
  tester.shouldEquals(unit8, new Uint8Array([18, 52, 86, 171, 205, 239]));
});
