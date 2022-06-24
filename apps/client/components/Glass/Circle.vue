<script setup lang="ts">
const OPACITY_OPTIONS = [
  0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
] as const;

type OpacityOptions = typeof OPACITY_OPTIONS[number];

withDefaults(
  defineProps<{
    size?: string;
    blur?: number;
    opacity?: OpacityOptions;
    float?: boolean;
    tint?: string;
    textColor?: string;
    focusable?: boolean;

    noBackShape?: boolean;

    backShapeSize?: string;
    backShapeColor?: string;
  }>(),
  {
    size: "25px",
    blur: 4,
    opacity: 0.2,
    tint: "info",
    textColor: "text-main",
    backShapeSize: "60%",
    backShapeColor: undefined,
  },
);
</script>

<template>
  <GlassCard
    circle
    back-shape="circle"
    v-bind="{
      blur,
      opacity,
      tint,
      float,
      focusable,
      textColor,
      noBackShape,
      backShapeSize,
      backShapeColor,
    }"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
  >
    <slot></slot>
  </GlassCard>
</template>
