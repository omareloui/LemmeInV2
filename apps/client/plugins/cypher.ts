import CryptoJS from "crypto-js";
import { useAuthStore } from "~~/store/useAuth";

export class CypherHelper {
  private key?: string;

  constructor() {
    this.getKey();
  }

  getKey() {
    const authStore = useAuthStore();
    const key = authStore.getKeyFromCookie();
    this.key = key;
    return key;
  }

  encrypt(content: string) {
    const authStore = useAuthStore();
    if (!authStore.isSigned) return undefined;
    const key = this.key || this.getKey();
    if (!key) throw new Error("No key provided");
    return CryptoJS.AES.encrypt(content, key).toString();
  }

  decrypt(encryption: string) {
    const authStore = useAuthStore();
    if (!authStore.isSigned) return undefined;
    const key = this.key || this.getKey();
    if (!key) throw new Error("No key provided");
    const decryptedBytes = CryptoJS.AES.decrypt(encryption, key);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
  }
}

export default defineNuxtPlugin(() => ({
  provide: {
    cypher: new CypherHelper(),
  },
}));
