<script setup lang="ts">
import type { PasswordScore } from "types";

const PROGRESS_STYLES = ["line", "dot"] as const;
type ProgressStyle = typeof PROGRESS_STYLES[number];

const props = withDefaults(
  defineProps<{
    decryptedPassword: string;
    isDuplicated?: boolean;
    lastUpdated?: Date;

    shape?: ProgressStyle;

    lineHeight?: string;
    dotSize?: string;
    hideScoreText?: boolean;
    // showSuggestions?: boolean
  }>(),
  {
    isDuplicated: false,
    lastUpdated: () => new Date(),
    shape: "line",
    lineHeight: "5px",
    dotSize: "15px",
    hideScoreText: false,
    // showSuggestions: false
  },
);

function getPasswordStrength() {
  const { $getPasswordStrength } = useNuxtApp();
  return $getPasswordStrength(props.decryptedPassword);
}

const strength = computed(() => getPasswordStrength());
</script>

<template>
  <div
    class="password-strength"
    :class="{
      'password-strength--has-text': shape === 'line' && !hideScoreText,
    }"
  >
    <div
      v-if="strength && shape === 'line'"
      class="progress-bar"
      :style="{
        '--percentage': strength.percentage,
        '--color': `var(${strength.color})`,
        '--height': lineHeight,
      }"
    >
      <span class="progress"></span>
    </div>
    <span
      v-if="strength && shape === 'line' && !hideScoreText"
      class="score-text"
    >
      {{ strength.score }}/{{ strength.maxScore }}
    </span>

    <div
      v-if="strength && shape === 'dot'"
      class="dot"
      :style="{
        '--color': `var(${strength.color})`,
        '--size': dotSize,
      }"
    ></div>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.password-strength
  +pos-r

  .progress-bar
    +w(100%)
    +h(var(--height))
    +br-bl
    +clr-bg(secondary)
    overflow: hidden

    .progress
      +block
      +tran
      +br-bl
      +h(100%)
      +w(calc(var(--percentage) * 1%))
      +clr-bg(--color)

  .score-text
    +fnt-sm
    +center-v
    right: 0

  +m(has-text)
    +pr(5ch)
    +my(7px)

  .dot
    +size(var(--size))
    +clr-bg(--color)
    +br-cr
</style>
