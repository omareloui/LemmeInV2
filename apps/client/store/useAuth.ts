import Cookie from "cookie-universal";
import { defineStore, acceptHMRUpdate } from "pinia";

import {
  useCookie,
  useRouter,
  useServerFetch,
  useErrorParsers,
} from "#imports";

// eslint-disable-next-line import/no-cycle
import { useResourcesStore } from "~~/store/useResources";

import generateKey from "~~/assets/utils/createPBKDF2";

import type {
  RegisterOptions,
  UpdateMeOptions,
  SignInOptions,
  User,
  Token,
} from "~~/types";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    AUTH_COOKIE_NAME: "auth",
    PBKDF2_COOKIE_NAME: "key",
    user: null as User | null,
    pbk: null as string | null,
  }),

  getters: {
    isSigned: state => !!state.user,
  },

  actions: {
    setUser(user: User | null) {
      this.user = user;
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
      this.setUser(user);
    },

    async register(options: RegisterOptions) {
      const result = (await useServerFetch("/auth/register", {
        method: "POST",
        body: {
          options,
        },
      })) as {
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
      const router = useRouter();
      const result = (await useServerFetch("/auth/login", {
        method: "POST",
        body: options,
      })) as {
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
      useResourcesStore().load();
    },

    async updateMe({
      oldPassword,
      email,
      firstName,
      lastName,
      password,
    }: UpdateMeOptions) {
      const { $notify } = useNuxtApp();
      const router = useRouter();
      const options: UpdateMeOptions = {};
      if (firstName) options.firstName = firstName;
      if (lastName) options.lastName = lastName;
      if (email) options.email = email;
      if (password && oldPassword) {
        options.password = password;
        options.oldPassword = oldPassword;
      }
      const result = (await useServerFetch("/me", {
        method: "PUT",
        body: options,
      })) as {
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
        // const me = (await useServerFetch("/me")) as User;
        const me = (await $fetch("http://localhost:8000/me", {
          headers: { authorization: `Bearer ${token}` },
        })) as User;

        this.setUser(me);
      } catch (e) {
        const err = useErrorParsers(e);

        // eslint-disable-next-line curly
        if (err.name === "FetchError") {
          // FIXME:
          // const router = useRouter();
          this.signOut();
          // router.push("/");
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
      useResourcesStore().clear();
      this.setUser(null);
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
      const key = await generateKey(password);
      this.setKeyToCookie({ key, expires });
      this.setKey(key);
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
