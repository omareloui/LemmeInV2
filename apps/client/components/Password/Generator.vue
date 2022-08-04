<script setup lang="ts">
import type { InputCheckOption } from "types";

const characters = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: ".!@#$%^&",
};

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

const characterSpace = computed(() => {
  let chars = "";
  if (getCheckboxValue("lower")) chars += characters.lower;
  if (getCheckboxValue("upper")) chars += characters.upper;
  if (getCheckboxValue("numbers")) chars += characters.numbers;
  if (getCheckboxValue("symbols")) chars += characters.symbols;
  return chars;
});

function shuffleArray<T>(originalArray: T[]): T[] {
  const arr = [...originalArray];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const newPos = Math.floor(Math.random() * (i + 1)) as number;
    [arr[i], arr[newPos]] = [arr[newPos], arr[i]];
  }
  return arr;
}

function generateRandomNumber(max: number) {
  return Math.floor(Math.random() * max);
}

function getRandomCharacter(
  characterType: "upper" | "lower" | "numbers" | "symbols",
) {
  const charactersToGetFrom = characters[characterType];
  const index = generateRandomNumber(charactersToGetFrom.length);
  return charactersToGetFrom[index];
}

// function validatePasswordRequirements() {
//   if (length.value < minLength.value)
//     throw new Error(
//       `You can't set the length to "${length.value}" with the selected options`,
//     );
// }

function generate() {
  const { $notify } = useNuxtApp();

  try {
    const randomCharacters = shuffleArray(characterSpace.value.split(""));
    const password: string[] = [];

    let addedLower = false;
    let addedUpper = false;
    let addedNumber = false;
    let addedSymbol = false;

    for (let i = 0; i < length.value; i += 1)
      if (getCheckboxValue("lower") && !addedLower) {
        password.push(getRandomCharacter("lower"));
        addedLower = true;
      } else if (getCheckboxValue("upper") && !addedUpper) {
        password.push(getRandomCharacter("upper"));
        addedUpper = true;
      } else if (getCheckboxValue("numbers") && !addedNumber) {
        password.push(getRandomCharacter("numbers"));
        addedNumber = true;
      } else if (getCheckboxValue("symbols") && !addedSymbol) {
        password.push(getRandomCharacter("symbols"));
        addedSymbol = true;
      } else {
        const randomIndex = Math.floor(Math.random() * randomCharacters.length);
        password.push(randomCharacters[randomIndex]);
      }

    generatedPassword.value = shuffleArray(password).join("");
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
        <Icon name="reload" size="75%" />
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
      ::v-deep i
        +center

    .copy-button
      +ma(auto)
      +block

  +e(options)
    ::v-deep
      .checker-wrapper
        +mx(auto)
        max-width: 500px
        +e(options)
          grid-template-columns: repeat(2, 1fr)
          +lt-mobile
            grid-template-columns: repeat(4, 1fr)
    ::v-deep
      .input-range-container
        +mx(auto)

  +e(save)
    +mx(15px)
    +mt(15px)
    overflow: hidden
    +lt-mobile
      +mx(50px)
</style>
