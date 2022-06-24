<script setup lang="ts">
import { useThemeStore } from "store/useTheme";

const themeStore = useThemeStore();

useHead({
  htmlAttrs: {
    theme: themeStore.currentTheme === "dark" ? "dark" : undefined,
  } as { theme?: string },
});

onBeforeMount(themeStore.loadMediaQuery);
</script>

<template>
  <div>
    <slot></slot>
  </div>
</template>
