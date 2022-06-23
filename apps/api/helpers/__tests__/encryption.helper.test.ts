import { Tester, EncryptionHelper } from "../index.ts";

const tester = new Tester("helpers/encryption:");
const HEX_REGEX = /^[\da-fA-F]+$/;

const textToEncrypt = "testing the thing";

tester.test("encrypt and decrypt a text", () => {
  const encryptionHelper = new EncryptionHelper();
  const encryption = encryptionHelper.encrypt(textToEncrypt);
  const plainText = encryptionHelper.decrypt(encryption);
  tester.shouldEquals(plainText, textToEncrypt);
});

tester.test(
  "should have iv and the encryption on received data from encryption",
  () => {
    const encryptionHelper = new EncryptionHelper();
    const encryptionData = encryptionHelper.encrypt(textToEncrypt);
    const [iv, encryption] = encryptionData.split(".");
    tester.shouldMatch(iv, HEX_REGEX);
    tester.shouldMatch(encryption, HEX_REGEX);
  },
);

tester.test("should have iv with 32 of length", () => {
  const encryptionHelper = new EncryptionHelper();
  const encryptionData = encryptionHelper.encrypt(textToEncrypt);
  const [iv, _encryption] = encryptionData.split(".");
  tester.shouldEquals(iv.length, 32);
});
