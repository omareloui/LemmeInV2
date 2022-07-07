<script setup lang="ts">
import { useAuthStore } from "store/useAuth";
import type { FormField } from "~~/@types";

const authStore = useAuthStore();
const route = useRoute();

const isSigninPage = route.fullPath === "/signin";

const signinFields = [
  { id: "email", type: "email", value: "" },
  { id: "password", type: "password", value: "" },
] as FormField[];

const registerFields = [
  {
    id: "firstName",
    type: "text",
    label: "First Name",
    value: "",
    style: "half",
  },
  {
    id: "lastName",
    type: "text",
    label: "Last Name",
    value: "",
    style: "half",
  },
] as FormField[];
</script>

<template>
  <Container no-heading custom-max-width="600px">
    <FormGenerator
      :form-fields="
        isSigninPage ? signinFields : registerFields.concat(signinFields)
      "
      :submit-function="isSigninPage ? authStore.signin : authStore.register"
    />
  </Container>
</template>
