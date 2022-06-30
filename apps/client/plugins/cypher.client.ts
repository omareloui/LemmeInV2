import CryptoJS from "crypto-js";
import { useAuthStore } from "~~/store/useAuth";

export class CypherHelper {
  // eslint-disable-next-line no-useless-constructor
  constructor(private getKey: () => Promise<string | null>) {}

  async encrypt(content: string) {
    const { getKey } = this;
    const key = await getKey();
    if (!key) throw new Error("No key provided");
    return CryptoJS.AES.encrypt(content, key).toString();
  }

  async decrypt(encryption: string) {
    const { getKey } = this;
    const key = await getKey();
    if (!key) throw new Error("No key provided");
    const decryptedBytes = CryptoJS.AES.decrypt(encryption, key);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
  }
}

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  const cypher = new CypherHelper(
    authStore.getKey as unknown as () => Promise<string | null>,
  );

  return {
    provide: {
      cypher,
    },
  };
});
