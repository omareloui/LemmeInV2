<script setup lang="ts">
import InputBase from "./Base.vue";

const inputRef = ref<InstanceType<typeof InputBase> | null>(null);

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

const errorMessage = computed(() => inputRef.value?.errorMessage);
const isErred = computed(() => !!errorMessage);
// FIXME: return this.$accessor.vault.accounts.length > 0
const hasOtherPasswords = computed(() => false);

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

function toggleOAuth() {
  storeAndRestorePassword();
  isNative.value = !isNative.value;
  clearError();
}

defineExpose({
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
    <transition name="fade" mode="out-in">
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
        :left-icon="noIcon ? undefined : 'key'"
        :right-icon="isShown ? 'eye-closed' : 'eye'"
        is-right-icon-clickable
        @right-icon-click="isShown = !isShown"
      />

      <!-- <input-select
        v-if="!isNative && hasOtherPasswords"
        ref="input"
        class="input-password__select"
        label="OAuth password"
        v-bind="{ identifier, value }"
        @input="onInput"
        primary-key="app"
        defaultButtonText="Select a password"
        :options="$accessor.vault.accounts"
        is-searchable
      /> -->
    </transition>

    <!-- <transition name="fade">
      <password-strength
        v-if="showPasswordStrength && isNative"
        class="input-password__strength"
        line-height="10px"
        hide-score-text
        :decrypted-password="value"
      />
    </transition> -->

    <!-- <button-base
      v-if="hasOAuth && hasOtherPasswords"
      class="input-password__oauth-button"
      @click="toggleOAuth"
    >
      {{ !isNative ? "Insert password?" : "Connect with another account?" }}
    </button-base> -->
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
