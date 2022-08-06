<script setup lang="ts">
import { AddAccountReceivedData, UpdateAccount, Account } from "types";
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

const formData = reactive({
  app: props.app,
  password: (props.isNative
    ? props.password
    : (props.password as Account).id) as string,
  accountIdentifier: props.accountIdentifier ?? "",
  site: props.site ?? "",
  tags: props.tags || [],
  note: props.note ?? "",
});

const componentsHandler = useFormComponents();
const { addComponentRef } = componentsHandler;

const SITE_PATTERN =
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/;

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

    <FormWrapper
      submit-button-text="Update Account"
      :submit-function="editAccount"
      :components-handler="componentsHandler"
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
        can-generate-random
      />

      <div class="gap"></div>

      <InputBase
        :ref="addComponentRef"
        v-model="formData.accountIdentifier"
        identifier="accountIdentifier"
        label="Account identifier"
        placeholder="email or username"
        not-required
      />
      <InputBase
        :ref="addComponentRef"
        v-model="formData.site"
        identifier="site"
        label="Link"
        hint="https://google.com"
        not-required
        :pattern="SITE_PATTERN"
        invalid-pattern-message="The link has to be a valid url"
      />
      <InputTags
        :ref="addComponentRef"
        v-model="formData.tags"
        identifier="tags"
        left-icon=""
        not-required
      />
      <InputTextarea
        :ref="addComponentRef"
        v-model="formData.note"
        identifier="note"
        label="Note"
        not-required
      />
    </FormWrapper>
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
