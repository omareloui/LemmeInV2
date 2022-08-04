<script setup lang="ts">
import { toDataURL } from "qrcode";
import { useThemeStore } from "store/useTheme";

const props = defineProps<{ text: string; contentName?: string }>();

const themeStore = useThemeStore();

const qrCode = ref<string | null>(null);

async function createQR() {
  try {
    if (!qrCode.value)
      qrCode.value = await toDataURL(props.text, {
        errorCorrectionLevel: "H",
        margin: 2,
        color: {
          dark: "#191b1f",
          light: themeStore.currentTheme === "dark" ? "#ffffff" : "#ffffff00",
        },
      });
  } catch (e) {
    const { $notify } = useNuxtApp();
    $notify.error(useErrorMessage(e));
  }
}

createQR();
</script>

<template>
  <img
    v-if="qrCode"
    :src="qrCode"
    :alt="contentName ? 'qr code' : `qr code for ${contentName}`"
  />
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *
</style>
