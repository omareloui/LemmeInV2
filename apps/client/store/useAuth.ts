import Cookie from "cookie-universal";
import { defineStore, acceptHMRUpdate } from "pinia";

import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "utils/constants";
import getSecondsFromString from "utils/getSecondsFromString";
import { useResourcesStore } from "store/useResources";

import { useTokenedFetch } from "~~/composables/useTokenedFetch";

import type {
  RegisterOptions,
  UpdateMeOptions,
  SignInOptions,
  Token,
  AuthenticationPayload,
  AccessTokenContent,
} from "~~/types";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as AccessTokenContent | null,
    pbk: null as string | null,
  }),

  getters: {
    isSigned: state => !!state.user,
  },

  actions: {
    async register(options: RegisterOptions) {
      const { accessToken, refreshToken, user } = (await useTokenedFetch(
        "/api/auth/register",
        { method: "POST", body: options },
      )) as AuthenticationPayload;
      const router = useRouter();
      this.setTokens(accessToken, refreshToken);
      this.user = user;
      await this.createPBKDF2(options.password);
      router.push("/home");
    },

    async signin(options: SignInOptions) {
      const { $notify } = useNuxtApp();
      const router = useRouter();
      const { accessToken, refreshToken, user } = (await useTokenedFetch(
        "/api/auth/login",
        {
          method: "POST",
          body: options,
        },
      )) as AuthenticationPayload;
      this.setTokens(accessToken, refreshToken);
      this.user = user;
      await this.createPBKDF2(options.password);
      router.push("/home");
      $notify.info("Analyzing accounts...");
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
      const { accessToken, refreshToken, user } = (await useTokenedFetch(
        "/api/me",
        {
          method: "PUT",
          body: options,
        },
      )) as AuthenticationPayload;
      this.setTokens(accessToken, refreshToken);
      this.user = user;
      $notify.success("Update profile");
      router.push("/");
    },

    async createPBKDF2(password: string) {
      const { $notify } = useNuxtApp();
      try {
        const { $generatePbkdf2 } = useNuxtApp();
        const key = await $generatePbkdf2(password);
        this.pbk = key;
      } catch (e) {
        $notify.error(useErrorMessage(e));
      }
    },

    setTokens(accessToken: Token, refreshToken: Token) {
      const cookies = Cookie();
      cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken.body, {
        path: "/",
        maxAge: getSecondsFromString(accessToken.expiration as string) - 2,
      });
      cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken.body, {
        path: "/",
        maxAge: getSecondsFromString(refreshToken.expiration as string),
      });
    },

    removeCookies() {
      const cookies = Cookie();
      [ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME].forEach(x =>
        cookies.remove(x),
      );
    },

    async signout() {
      navigateTo("/");
      await nextTick();
      this.removeCookies();
      this.pbk = null;
      this.user = null;
      useResourcesStore().clear();
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
