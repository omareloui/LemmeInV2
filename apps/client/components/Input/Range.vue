<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: number;
    identifier: string;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    doNotShowValue?: boolean;
  }>(),
  {
    label: undefined,
    min: 4,
    max: 30,
    step: 1,
    doNotShowValue: false,
  },
);

const emit = defineEmits<{ (e: "update:modelValue"): void }>();

const content = useModelWrapper(props, emit);

watch(content, (newValue, oldValue) => {
  if (newValue > oldValue && content.value === oldValue)
    content.value = newValue;
});
</script>

<template>
  <div
    class="input-range-container"
    :class="{ 'input-range-container--show-value': !doNotShowValue }"
    :style="{
      '--range-percentage': Math.round(((content - min) / (max - min)) * 100),
    }"
  >
    <label v-if="label" :for="identifier">
      {{ label }}
    </label>

    <div class="input-value-container">
      <GlassCard
        v-if="!doNotShowValue"
        :for="identifier"
        no-back-shape
        tint="primary"
        tag="output"
        class="input-value"
      >
        <span>
          {{ content }}
        </span>
      </GlassCard>
    </div>

    <input
      :id="identifier"
      v-model.number="content"
      class="input-range"
      type="range"
      v-bind="{ min, max, step }"
    />
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

=track
  +clickable
  +tran
  +size(var(--track-width) var(--track-height))

=progress
  +clr-bg(primary)
  +h(var(--track-height))
  +br-bl

=thumb
  +clr-bg(input-range-thumb)
  +br-cr
  +size(var(--thumb-size))
  backdrop-filter: blur(2px)

.input-range-container
  --thumb-size: 25px
  --track-width: 100%
  --track-height: 10px

  *
    +fnt(input)

  +w(clamp(150px, 80%, 330px))

  +m(show-value)
    +mt(30px)

  .input-value-container
    +pos-r
    +w(calc(100% - var(--thumb-size)))
    +mx(auto)

    .input-value
      +pos-a(top -30px)
      left: calc((var(--range-percentage) * 1%))
      +fnt-lg
      +tran
      transform: translateX(-50%)
      > span
        display: block
        +pa(3px 5px)
        +center-text
        +br-md

  .input-range
    +input-reset-appearance
    +my(calc(var(--thumb-size) / 4 + 10px))
    +w(var(--track-width))
    +focus-effect(input-range)
    +clr-bg(main)
    +br-bl
    opacity: 0.8

    // The Track //
    &::-webkit-slider-runnable-track
      +track
      +clr-bg(input-range-track)
      +br-bl

    &::-moz-range-track
      +track
      +clr-bg(input-range-track)
      +br-bl

    &::-ms-track
      +track
      +clr-bg(none)
      +clr-txt(none)
      +brdr(none, 0)
    &::-ms-fill-lower
      +clr-bg(input-range-track)
      +br-sm
    &::-ms-fill-upper
      +clr-bg(input-range-track)
      +br-sm

    // The Progress //
    &::-moz-range-progress
      +progress
      // +clr-bg(primary)

    // The Thumb //
    &::-webkit-slider-thumb
      +thumb
      +input-reset-appearance
      +mt(calc(var(--track-height) / 2 * -1))

    &::-moz-range-thumb
      +thumb
      +brdr(none, 0)

    &::-ms-thumb
      +thumb
      +brdr(none, 0)
</style>
