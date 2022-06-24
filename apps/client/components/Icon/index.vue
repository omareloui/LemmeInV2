<script setup lang="ts">
import { useThemeStore } from "store/useTheme";
import capitalize from "utils/capitalize";

const themeStore = useThemeStore();

const props = withDefaults(
  defineProps<{
    name: string;
    size?: string;
    width?: string;
    height?: string;
    stroke?: string;
    viewBox?: string;
    fill?: string | string[];
    clickable?: boolean;
    focusable?: boolean;
    ariaLabel?: string;
  }>(),
  {
    size: "25px",
    width: undefined,
    height: undefined,
    stroke: undefined,
    viewBox: "32 32",
    fill: "text-main",
    ariaLabel: undefined,
  },
);

const emit = defineEmits(["click", "dblclick", "keyup:enter", "keyup:space"]);
const IconComponent = resolveComponent(
  `Icon${capitalize(props.name).replace(/-/g, "")}`,
);
</script>

<template>
  <i
    class="icon-wrapper"
    :class="{
      'icon-wrapper--clickable': clickable,
      'icon-wrapper--focusable': focusable,
    }"
    :style="{
      '--width': width || size,
      '--height': height || size,
      '--fill': Array.isArray(fill)
        ? themeStore.currentTheme === 'light'
          ? fill[0]
          : fill[1]
        : fill.match(/^#[\da-f]{3,8}$/i)
        ? fill
        : `var(--clr-${fill})`,
      '--stroke': stroke && `var(--clr-${stroke})`,
    }"
    :tabindex="focusable ? 0 : undefined"
    :aria-label="ariaLabel"
    @click="emit('click')"
    @dblclick="emit('dblclick')"
    @keyup.enter="emit('keyup:enter')"
    @keyup.space="emit('keyup:space')"
  >
    <svg :viewBox="`0 0 ${viewBox}`">
      <Transition name="fade">
        <Component :is="IconComponent"></Component>
      </Transition>
    </svg>
  </i>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.icon-wrapper
  +pos-r
  +inline-block
  +h(var(--height))
  +w(var(--width))
  +focus-effect
  +br-sm

  svg
    +center
    +clr(--fill, fill)
    +clr(--stroke, stroke)
    +size(100%)

  +m(focusable)
    svg
      +focus-effect(icon)

  +m(clickable)
    +clickable
</style>
