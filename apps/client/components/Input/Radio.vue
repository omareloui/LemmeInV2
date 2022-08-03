<script setup lang="ts">
import type { InputRadioOption } from "types";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    notRequired?: boolean;
    heading?: string;
    headingTag?: string;
    options: InputRadioOption[];
  }>(),
  {
    notRequired: false,
    heading: undefined,
    headingTag: "h3",
  },
);

const emit = defineEmits<{ (e: "update:modelValue", value: unknown): void }>();

const content = useModelWrapper(props, emit);

const errorMessage = ref("");

const isErred = computed(() => !!errorMessage.value);

function clearError() {
  errorMessage.value = "";
}

function focusOnRadio(id: string) {
  const label = document.getElementById(id);
  (
    label?.previousElementSibling as
      | (HTMLElement & { focus: () => void })
      | null
  )?.focus();
}

function changeRadio(option: InputRadioOption) {
  if (isErred) clearError();
  content.value = option.id;
  focusOnRadio(option.id);
}

function validate() {
  clearError();
  if (
    !props.notRequired &&
    (content.value === "" ||
      content.value === undefined ||
      content.value === null)
  )
    errorMessage.value = "This field can't be empty.";
}

function clear() {
  content.value = "";
}

defineExpose({ validate, clear, isErred, errorMessage });
</script>

<template>
  <div class="radio-wrapper" :class="{ 'radio-wrapper--has-error': isErred }">
    <Component :is="headingTag" v-if="heading" class="radio-wrapper__heading">
      {{ heading }}
    </Component>

    <div class="radio-wrapper__options">
      <div v-for="option in options" :key="option.value" class="option">
        <span
          class="option__radio"
          :class="{ 'option__radio--is-checked': option.id === content }"
          tabindex="0"
          :aria-labelledby="option.id"
          role="radio"
          :aria-checked="option.id === content ? 'true' : 'false'"
          @click="changeRadio(option)"
          @keyup.space="changeRadio(option)"
          @keydown.space.prevent
        >
        </span>
        <label
          :id="option.id"
          class="option__label"
          @click="changeRadio(option)"
        >
          {{ option.value }}
        </label>
      </div>
    </div>
    <Transition name="fade">
      <span v-if="isErred" class="error">{{ errorMessage }}</span>
    </Transition>
  </div>
</template>

<style lang="sass" scoped>
// @use "~/assets/scss/mixins" as *

// $radio-size: 20px

// .radio-wrapper
//   +tran
//   +pos-r
//   &__heading
//     +clr-txt(primary, 70)
//     +tran(color, 0.1s)
//   &__options
//     display: grid
//     gap: 10px
//     .option
//       +pos-r
//       +list-reset
//       &__label
//         +clickable
//         +no-select
//         +ml($radio-size + 5)
//         +tran(color, 0.1s)
//       &__radio
//         display: inline-block
//         +center-v
//         +clr-bg
//         +size($radio-size)
//         +br-cr
//         +brdr(input-checkbox)
//         +clickable
//         +focus-effect
//         &:after
//           content: ""
//           +center
//           +size(0)
//           +clr-bg(input-checkbox)
//           +br-cr
//           +tran(all, 0.1s)
//         &--is-checked
//           &:after
//             +size($radio-size - 10px)

//   .error
//     +pos-a(left 25px bottom -20px)
//     +clr-txt(error)
//     +fnt-xs
//     line-height: 10px

//   &--has-error
//     +mb(30px)
//     .radio-wrapper__heading
//       +clr-txt(error)
//     .option
//       &__label
//         +clr-txt(error)
//       &__radio
//         +clr(error, border-color)
</style>
