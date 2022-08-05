<script setup lang="ts">
import type { Swiper as TSwiper, SwiperOptions } from "swiper";
import { Swiper } from "swiper/vue";

import "swiper/css";

const swiperContainer = ref<HTMLElement | null>(null);
const swiper = ref<InstanceType<typeof Swiper> | null>(null);

const props = withDefaults(
  defineProps<{
    slidesPerView?: number | "auto";
    autoItemsPerView?: boolean;
    itemWidth?: number;
    gap?: number;
  }>(),
  { slidesPerView: 3, autoItemsPerView: false, itemWidth: undefined, gap: 30 },
);

const options = reactive<SwiperOptions>({
  slidesPerView: 5,
  spaceBetween: props.gap || 30,
});

const swiperWidth = ref(0);
const isSlideStart = ref(true);
const isSlideEnd = ref(false);

const slidesCount = computed(() =>
  Math.floor(swiperWidth.value / (props.itemWidth + props.gap)),
);

function setItemsPerView() {
  options.slidesPerView = slidesCount.value;
}

function setSwiperWidth() {
  swiperWidth.value = swiperContainer.value?.clientWidth || 0;
}

function setItemsCountToPreview() {
  setSwiperWidth();
  setItemsPerView();
}

function updateSideFade(swiperState: TSwiper) {
  const { isBeginning, isEnd } = swiperState;
  isSlideStart.value = isBeginning;
  isSlideEnd.value = isEnd;
}

onMounted(() => {
  setItemsCountToPreview();
  window.addEventListener("resize", setItemsCountToPreview);
});

onUnmounted(() => {
  window.removeEventListener("resize", setItemsCountToPreview);
});
</script>

<template>
  <div ref="swiperContainer">
    <Swiper
      ref="swiper"
      class="swiper"
      :slides-per-view="options.slidesPerView"
      :space-between="options.spaceBetween"
      free-mode
      :class="{
        'swiper--not-start': !isSlideStart,
        'swiper--not-end': !isSlideEnd,
      }"
      @transition-end="updateSideFade"
    >
      <slot></slot>
    </Swiper>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.swiper
  +pos-r
  +py(10px)

  &::after,
  &::before
    --clr: hsl(var(--clr-hs-background-secondary) var(--clr-l-background-secondary) / var(--clr-o-100))
    z-index: 1
    content: ""
    +pos-a(top 0)
    +block
    +size(30px 100%)
    +no-select
    +not-clickable
    +tran(opacity)
    opacity: 0

  &::after
    left: 0
    background-image: linear-gradient(to right, var(--clr), transparent)
  &::before
    right: 0
    background-image: linear-gradient(to left, var(--clr), transparent)

  &.swiper--not-start
    &::after
      opacity: 1

  &.swiper--not-end
    &::before
      opacity: 1
</style>
