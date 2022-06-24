<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset";
    ariaLabel?: string;
    isDisabled?: boolean;
  }>(),
  { type: "button", ariaLabel: undefined },
);

const emit = defineEmits(["click", "dblclick"]);

function onClick(event: "single" | "dbl") {
  if (!props.isDisabled) emit(event === "single" ? "click" : "dblclick");
}
</script>

<template>
  <button
    :type="type"
    class="button button-base"
    :aria-label="ariaLabel"
    :disabled="isDisabled"
    @click="onClick('single')"
    @dblclick="onClick('dbl')"
  >
    <slot></slot>
  </button>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.button
  +pos-r
  +br-md
  +brdr(none)
  +clickable
  +center-text
  +fnt(body)
  background: none

  &.button-base
    +focus-effect

  &[disabled="disabled"]
    opacity: 0.8
    +not-allowed
</style>
