<script setup lang="ts">
type TargetValues = "_blank" | "_self" | "_parent" | "_top";

const props = withDefaults(
  defineProps<{ to: string; isDisabled?: boolean; target?: TargetValues }>(),
  { target: undefined },
);

const isRelativeLink = computed(() => props.to.startsWith("/"));

const nuxtLink = computed(() => {
  const route = useRoute();
  if (!isRelativeLink) return undefined;
  if (props.isDisabled) return route.fullPath;
  return props.to;
});

const aLink = computed(() => {
  if (isRelativeLink) return undefined;
  if (props.isDisabled) return "#!";
  return props.to;
});

const computedTarget = computed(() => {
  if (props.isDisabled) return undefined;
  if (props.target) return props.target;
  if (!isRelativeLink) return "_blank";
  return undefined;
});
</script>

<template>
  <NuxtLink
    v-if="isRelativeLink"
    :to="nuxtLink"
    class="link"
    :class="{ 'link--disabled': isDisabled }"
    :target="computedTarget"
  >
    <slot></slot>
  </NuxtLink>
  <a
    v-else
    :href="aLink"
    class="link"
    :class="{ 'link--disabled': isDisabled }"
    :target="computedTarget"
    ><slot></slot
  ></a>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.link
  +no-underline
  +clr-txt
  +br-md
  +mx(-5px)
  +px(5px)
  &:not(.link--disabled)
    +clickable

  +m(disabled)
    +clr-txt($opacity: 0.5)
    +not-allowed
</style>
