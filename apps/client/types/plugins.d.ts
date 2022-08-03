import { Confirm } from "~~/plugins/confirm.client";
import { Notify } from "~~/plugins/notify.client";
import { Copy } from "~~/plugins/copy.client";
import { GetPasswordStrength } from "~~/plugins/getPasswordStrength";

import { CypherHelper } from "~~/plugins/cypher";
import { DayJS } from "~~/plugins/dayjs";
import { GeneratePbkdf2 } from "~~/plugins/generatePbkdf2";

declare module "#app" {
  interface NuxtApp {
    $notify: Notify;
    $copy: Copy;
    $confirm: Confirm;
    $cypher: InstanceType<CypherHelper>;
    $getPasswordStrength: GetPasswordStrength;
    $generatePbkdf2: GeneratePbkdf2;
    $dayjs: DayJS;
  }
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $notify: Notify;
    $copy: Copy;
    $confirm: Confirm;
    $cypher: InstanceType<CypherHelper>;
    $getPasswordStrength: GetPasswordStrength;
    $generatePbkdf2: GeneratePbkdf2;
    $dayjs: DayJS;
  }
}

export {};
