import { CypherHelper } from "./cypher.client";

declare module "#app" {
  interface NuxtApp {
    $cypher: InstanceType<CypherHelper>;
  }
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $cypher: InstanceType<CypherHelper>;
  }
}

export {};
