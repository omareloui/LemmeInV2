import { GetPasswordStrength } from "./getPasswordStrength.client";

declare module "#app" {
  interface NuxtApp {
    $getPasswordStrength: GetPasswordStrength;
  }
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $getPasswordStrength: GetPasswordStrength;
  }
}

export {};
