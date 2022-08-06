<script setup lang="ts">
import { AddAccount, AddAccountReceivedData } from "types";
import { useVaultStore } from "store/useVault.js";

const props = withDefaults(defineProps<{ password?: string }>(), {
  password: "",
});

const emit = defineEmits<{ (e: "close-dialogue"): void }>();

const formData = reactive({
  app: "",
  password: props.password || "",
  accountIdentifier: "",
  site: "",
  tags: [],
  note: "",
});

const inputHandler = useFormComponents();
const { addComponentRef, addExtendedComponentRef } = inputHandler;

const SITE_PATTERN =
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/;

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
    <FormWrapper
      submit-button-text="Save Account"
      :submit-function="addAccount"
      :components-handler="inputHandler"
      is-expandable
    >
      <InputBase
        :ref="addComponentRef"
        v-model="formData.app"
        identifier="app"
        label="App or Website"
        hint="Facebook"
        focus-on-mount
      />
      <InputPassword
        :ref="addComponentRef"
        v-model="formData.password"
        identifier="password"
        no-icon
        :min-length="3"
        has-o-auth
        show-password-strength
      />

      <template #expandable>
        <div class="gap"></div>
        <InputBase
          :ref="addExtendedComponentRef"
          v-model="formData.accountIdentifier"
          identifier="accountIdentifier"
          label="Account identifier"
          placeholder="email or username"
          not-required
        />
        <InputBase
          :ref="addExtendedComponentRef"
          v-model="formData.site"
          identifier="site"
          label="Link"
          hint="https://google.com"
          not-required
          :pattern="SITE_PATTERN"
          invalid-pattern-message="The link has to be a valid url"
        />
        <InputTags
          :ref="addExtendedComponentRef"
          v-model="formData.tags"
          identifier="tags"
          left-icon=""
          not-required
        />
        <InputTextarea
          :ref="addExtendedComponentRef"
          v-model="formData.note"
          identifier="note"
          label="Note"
          not-required
        />
      </template>
    </FormWrapper>
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
