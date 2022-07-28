import Cookie from "cookie-universal";
import { defineStore, acceptHMRUpdate } from "pinia";

import type {
  RegisterOptions,
  UpdateMeOptions,
  SignInOptions,
  User,
  Token,
} from "~~/types";

import createKey from "~~/assets/utils/createPBKDF2";

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
      const cookie =
        useCookie(this.AUTH_COOKIE_NAME).value ||
        cookies.get(this.AUTH_COOKIE_NAME);
      return cookie;
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
      const { $fetchServer } = useNuxtApp();
      const result = (await $fetchServer.post("/auth/register", options)) as {
        user: User;
        token: Token;
      };
      const router = useRouter();

      await this.setSignData(result);
      // TODO:
      // await this.createKey({
      //   password: options.password,
      //   expires: new Date(result.token.expires),
      // });
      router.push("/");
    },

    async signin(options: SignInOptions) {
      const { $fetchServer } = useNuxtApp();
      const router = useRouter();
      const result = (await $fetchServer.post("/auth/login", options)) as {
        user: User;
        token: Token;
      };
      await this.setSignData(result);
      // TODO:
      // await this.createKey({
      //   password: options.password,
      //   expires: new Date(result.token.expires),
      // });
      router.push("/home");
      // TODO:
      // await this.app.$accessor.resources.load();
      // TODO:
      // router.push("/");
    },

    async updateMe({
      oldPassword,
      email,
      firstName,
      lastName,
      password,
    }: UpdateMeOptions) {
      const { $notify, $fetchServer } = useNuxtApp();
      const router = useRouter();
      const options: UpdateMeOptions = {};
      if (firstName) options.firstName = firstName;
      if (lastName) options.lastName = lastName;
      if (email) options.email = email;
      if (password && oldPassword) {
        options.password = password;
        options.oldPassword = oldPassword;
      }
      const result = (await $fetchServer.put("/me", options)) as {
        user: User;
        token: Token;
      };
      this.setSignData(result);
      $notify.success("Update profile");
      router.push("/");
    },

    async setMe() {
      const token = await this.getToken();
      if (!token) return;
      try {
        // FIXME:
        // const { $fetchServer } = useNuxtApp();
        // const { $fetchServer } = this.$nuxt;
        // const me = (await $fetchServer.get("/me")) as User;
        const me = (await $fetch("http://localhost:8000/me", {
          headers: { authorization: `Bearer ${token}` },
        })) as User;
        this.setUser(me);
        this.updateIsSigned(true);
      } catch (e) {
        const router = useRouter();
        // @ts-ignore
        if (!e.response || e.response.status === 401) {
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

    signOut() {
      this.removeToken();
      // TODO:
      // await this.app.$accessor.resources.clear();
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
