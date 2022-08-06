<script setup lang="ts">
import { useAuthStore } from "store/useAuth";
import type { SignInOptions, RegisterOptions } from "~~/types";

const authStore = useAuthStore();
const route = useRoute();

const isSigninPage = route.fullPath === "/signin";

const formData = reactive({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
});

const componentsHandler = useFormComponents();
const { addComponentRef } = componentsHandler;

async function onSubmit(values: unknown) {
  if (isSigninPage) await authStore.signin(values as SignInOptions);
  else await authStore.register(values as RegisterOptions);
}
</script>

<template>
  <Container no-heading custom-max-width="600px">
    <FormWrapper
      :submit-function="onSubmit"
      :components-handler="componentsHandler"
    >
      <InputBase
        v-if="!isSigninPage"
        :ref="addComponentRef"
        v-model="formData.firstName"
        identifier="firstName"
        label="First Name"
        class="half"
      />
      <InputBase
        v-if="!isSigninPage"
        :ref="addComponentRef"
        v-model="formData.lastName"
        identifier="lastName"
        label="Last Name"
        class="half"
      />

      <InputEmail :ref="addComponentRef" v-model="formData.email" />
      <InputPassword :ref="addComponentRef" v-model="formData.password" />
    </FormWrapper>
  </Container>
</template>
