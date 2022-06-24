<script setup lang="ts">
import { useAuthStore } from "store/useAuth";

const authStore = useAuthStore();

definePageMeta({ layout: "no-floating-menu" });

defineNuxtRouteMiddleware(() => {
  const router = useRouter();
  if (authStore.isSigned) router.push("/home");
});
</script>

<template>
  <Container tag="main">
    <template #heading>Lemme in</template>
  </Container>
</template>
