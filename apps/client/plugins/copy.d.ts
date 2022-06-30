import { Copy } from "./copy.client";

declare module "#app" {
  interface NuxtApp {
    $copy: Copy;
  }
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $copy: Copy;
  }
}

export {};
