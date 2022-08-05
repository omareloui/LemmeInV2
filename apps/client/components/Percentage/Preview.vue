<script setup lang="ts">
import initUpdateNumber from "utils/updateNumber";

const props = withDefaults(
  defineProps<{
    percentage: number;
    size?: string;
    color?: string;
    strokeWidth?: string;
    hasRoundStrokeEdges?: boolean;
  }>(),
  {
    size: "100px",
    color: "primary",
    strokeWidth: "1.8",
    hasRoundStrokeEdges: false,
  },
);

const updateNumber = reactive<ReturnType<typeof initUpdateNumber>>(
  initUpdateNumber(props.percentage, 20),
);
const stringifiedNumber = computed(() => updateNumber.current.toString());

onMounted(() => updateNumber.update());
</script>

<template>
  <div class="percentage">
    <svg
      viewBox="-1 -1 34 34"
      :style="{
        '--stroke-width': strokeWidth,
        '--stroke-clr': `var(--clr-${color})`,
        '--size': size,
        '--percentage': stringifiedNumber,
      }"
    >
      <Number
        tag="text"
        :number="percentage"
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        suffix="%"
      />
      <circle cx="16" cy="16" :r="15.9155"></circle>
      <circle cx="16" cy="16" r="15.9155" class="bar"></circle>
    </svg>
  </div>
</template>

<style lang="sass" scoped>
@use "sass:math"
@use "~/assets/scss/mixins" as *

.percentage
  +w(min-content)

  svg
    +tran
    +size(var(--size))
    transform: rotate(-90deg)

    text
      font-size: 0.5rem
      +clr(text-main, fill)
      transform: rotate(90deg) translateY(2px)
      transform-origin: center

  circle
    +tran($timing-function: linear)
    fill: none
    +clr(background-secondary, stroke, $opacity: 0.4)
    stroke-width: var(--stroke-width)

    &.bar
      stroke: var(--stroke-clr)
      stroke-linecap: round
      stroke-dasharray: 100 100
      stroke-dashoffset: calc(100 - var(--percentage))
</style>
