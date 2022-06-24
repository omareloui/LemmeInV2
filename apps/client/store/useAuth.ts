import Cookie from "cookie-universal";
import { defineStore, acceptHMRUpdate } from "pinia";

import createKey from "~~/assets/utils/createPBKDF2";

interface RegisterOptions {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface UpdateMeOptions extends Partial<RegisterOptions> {
  oldPassword?: string;
}

interface SignInOptions {
  email: string;
  password: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Token {
  token: string;
  expires: Date;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    AUTH_COOKIE_NAME: "auth",
    PBKDF2_COOKIE_NAME: "key",
    user: null as User | null,
    isSigned: false,
    pbk: null as string | null,
  }),

  getters: {},

  actions: {
    setUser(user: User | null) {
      this.user = user;
    },

    updateIsSigned(isSigned: boolean) {
      this.isSigned = isSigned;
    },

    setKey(key: string | null) {
      this.pbk = key;
    },

    getToken() {
      const cookies = Cookie();
      return cookies.get(this.AUTH_COOKIE_NAME);
    },

    getKeyFromCookie() {
      const cookies = Cookie();
      return cookies.get(this.PBKDF2_COOKIE_NAME);
    },

    getKey() {
      return this.pbk;
    },

    setToken(token: Token) {
      const cookies = Cookie();
      const expires =
        typeof token.expires === "string"
          ? new Date(token.expires)
          : token.expires;
      cookies.set(this.AUTH_COOKIE_NAME, token.token, {
        sameSite: "lax",
        path: "/",
        expires,
      });
    },

    setKeyToCookie({ key, expires }: { key: string; expires: Date }) {
      const cookies = Cookie();
      cookies.set(this.PBKDF2_COOKIE_NAME, key, {
        sameSite: "lax",
        path: "/",
        expires,
      });
    },

    removeToken() {
      const cookies = Cookie();
      cookies.remove(this.AUTH_COOKIE_NAME);
    },

    removeKeyCookie() {
      const cookies = Cookie();
      cookies.remove(this.PBKDF2_COOKIE_NAME);
    },

    setSignData({ user, token }: { user: User; token: Token }) {
      this.setToken(token);
      this.updateIsSigned(true);
      this.setUser(user);
    },

    async register(options: RegisterOptions) {
      const { data } = await this.$axios.post("/auth/register", options);
      const result = data as { user: User; token: Token };
      const router = useRouter();

      await this.setSignData(result);
      await this.createKey({
        password: options.password,
        expires: new Date(result.token.expires),
      });
      router.push("/");
    },

    async signin(options: SignInOptions) {
      const router = useRouter();
      const { data } = await this.$axios.post("/auth/login", options);
      const result = data as { user: User; token: Token };
      await this.setSignData(result);
      await this.createKey({
        password: options.password,
        expires: new Date(result.token.expires),
      });
      router.push("/");
      await this.app.$accessor.resources.load();
      router.push("/");
    },

    async updateMe({
      oldPassword,
      email,
      firstName,
      lastName,
      password,
    }: UpdateMeOptions) {
      const router = useRouter();
      const options: UpdateMeOptions = {};
      if (firstName) options.firstName = firstName;
      if (lastName) options.lastName = lastName;
      if (email) options.email = email;
      if (password && oldPassword) {
        options.password = password;
        options.oldPassword = oldPassword;
      }
      const { data: result } = await this.$axios.put("/me", options);
      this.setSignData(result);
      this.$notify.success("Update profile");
      router.push("/");
    },

    async setMe() {
      if (!(await this.getToken())) return;
      try {
        const { data: me } = await this.$axios.get("/me");
        this.setUser(me);
        this.updateIsSigned(true);
      } catch (e) {
        const router = useRouter();
        // @ts-ignore
        if (!e.response || e.response.data.status === 401) {
          this.signOut();
          router.push("/");
        }
      }
    },

    async setKeyFromCookie() {
      const key = await this.getKeyFromCookie();
      if (!key) return;
      this.setKey(key);
    },

    async signOut() {
      this.removeToken();
      await this.app.$accessor.resources.clear();
      this.setUser(null);
      this.updateIsSigned(false);
      this.removeKeyCookie();
      this.setKey(null);
    },

    async createKey({
      password,
      expires,
    }: {
      password: string;
      expires: Date;
    }) {
      const key = await createKey(password);
      this.setKeyToCookie({ key, expires });
      this.setKey(key);
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
