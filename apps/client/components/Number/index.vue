<script setup lang="ts">
import initUpdateNumber from "utils/updateNumber";

const props = withDefaults(
  defineProps<{
    number: number;
    tag?: string;
    speed?: number;
    suffix?: string;
  }>(),
  {
    tag: "span",
    speed: 20,
    suffix: undefined,
  },
);

const currentNumber = ref(props.number);

const updateNumber = reactive<ReturnType<typeof initUpdateNumber>>(
  initUpdateNumber(currentNumber.value, props.speed),
);

onMounted(() => updateNumber.update());
</script>

<template>
  <Component :is="tag">{{ updateNumber.current }}{{ suffix }}</Component>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *
</style>
