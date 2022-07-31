import CryptoJS from "crypto-js";
import { useAuthStore } from "~~/store/useAuth";

export class CypherHelper {
  static encrypt(content: string) {
    const authStore = useAuthStore();
    if (!authStore.isSigned) return undefined;
    const key = authStore.getKeyFromCookie();
    if (!key) throw new Error("No key provided");
    return CryptoJS.AES.encrypt(content, key).toString();
  }

  static decrypt(encryption: string) {
    const authStore = useAuthStore();
    if (!authStore.isSigned) return undefined;
    const key = authStore.getKeyFromCookie();
    if (!key) throw new Error("No key provided");
    const decryptedBytes = CryptoJS.AES.decrypt(encryption, key);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
  }
}

export default defineNuxtPlugin(() => ({
  provide: {
    cypher: CypherHelper,
  },
}));
