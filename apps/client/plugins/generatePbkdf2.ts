import { PBKDF2 } from "crypto-js";

export type GeneratePbkdf2 = (password: string) => string;

function generate(password: string): string {
  const iterations = 5000;
  const salt = "";
  const length = 32;
  const key = PBKDF2(password, salt, { iterations, keySize: length });
  return key.toString();
}

export default defineNuxtPlugin(() => ({
  provide: {
    generatePbkdf2: generate,
  },
}));
