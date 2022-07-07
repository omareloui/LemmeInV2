<script setup lang="ts">
import InputBase from "./Base.vue";

const inputEl = ref<InstanceType<typeof InputBase> | null>(null);

const props = withDefaults(
  defineProps<{
    modelValue: string;
    identifier?: string;
    name?: string;
    placeholder?: string;
    hint?: string;
    label?: string;
    notRequired?: boolean;
    noAutoComplete?: boolean;
    focusOnMount?: boolean;
  }>(),
  {
    identifier: "email",
    hint: "john.doe@exampleemail.com",
    label: "Email",
    notRequired: false,
    noAutoComplete: false,
    focusOnMount: false,
    name: undefined,
    placeholder: undefined,
  },
);

const emit = defineEmits<{ (e: "update:modelValue", value: unknown): void }>();

const content = useModelWrapper(props, emit);

const errorMessage = computed(
  () => inputEl.value && inputEl.value.errorMessage,
);

function validate() {
  if (inputEl.value) inputEl.value.validate();
}

defineExpose({ validate, errorMessage });
</script>

<template>
  <InputBase
    ref="inputEl"
    v-bind="props"
    v-model="content"
    :name="name || identifier"
    type="text"
    :min-length="5"
    :max-length="150"
    :pattern="/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/"
    invalid-pattern-message="This has to be a valid email address."
    left-icon="Mail"
  />
</template>
