<script setup lang="ts">
type TargetValues = "_blank" | "_self" | "_parent" | "_top";

withDefaults(
  defineProps<{
    to: string;
    isDisabled?: boolean;
    target?: TargetValues;
  }>(),
  { target: undefined },
);
</script>

<template>
  <LinkBase
    v-bind="{ to, target, isDisabled }"
    class="link-main"
    :class="{ 'link-main--disabled': isDisabled }"
  >
    <slot></slot>
  </LinkBase>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.link
  +clr-txt(link)
  +italic
  +m(disabled)
    +clr-txt(link, $opacity: 0.5)
    +not-allowed
</style>
