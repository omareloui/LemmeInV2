<script setup lang="ts">
type HTMLHeadings = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type ContainerTags = "div" | "main" | "section";

withDefaults(
  defineProps<{
    noHeading?: boolean;
    tag?: ContainerTags;
    headingTag?: HTMLHeadings;
    customMaxWidth?: string;
    paddingBottom?: boolean;
    centerHeading?: boolean;
  }>(),
  {
    noHeading: false,
    tag: "div",
    headingTag: "h1",
    paddingBottom: false,
    centerHeading: false,
    customMaxWidth: undefined,
  },
);
</script>

<template>
  <Component
    :is="tag"
    class="container"
    :class="{
      'container--custom': !!customMaxWidth,
      'container--has-padding-bottom': paddingBottom,
    }"
    :style="{ '--custom-width': customMaxWidth }"
  >
    <Component
      :is="headingTag"
      v-if="!noHeading"
      class="container__heading"
      :class="{ 'container__heading--center': centerHeading }"
    >
      <slot name="heading">Heading</slot>
    </Component>
    <slot></slot>
  </Component>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.container
  +px(10px)

  +m(has-padding-bottom)
    +pb(30px)

  +lt-desktop
    --container-width: calc(var(--screen-desktop) - 20px)
    +ma(auto)
    +px(0)
    min-width: var(--container-width)
    max-width: var(--container-width)
    width: var(--container-width)

    +m(custom)
      min-width: var(--custom-width)
      max-width: var(--custom-width)
      width: var(--custom-width)

  +e(heading)
    +clr-txt(primary)
    text-align: center
    overflow: hidden
    +lt-tablet
      &:not(.container__heading--center)
        text-align: left
</style>
