<script setup lang="ts">
const inputEl = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);

const props = withDefaults(
  defineProps<{
    modelValue: string;
    type?: string;
    placeholder?: string;
    isTextarea?: boolean;
    default?: string;
  }>(),
  {
    type: "text",
    isTextarea: false,
    placeholder: undefined,
    default: undefined,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: unknown): void;
}>();

const content = useModelWrapper(props, emit);

if (props.default) content.value = props.default;

function resize() {
  if (!inputEl.value || !props.isTextarea) return;
  inputEl.value.style.height = "5px";
  inputEl.value.style.height = `${inputEl.value.scrollHeight}px`;
}

function onInput(e: unknown) {
  const newValue = (e as { target: HTMLInputElement }).target.value;
  content.value = newValue;
  if (props.isTextarea) resize();
}

function moveCursorToEnd() {
  if (!inputEl.value) return;
  inputEl.value.selectionStart = content.value.length;
  inputEl.value.selectionEnd = content.value.length;
}

function focus() {
  if (!inputEl.value) return;
  inputEl.value.focus();
  moveCursorToEnd();
}

onMounted(() => resize());
defineExpose({ focus });
</script>

<template>
  <Component
    :is="isTextarea ? 'textarea' : 'input'"
    ref="inputEl"
    v-model="content"
    class="input-minimal"
    :class="{ 'input-minimal--textarea': isTextarea }"
    v-bind="{ placeholder }"
    :type="isTextarea ? undefined : type"
    @input="onInput"
    >{{ isTextarea ? content : undefined }}</Component
  >
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.input-minimal
  +block
  +clr-bg(none)
  +w(100%)
  border: none
  +fnt(body)
  +no-scroll
  &:focus
    outline: none

  +m(textarea)
    +h(auto)
    resize: none
</style>
