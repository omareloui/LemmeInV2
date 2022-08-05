<script setup lang="ts">
import { useAuthStore } from "store/useAuth";
import type { Structure } from "~~/components/Form/Generator.vue";

const authStore = useAuthStore();

const formFields: Structure = [
  {
    id: "firstName",
    fieldType: "Base",
    props: {
      label: "First Name",
      modelValue: authStore.user?.firstName || "",
    },
    display: {
      isHalfColumn: true,
    },
  },
  {
    id: "lastName",
    fieldType: "Base",
    props: {
      label: "Last Name",
      modelValue: authStore.user?.lastName || "",
    },
    display: {
      isHalfColumn: true,
    },
  },
  {
    id: "email",
    fieldType: "Email",
    props: { modelValue: authStore.user?.email || "" },
  },
  // {
  //   id: "oldPassword",
  //   fieldType: "Password",
  //   props: {
  //     label: "Old password",
  //     modelValue: "",
  //     placeholder: "Leave empty to not update",
  //     notRequired: true,
  //   },
  // },
  // {
  //   id: "password",
  //   fieldType: "Password",
  //   props: {
  //     label: "New password",
  //     modelValue: "",
  //     placeholder: "Leave empty to not update",
  //     notRequired: true,
  //   },
  // },
];
</script>

<template>
  <Container padding-bottom>
    <template #heading>Account Settings</template>
    <main>
      <Container no-heading custom-max-width="600px">
        <FormGenerator
          :form-fields="formFields"
          :submit-function="authStore.updateMe"
          submit-button-text="Update Me"
        />
      </Container>
    </main>
  </Container>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *
</style>
