<script setup lang="ts">
export interface AxiosError {
  message: string;
  name: string;
  path: string;
  type: string;
  status: number;
}

definePageMeta({ layout: "no-floating-menu" });

defineProps<AxiosError>();
</script>

<template>
  <LayoutsWrapper>
    <Container class="error">
      <template #heading>{{ status }} {{ type }}</template>
      <p class="error__message">{{ message }}</p>
    </Container>
  </LayoutsWrapper>
</template>
