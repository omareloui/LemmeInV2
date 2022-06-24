<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset";
    ariaLabel?: string;
    isDisabled?: boolean;
    size?: string;
    isLoading?: boolean;
    description?: string;
    icon: string;
    iconViewBox?: string;
    iconSize?: string;
    color?: string;
  }>(),
  {
    type: "button",
    ariaLabel: undefined,
    size: "40px",
    description: undefined,
    iconViewBox: "32 32",
    iconSize: "18px",
    color: "info",
  },
);

const emit = defineEmits(["click", "dblclick"]);

function onClick(event: "single" | "dbl") {
  if (!props.isDisabled) emit(event === "single" ? "click" : "dblclick");
}
</script>

<template>
  <div class="button-glass" :style="{ '--size': size }">
    <GlassCircle
      float
      class="button-glass__glass-layer"
      back-shape-size="58%"
      tint="background-main"
      :back-shape-color="color"
      :blur="2"
      :opacity="0.4"
    >
      <ButtonBase
        class="button-glass__button"
        v-bind="{ ariaLabel: description || ariaLabel }"
        @click="onClick('single')"
        @dblclick="onClick('dbl')"
      >
        <!-- <Icon :name="icon" :view-box="iconViewBox" :size="iconSize"></Icon> -->
      </ButtonBase>
    </GlassCircle>

    <GlassCard
      v-if="!!description"
      no-back-shape
      tint="background-secondary"
      float
      class="button-glass__description"
      :opacity="0.4"
    >
      <span>{{ description }}</span>
    </GlassCard>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.button-glass
  +pos-r

  +e(glass-layer)
    +size(var(--size))
    +br-cr

  +e(button)
    +block
    +br-cr
    +size(100%)
    i
      +center

  +e(description)
    z-index: -1
    +pos-a(top 50% right 120%)
    +no-select
    +tran
    opacity: 0
    transform: translate(50px , -50%)
    span
      +inline-block
      +no-wrap
      +pa(5px)
      +fnt-xs
      +br-sm
      +capitalize

  &:hover
    +e(button-glass, description)
      opacity: 1
      transform: translate(0, -50%)
</style>
