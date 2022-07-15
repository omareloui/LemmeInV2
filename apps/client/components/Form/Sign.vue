<script setup lang="ts">
import { useAuthStore } from "store/useAuth";

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
  console.log(values);
  // isSigninPage ? authStore.signin(values) : authStore.register(values)
}
</script>

<template>
  <Container no-heading custom-max-width="600px">
    <FormGenerator :form-fields="formFields" :submit-function="onSubmit" />
  </Container>
</template>
