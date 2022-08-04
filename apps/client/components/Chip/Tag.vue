<script setup lang="ts">
import { Tag } from "types";

withDefaults(
  defineProps<{
    tag: Tag;
    noRemoveButton: boolean;
    invert: boolean;
    clickable: boolean;
  }>(),
  { noRemoveButton: false, invert: false, clickable: false },
);
</script>

<template>
  <span
    class="chip-tag"
    :class="{
      'chip-tag--has-remove-button': !noRemoveButton,
      'chip-tag--invert': invert,
      'chip-tag--clickable': clickable,
    }"
    :style="{ '--color': `var(--clr-${tag.color})` }"
    @click="$emit('click')"
  >
    {{ tag.name }}
    <ButtonGlass
      v-if="!noRemoveButton"
      class="remove-button"
      size="20px"
      icon-size="10px"
      icon="Close"
      color="cancel"
      @click="$emit('remove-tag', tag)"
    ></ButtonGlass>
  </span>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.chip-tag
  +pos-r
  +px(10px)
  +clr-bg(--color)
  +clr-txt(dark)
  +br-bl
  +inline-block
  +fnt-sm
  +h(30px)
  +no-wrap
  line-height: 30px

  +m(invert)
    +clr-bg(tertiary)
    +clr-txt(--color)

  +m(clickable)
    +clickable

  +m(has-remove-button)
    +pr(35px)

  .remove-button
    +center-v
    right: 8px
</style>
