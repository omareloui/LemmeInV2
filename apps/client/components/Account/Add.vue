<script setup lang="ts">
import { AddAccount, AddAccountReceivedData } from "types";
import { useVaultStore } from "store/useVault.js";
import type { Structure } from "~~/components/Form/Generator.vue";

const props = withDefaults(defineProps<{ password?: string }>(), {
  password: "",
});

const emit = defineEmits<{ (e: "close-dialogue"): void }>();

const formFields: Structure = [
  {
    id: "app",
    fieldType: "Base",
    props: {
      modelValue: "",
      label: "App or Website",
      hint: "Facebook",
      focusOnMount: true,
    },
  },
  {
    id: "password",
    fieldType: "Password",
    props: {
      modelValue: props.password,
      default: props.password,
      noIcon: true,
      minLength: 3,
      hasOAuth: true,
      showPasswordStrength: true,
    },
  },
  {
    expandableFields: [
      "gap",
      {
        id: "accountIdentifier",
        fieldType: "Base",
        props: {
          modelValue: "",
          label: "Account identifier",
          placeholder: "email or username",
          notRequired: true,
        },
      },
      {
        id: "site",
        fieldType: "Base",
        props: {
          modelValue: "",
          label: "Link",
          hint: "https://google.com",
          notRequired: true,
          pattern:
            /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/,
          invalidPatternMessage: "The link has to be a valid url",
        },
      },
      {
        id: "tags",
        fieldType: "Tags",
        props: {
          modelValue: [],
          leftIcon: "",
          notRequired: true,
        },
      },
      {
        id: "note",
        fieldType: "Textarea",
        props: {
          label: "Note",
          modelValue: "",
          notRequired: true,
        },
      },
    ],
  },
];

async function addAccount(receivedOptions: unknown) {
  const { app, password, accountIdentifier, site, note, tags } =
    receivedOptions as AddAccountReceivedData;
  const options: AddAccount = {
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
    await vaultStore.addAccount(options);
    emit("close-dialogue");
  } catch (e) {
    const { $notify } = useNuxtApp();
    $notify.error(useErrorMessage(e));
  }
}
</script>

<template>
  <div class="add-account">
    <h2 class="add-account__heading">Add Account</h2>
    <FormGenerator
      :form-fields="formFields"
      submit-button-text="Save Account"
      :submit-function="addAccount"
    />
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.add-account
  +pa(55px 30px)

  +e(heading)
    +clr-txt(primary)
    +center-text
    +fnt-5xl
</style>
