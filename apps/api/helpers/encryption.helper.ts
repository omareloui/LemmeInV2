import { Aes256Cfb8 } from "../deps.ts";
import { config } from "../config/index.ts";
import {
  generateRandomText,
  convertUnit8ArrayToHex as convertToHex,
  convertHexToUnit8Array as convertToUnit8Array,
} from "../utils/index.ts";

const { encryptionSecret } = config;

export class EncryptionHelper {
  algorithm: typeof Aes256Cfb8;
  te: TextEncoder;
  td: TextDecoder;

  constructor() {
    this.algorithm = Aes256Cfb8;
    this.te = new TextEncoder();
    this.td = new TextDecoder();
  }

  encrypt(plainText: string): string {
    if (!encryptionSecret) throw new Error("No secret provided");
    const secret = this.te.encode(encryptionSecret);
    const iv = this.te.encode(generateRandomText());
    const encodedPassword = this.te.encode(plainText);

    const cypher = new this.algorithm(secret, iv);
    cypher.encrypt(encodedPassword);

    return `${convertToHex(iv)}.${convertToHex(encodedPassword)}`;
  }

  decrypt(encryption: string): string {
    const [ivHex, encryptionHex] = encryption.split(".");
    if (!encryptionSecret) throw new Error("No secret provided");
    const secret = this.te.encode(encryptionSecret);
    const iv = convertToUnit8Array(ivHex);
    const passwordUnit8Array = convertToUnit8Array(encryptionHex);

    const cypher = new this.algorithm(secret, iv);
    cypher.decrypt(passwordUnit8Array);
    const password = this.td.decode(passwordUnit8Array);
    return password;
  }
}
