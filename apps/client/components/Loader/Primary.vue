<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    color?: string;
    size?: number;
    strokeWidth?: number;
    speed?: 3;
    hasRoundStrokeEdges?: boolean;
  }>(),
  {
    color: "primary",
    size: 75,
    strokeWidth: 5,
    speed: 3,
    hasRoundStrokeEdges: false,
  },
);
</script>

<template>
  <svg
    :style="{
      '--stroke-width': `${strokeWidth}px`,
      '--stroke-clr': `var(--clr-${color})`,
      '--loader-primary-size': `${size}px`,
      '--loader-primary-speed': `${speed}s`,
    }"
  >
    <circle
      :cx="size / 2"
      :cy="size / 2"
      :r="size / 2 - strokeWidth"
      :style="hasRoundStrokeEdges ? 'stroke-linecap: round;' : ''"
    ></circle>
  </svg>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

svg
  width: var(--loader-primary-size)
  height: var(--loader-primary-size)
  animation: rotate calc(var(--loader-primary-speed) / 2) linear infinite

  circle
    +size(100%)
    fill: none
    stroke: var(--stroke-clr)
    stroke-width: var(--stroke-width)
    stroke-dasharray: calc(var(--loader-primary-size) * 3)
    stroke-dashoffset: calc(var(--loader-primary-size) * 3)
    animation: primary-loader var(--loader-primary-speed) linear infinite

@keyframes primary-loader
  0%, 100%
    stroke-dashoffset: calc(var(--loader-primary-size) * 3)
  50%
    stroke-dashoffset: 0
  50.1%
    stroke-dashoffset: calc(var(--loader-primary-size) * 6)

@keyframes rotate
  to
    transform: rotate(360deg)
</style>
