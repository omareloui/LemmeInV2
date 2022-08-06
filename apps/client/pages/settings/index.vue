<script setup lang="ts">
import { useAuthStore } from "store/useAuth";

const authStore = useAuthStore();

const formData = reactive({
  firstName: authStore.user?.firstName || "",
  lastName: authStore.user?.lastName || "",
  email: authStore.user?.email || "",
  oldPassword: "",
  password: "",
});

const componentsHandler = useFormComponents();
const { addComponentRef } = componentsHandler;
</script>

<template>
  <Container padding-bottom>
    <template #heading>Account Settings</template>
    <main>
      <Container no-heading custom-max-width="600px">
        <FormWrapper
          :submit-function="authStore.updateMe"
          submit-button-text="Update Me"
          :components-handler="componentsHandler"
        >
          <InputBase
            :ref="addComponentRef"
            v-model="formData.firstName"
            identifier="firstName"
            label="First Name"
            class="half"
          />
          <InputBase
            :ref="addComponentRef"
            v-model="formData.lastName"
            identifier="lastName"
            label="Last Name"
            class="half"
          />
          <InputEmail :ref="addComponentRef" v-model="formData.email" />
          <!-- <InputPassword
            :ref="addComponentRef"
            v-model="formData.password"
            identifier="oldPassword"
            label="Old password"
            placeholder="Leave empty to not update"
            not-required
          />
          <InputPassword
            :ref="addComponentRef"
            v-model="formData.password"
            identifier="password"
            label="New password"
            placeholder="Leave empty to not update"
            not-required
          /> -->
        </FormWrapper>
      </Container>
    </main>
  </Container>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *
</style>
