<script setup lang="ts">
withDefaults(defineProps<{ isLoading?: boolean }>(), { isLoading: false });

const emit = defineEmits<{ (e: "submit"): void }>();
</script>

<template>
  <ButtonMain
    type="submit"
    class="submit"
    cta
    large
    block
    v-bind="{ isLoading }"
    @click="emit('submit')"
    @keyup.enter="emit('submit')"
  >
    <slot>Submit</slot>
  </ButtonMain>
</template>
