import { Confirm } from "~~/plugins/confirm.client";
import { Notify } from "~~/plugins/notify.client";
import { Copy } from "~~/plugins/copy.client";
import { GetPasswordStrength } from "~~/plugins/getPasswordStrength.client";
import { CypherHelper } from "~~/plugins/cypher.client";

declare module "#app" {
  interface NuxtApp {
    $notify: Notify;
    $copy: Copy;
    $confirm: Confirm;
    $cypher: InstanceType<CypherHelper>;
    $getPasswordStrength: GetPasswordStrength;
  }
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $notify: Notify;
    $copy: Copy;
    $confirm: Confirm;
    $cypher: InstanceType<CypherHelper>;
    $getPasswordStrength: GetPasswordStrength;
  }
}

export {};
