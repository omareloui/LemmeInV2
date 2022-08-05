<script setup lang="ts">
import { AddAccountReceivedData, UpdateAccount, Account } from "types";
import type { Structure } from "~~/components/Form/Generator.vue";
import { useVaultStore } from "~~/store/useVault.js";

const props = withDefaults(
  defineProps<{
    id: string;
    app: string;
    isNative: boolean;
    password: Account | string;
    accountIdentifier?: string;
    note?: string;
    site?: string;
    tags?: string[];
  }>(),
  {
    accountIdentifier: undefined,
    note: undefined,
    site: undefined,
    tags: undefined,
  },
);

const emit = defineEmits<{
  (e: "close-dialogue"): void;
  (e: "edit-account", value: Account): void;
}>();

const formFields: Structure = [
  {
    id: "app",
    fieldType: "Base",
    props: {
      modelValue: props.app,
      label: "App or Website",
      hint: "Facebook",
      focusOnMount: true,
    },
  },
  {
    id: "password",
    fieldType: "Password",
    props: {
      modelValue: (props.isNative
        ? props.password
        : (props.password as Account).id) as string,
      noIcon: true,
      minLength: 3,
      hasOAuth: true,
      showPasswordStrength: true,
      isOAuthDefault: !props.isNative,
    },
  },
  "gap",
  {
    id: "accountIdentifier",
    fieldType: "Base",
    props: {
      modelValue: props.accountIdentifier ?? "",
      label: "Account identifier",
      placeholder: "email or username",
      notRequired: true,
    },
  },
  {
    id: "site",
    fieldType: "Base",
    props: {
      modelValue: props.site ?? "",
      label: "Link",
      hint: "https://google.com",
      notRequired: true,
      pattern:
        // eslint-disable-next-line no-useless-escape
        /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/,
      invalidPatternMessage: "The link has to be a valid url",
    },
  },
  {
    id: "tags",
    fieldType: "Tags",
    props: {
      modelValue: props.tags || [],
      leftIcon: "",
      notRequired: true,
    },
  },
  {
    id: "note",
    fieldType: "Textarea",
    props: {
      label: "Note",
      modelValue: props.note ?? "",
      notRequired: true,
    },
  },
];

async function editAccount(receivedOptions: unknown) {
  const { app, password, accountIdentifier, site, note, tags } =
    receivedOptions as AddAccountReceivedData;
  const options: UpdateAccount = {
    id: props.id,
    app,
    password: password.value,
    isNative: password.isNative,
    accountIdentifier,
    site,
    note,
    tags,
  };
  try {
    const vaultStore = useVaultStore();
    const newAccount = await vaultStore.editAccount(options);
    emit("edit-account", newAccount);
    emit("close-dialogue");
  } catch (e) {
    const { $notify } = useNuxtApp();
    $notify.error(useErrorMessage(e));
  }
}
</script>

<template>
  <div class="edit-account">
    <h2 class="edit-account__heading">
      Update
      <span class="edit-password__heading-tag-name">“{{ app }}”</span>
      Account
    </h2>
    <FormGenerator
      :form-fields="formFields"
      submit-button-text="Update Account"
      :submit-function="editAccount"
    />
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.edit-account
  +pa(55px 30px)

  +e(heading)
    +clr-txt(primary)
    +center-text
    +fnt-5xl
    +mb(5px)

  +e(heading-tag-name)
    +break-word
</style>
