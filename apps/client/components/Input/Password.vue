<script setup lang="ts">
import type { ClientAccount as Acc } from "types";

import { useVaultStore } from "~~/store/useVault";
import InputBase from "./Base.vue";
import InputSelect from "./Select.vue";

type Account = Acc<"Native" | "OAuthed">;

const vaultStore = useVaultStore();
const inputRef = ref<
  InstanceType<typeof InputBase> | InstanceType<typeof InputSelect> | null
>(null);

const props = withDefaults(
  defineProps<{
    modelValue: string;
    identifier?: string;
    name?: string;
    placeholder?: string;
    hint?: string;
    label?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    invalidPatternMessage?: string;
    notRequired?: boolean;
    noAutoComplete?: boolean;
    focusOnMount?: boolean;
    noIcon?: boolean;
    hasOAuth?: boolean;
    showPasswordStrength?: boolean;
    isOAuthDefault?: boolean;
    canGenerateRandom?: boolean;
  }>(),
  {
    identifier: "password",
    placeholder: "***********",
    label: "Password",
    minLength: 8,
    maxLength: 150,
    notRequired: false,
    noAutoComplete: false,
    focusOnMount: false,
    noIcon: false,
    hasOAuth: false,
    canGenerateRandom: false,
    showPasswordStrength: false,
    isOAuthDefault: false,
    name: undefined,
    hint: undefined,
    pattern: undefined,
    invalidPatternMessage: undefined,
  },
);

const emit = defineEmits<{ (e: "update:modelValue", value: unknown): void }>();

const content = useModelWrapper(props, emit);

const isShown = ref(false);
const isNative = ref(!props.isOAuthDefault);
const tempPassword = ref("");

const errorMessage = computed(() => inputRef.value?.errorMessage || "");
const isErred = computed(() => !!errorMessage);
const hasOtherPasswords = computed(() => vaultStore.accounts.length > 0);
const shownIcon = computed(() => (isShown.value ? "EyeClosed" : "Eye"));

const selectOptions =
  vaultStore.accounts.map(a => {
    const r = a as Account & { id: string };
    r.id = r._id;
    return r;
  }) || [];

function generate() {
  content.value = usePasswordGenerator();
}

function toggleShown() {
  isShown.value = !isShown.value;
}

function validate() {
  inputRef.value?.validate();
}

function clearInput() {
  content.value = "";
}

function clearError() {
  inputRef.value?.clearError();
}

function storeAndRestorePassword() {
  const temp = tempPassword.value;
  tempPassword.value = content.value;
  content.value = temp;
}

async function toggleOAuth() {
  storeAndRestorePassword();
  isNative.value = !isNative.value;
  await nextTick();
  clearError();
}

defineExpose({
  identifier: props.identifier,
  hasOAuth: props.hasOAuth,
  isNative,
  clearInput,
  toggleOAuth,
  validate,
  errorMessage,
});
</script>

<template>
  <div
    class="input-password"
    :class="{
      'input-password--has-oauth': hasOAuth && hasOtherPasswords,
      'input-password--has-error': isErred,
    }"
  >
    <Transition name="fade" mode="out-in">
      <InputBase
        v-if="isNative"
        ref="inputRef"
        v-model="content"
        class="input-password__text"
        v-bind="{
          identifier,
          placeholder,
          hint,
          label,
          minLength,
          maxLength,
          notRequired,
          pattern,
          noAutoComplete,
          focusOnMount,
          invalidPatternMessage,
        }"
        :name="name || identifier"
        :type="!isShown ? 'password' : 'text'"
        :left-icon="noIcon ? undefined : 'Key'"
        :right-icon="!canGenerateRandom ? shownIcon : 'GenerateInput'"
        :second-right-icon="!canGenerateRandom ? undefined : shownIcon"
        is-right-icon-clickable
        :is-second-icon-clickable="canGenerateRandom"
        @right-icon-click="canGenerateRandom ? generate() : toggleShown()"
        @second-right-icon-click="canGenerateRandom ? toggleShown() : undefined"
      />

      <InputSelect
        v-else
        ref="inputRef"
        v-model="content"
        class="input-password__select"
        label="OAuth password"
        :identifier="identifier"
        primary-key="app"
        default-button-text="Select a password"
        :options="selectOptions"
        is-searchable
      />
    </Transition>

    <Transition name="fade">
      <PasswordStrength
        v-if="showPasswordStrength && isNative"
        class="input-password__strength"
        line-height="10px"
        hide-score-text
        :decrypted-password="modelValue"
      />
    </Transition>

    <ButtonBase
      v-if="hasOAuth && hasOtherPasswords"
      class="input-password__oauth-button"
      @click="toggleOAuth"
    >
      {{ !isNative ? "Insert password?" : "Connect with another account?" }}
    </ButtonBase>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.input-password
  +pos-r

  +m(has-oauth)
    +mb(34px)

  +m(has-error)
    +e(input-password, strength)
      +mt(30px)

  +e(oauth-button)
    +center-h
    bottom: -6px
    transform: translate(-50%, 100%)
    opacity: 0.8
    +w(max-content)
    +fnt-sm
    +br-md

  +e(strength)
    +my(10px)
</style>
