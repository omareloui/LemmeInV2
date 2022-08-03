import CryptoJS from "crypto-js";
import { useAuthStore } from "~~/store/useAuth";

export class CypherHelper {
  private key: string;

  constructor() {
    const authStore = useAuthStore();
    this.key = authStore.getKeyFromCookie();
  }

  encrypt(content: string) {
    const authStore = useAuthStore();
    if (!authStore.isSigned) return undefined;
    if (!this.key) throw new Error("No key provided");
    return CryptoJS.AES.encrypt(content, this.key).toString();
  }

  decrypt(encryption: string) {
    const authStore = useAuthStore();
    if (!authStore.isSigned) return undefined;
    if (!this.key) throw new Error("No key provided");
    const decryptedBytes = CryptoJS.AES.decrypt(encryption, this.key);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
  }
}

export default defineNuxtPlugin(() => ({
  provide: {
    cypher: new CypherHelper(),
  },
}));
