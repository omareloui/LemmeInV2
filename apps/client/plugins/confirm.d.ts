import { Confirm } from "./confirm.client";

declare module "#app" {
  interface NuxtApp {
    $confirm: Confirm;
  }
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $confirm: Confirm;
  }
}

export {};
