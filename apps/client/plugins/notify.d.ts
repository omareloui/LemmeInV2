import { Notify } from "./notify.client";

declare module "#app" {
  interface NuxtApp {
    $notify: Notify;
  }
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $notify: Notify;
  }
}

export {};
