<script setup lang="ts">
import { useAuthStore } from "store/useAuth";
import type { SignInOptions, RegisterOptions } from "~~/types";

const authStore = useAuthStore();
const route = useRoute();

const isSigninPage = route.fullPath === "/signin";

const signinFields = [
  { id: "email", fieldType: "Email" as const, props: { modelValue: "" } },
  { id: "password", fieldType: "Password" as const, props: { modelValue: "" } },
];

const registerFields = [
  {
    id: "firstName",
    fieldType: "Base" as const,
    props: {
      label: "First Name",
      modelValue: "",
    },
    display: {
      isHalfColumn: true,
    },
  },
  {
    id: "lastName",
    fieldType: "Base" as const,
    props: {
      label: "Last Name",
      modelValue: "",
    },
    display: {
      isHalfColumn: true,
    },
  },
];

const formFields = reactive(
  isSigninPage ? signinFields : [...registerFields, ...signinFields],
);

function onSubmit(values: unknown) {
  if (isSigninPage) authStore.signin(values as SignInOptions);
  else authStore.register(values as RegisterOptions);
}
</script>

<template>
  <Container no-heading custom-max-width="600px">
    <FormGenerator :form-fields="formFields" :submit-function="onSubmit" />
  </Container>
</template>
