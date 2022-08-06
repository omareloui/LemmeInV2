<script setup lang="ts">
import type { InputCheckOption } from "types";

const generatedPassword = ref("");
const length = ref(16);
const selectedCheckboxes = ref<string[]>([]);
const checkBoxes: InputCheckOption[] = reactive([
  { id: "upper", value: "capital case letters", isChecked: true },
  { id: "lower", value: "lower case letters", isChecked: true },
  { id: "numbers", value: "numbers", isChecked: true },
  { id: "symbols", value: "symbols", isChecked: true },
]);

const emit = defineEmits<{
  (e: "save-password", value: string): void;
}>();

function getCheckboxValue(
  checkboxId: "lower" | "upper" | "numbers" | "symbols",
) {
  const checkBox = checkBoxes.find(x => x.id === checkboxId);
  return !!checkBox?.isChecked;
}

const minLength = computed(() => {
  let len = 0;
  if (getCheckboxValue("lower")) len += 1;
  if (getCheckboxValue("upper")) len += 1;
  if (getCheckboxValue("numbers")) len += 1;
  if (getCheckboxValue("symbols")) len += 1;
  return len;
});

function generate() {
  const { $notify } = useNuxtApp();

  try {
    const password = usePasswordGenerator({
      includeLowerCase: getCheckboxValue("lower"),
      includeUpperCase: getCheckboxValue("upper"),
      includeNumbers: getCheckboxValue("numbers"),
      includeSymbols: getCheckboxValue("symbols"),
      length: length.value,
    });
    generatedPassword.value = password;
  } catch (e) {
    $notify.error(useErrorMessage(e));
  }
}

function savePassword() {
  emit("save-password", generatedPassword.value);
}

generate();
</script>

<template>
  <div class="password-generator">
    <div class="password-generator__generated-password-container">
      <ButtonBase class="regenerate" @click="generate">
        <Icon name="Reload" size="75%" />
      </ButtonBase>

      <div class="generated-password">
        {{ generatedPassword }}
      </div>

      <ButtonMain class="copy-button" large @click="$copy(generatedPassword)">
        copy
      </ButtonMain>
    </div>

    <div class="password-generator__options">
      <InputRange
        v-model="length"
        identifier="passwordLength"
        :min="minLength"
        :max="84"
        @update:modelValue="generate"
      />
      <InputCheck
        v-model="selectedCheckboxes"
        :options="checkBoxes"
        not-required
        must-have-one-at-least
        @update:modelValue="generate"
      />
    </div>

    <div class="password-generator__save">
      <ButtonMain cta block large @click="savePassword"
        >Save Password</ButtonMain
      >
    </div>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.password-generator
  +pos-r
  +py(55px)

  +e(generated-password-container)
    +pos-r
    +clr-bg(secondary)
    +px(5%)
    +py(35px)
    +ma(auto)
    +mb(45px)
    +br-md
    +w(85%)
    +lt-mobile
      +w(max(60%, 250px))

    .generated-password
      +fnt-xl
      +my(auto)
      +mb(20px)
      +center-text
      +no-wrap
      +w(max 100%)
      +no-scroll
      overflow: auto hidden

    .regenerate
      +pos-a(top 10px right 15px)
      +size(clamp(30px, 3vw, 35px))
      +br-cr
      :deep(i)
        +center

    .copy-button
      +ma(auto)
      +block

  +e(options)
    :deep
      .checker-wrapper
        +mx(auto)
        max-width: 500px
        +e(options)
          grid-template-columns: repeat(2, 1fr)
          +lt-mobile
            grid-template-columns: repeat(4, 1fr)
    :deep
      .input-range-container
        +mx(auto)

  +e(save)
    +mx(15px)
    +mt(15px)
    overflow: hidden
    +lt-mobile
      +mx(50px)
</style>
