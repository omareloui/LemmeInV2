<script setup lang="ts">
type TargetValues = "_blank" | "_self" | "_parent" | "_top";

withDefaults(
  defineProps<{
    to: string;
    cta?: boolean;
    isDisabled?: boolean;
    target?: TargetValues;
  }>(),
  { target: undefined },
);
</script>

<template>
  <LinkBase
    :to="to"
    class="link-button"
    :class="{
      'link-button--cta': cta,
      'link-button--disabled': isDisabled,
    }"
    v-bind="{ target, isDisabled }"
  >
    <slot></slot>
  </LinkBase>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.link-button
  +block
  +br-sm
  +ma(0)
  +pa(5px 10px)
  +clr-bg(button)
  +brdr(none)
  +clickable
  +no-underline
  +clr-txt
  +center-text

  +lt-mobile
    +w (clamp(140px, 20vw,100%))

  +m(cta)
    +clr-bg(primary)
    +clr-txt(light)

  +m(disabled)
    opacity: 0.8
    +not-allowed
</style>
