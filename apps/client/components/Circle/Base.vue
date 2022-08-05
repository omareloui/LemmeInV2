<script setup lang="ts">
defineProps<{ color: string; size: string }>();
</script>

<template>
  <div
    class="circle"
    :style="{ '--clr': `var(--clr-${color})`, '--size': size }"
  ></div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.circle
  +br-cr
  +clr-bg(--clr)
  +size(var(--size))
</style>
