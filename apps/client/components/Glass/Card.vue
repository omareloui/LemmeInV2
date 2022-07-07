<script setup lang="ts">
const OPACITY_OPTIONS = [
  0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
] as const;
const BACK_SHAPE_OPTIONS = ["square", "pill", "circle"] as const;
const BACK_SHAPE_POSITIONS = ["bottom", "center", "top"] as const;

type OpacityOptions = typeof OPACITY_OPTIONS[number];
type BackShapeOptions = typeof BACK_SHAPE_OPTIONS[number];
type BackShapePositions = typeof BACK_SHAPE_POSITIONS[number];

const props = withDefaults(
  defineProps<{
    tag?: string;
    blur?: number;
    opacity?: OpacityOptions;
    editable?: boolean;
    float?: boolean;
    tint?: string;
    textColor?: string;
    circle?: boolean;
    focusable?: boolean;
    clickable?: boolean;

    role?: string;
    aria?: string;

    noBackShape?: boolean;

    backShape?: BackShapeOptions;
    backShapeSize?: string;
    backShapeWidth?: string;
    backShapeHeight?: string;
    backShapePosition?: BackShapePositions;
    backShapeColor?: string;
    isBackShapeHexColor?: boolean;
  }>(),
  {
    tag: "div",
    blur: 4,
    opacity: 0.2,
    tint: "info",
    textColor: "text-main",
    role: undefined,
    aria: undefined,
    backShape: "square",
    backShapeSize: "60%",
    backShapeWidth: undefined,
    backShapeHeight: undefined,
    backShapePosition: "center",
    backShapeColor: undefined,
  },
);

const emit = defineEmits<{
  (e: "click"): void;
  (e: "dblclick"): void;
  (e: "keyup:space"): void;
  (e: "keyup:enter"): void;
  (e: "mouseenter"): void;
  (e: "mouseleave"): void;
}>();

const backC = computed(() => {
  const color = props.backShapeColor || props.tint;
  if (props.noBackShape) return undefined;
  if (props.isBackShapeHexColor) return color;
  return `var(--clr-${color})`;
});

const classes = computed(() => {
  let classesRes = "";
  if (props.circle) classesRes += " glass--circle";
  if (props.float) classesRes += " glass--float";
  if (props.clickable) classesRes += " glass--clickable";
  if (!props.noBackShape)
    classesRes += ` glass--has-back-shape glass--back-shape--${props.backShape} glass--back-shape--${props.backShapePosition}`;
  return classesRes;
});
</script>

<template>
  <Component
    :is="tag"
    class="glass"
    :class="classes"
    :style="{
      '--back-shape-height': !noBackShape
        ? backShapeHeight || backShapeSize
        : undefined,
      '--back-shape-width': !noBackShape
        ? backShapeWidth || backShapeSize
        : undefined,
      '--back-shape-background': backC,
      '--background': `hsl(var(--clr-hs-${tint}) var(--clr-l-${tint}) / var(--clr-o-${
        opacity * 100
      }))`,
      '--blur': `${blur}px`,
      '--color': `var(--clr-${textColor})`,
    }"
    :contenteditable="editable ? true : undefined"
    :tabindex="focusable ? 0 : undefined"
    v-bind="{ role, aria }"
    @click="emit('click')"
    @dblclick="emit('dblclick')"
    @keyup.space="emit('keyup:space')"
    @keyup.enter="emit('keyup:enter')"
    @mouseenter="emit('mouseenter')"
    @mouseleave="emit('mouseleave')"
  >
    <slot></slot>
  </Component>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.glass
  +focus-effect
  +clr-txt(--color)

  > :first-child
    +clr-bg(--background)
    backdrop-filter: blur(var(--blur))

  +m(circle)
    +br-cr
  +m(float)
    > :first-child
      +float(1)
  +m(clickable)
    +clickable

  &.glass--has-back-shape
    &::before
      content: ""
      z-index: -1
      +tran
      +clr-bg(--back-shape-background)
      +w(var(--back-shape-width))
      +h(var(--back-shape-height))

  &.glass--back-shape
    +m(square)
      &::before
        +br-md
    +m(pill)
      &::before
        +br-bl
    +m(circle)
      &::before
        +br-cr

    +m(center)
      &::before
        +center
    +m(bottom)
      &::before
        +pos-a(bottom 3% left 50%)
        transform: translateX(-50%)
    +m(top)
      &::before
        +pos-a(top 0 left 50%)
        transform: translateX(-50%)
</style>
