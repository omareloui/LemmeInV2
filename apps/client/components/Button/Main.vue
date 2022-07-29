<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset";
    ariaLabel?: string;
    isLoading?: boolean;
    isDisabled?: boolean;
    cta?: boolean;
    large?: boolean;
    block?: boolean;
    dontBlockOnMobile?: boolean;
    color?: string;
  }>(),
  {
    type: "button",
    ariaLabel: undefined,
    color: "info",
  },
);

const emit = defineEmits(["click", "dblclick"]);

function onClick(event: "single" | "dbl") {
  if (!props.isDisabled) emit(event === "single" ? "click" : "dblclick");
}
</script>

<template>
  <ButtonBase
    class="button-main"
    :class="{
      'button-main--cta': cta,
      'button-main--block': block,
      'button-main--large': large,
      'button-main--custom-color': !!color,
      'button-main--dont-block-on-mobile': dontBlockOnMobile,
    }"
    :style="color && { '--color': `var(--clr-${color})` }"
    v-bind="{ type, isDisabled, ariaLabel }"
    @click="onClick('single')"
    @dblclick="onClick('dbl')"
  >
    <Transition name="fade">
      <span v-if="isLoading" class="button-main__loader">
        <LoaderPrimary
          :size="large ? 35 : 20"
          :stroke-width="large ? 3 : 2"
          :color="cta || !!color ? 'text-light' : 'primary'"
        ></LoaderPrimary>
      </span>
    </Transition>

    <Transition name="fade">
      <span v-if="!isLoading" class="button-main__content">
        <slot></slot>
      </span>
    </Transition>
  </ButtonBase>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

$width-on-base: clamp(140px, 20vw,100%)
$width-on-large: clamp(160px, 30vw,100%)

.button-main
  +br-md
  +clr-bg(button)
  +size(100% 40px)

  +lt-mobile
    +w($width-on-base)
    +inline-block
    +m(large)
      +w($width-on-large)

  +e(loader)
    +not-allowed
    +center

  +e(content)
    +inline-block
    +center
    +w(100%)
    +no-wrap

  +m(cta)
    +clr-bg(primary)
    .button-main__content
      +clr-txt(light)

  +m(custom-color)
    +clr-bg(--color)
    .button-main__content
      +clr-txt(light)

  +m(large)
    +h(50px)
    .button-main__loader
      +size(35px)
    .button-main__content
      +fnt-xl

  +m(dont-block-on-mobile)
    +w($width-on-base)

  +lt-mobile
    +m(block)
      +block
      +w(100%)
</style>
