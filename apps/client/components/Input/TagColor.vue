<script setup lang="ts">
import { TagColor } from "~~/types";
import tagColors from "~~/config/tag-colors";

const props = withDefaults(
  defineProps<{
    modelValue: TagColor | "";
    identifier: string;
    default?: string;
    notRequired?: boolean;
    doNotSelectDefault?: boolean;
  }>(),
  { notRequired: false, doNotSelectDefault: false, default: undefined },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: unknown): void;
}>();

const content = useModelWrapper(props, emit);
const errorMessage = ref("");

const isErred = computed(() => !!errorMessage.value);

function setError(message: string) {
  errorMessage.value = message;
}
function clearError() {
  setError("");
}

function clear() {
  content.value = "";
}

function select(color: TagColor) {
  if (isErred.value) clearError();

  if (color === content.value) clear();
  else content.value = color;
}

function validate() {
  if (!props.notRequired && !content.value)
    setError("You have to select a color.");
}

if (!props.doNotSelectDefault) select(tagColors[0]);

if (props.default) {
  const defaultColor = tagColors.find(x => x === props.default);
  if (defaultColor) select(defaultColor);
}

defineExpose({
  clear,
  validate,
  errorMessage,
});
</script>

<template>
  <div
    :id="identifier"
    class="input-color"
    :class="{
      'input-color--has-error': isErred,
    }"
  >
    <div class="colors">
      <div
        v-for="(color, index) in tagColors"
        :key="index"
        tabindex="0"
        class="colors__color"
        :class="{ 'colors__color--selected': color === content }"
        :style="{ '--color': `var(--clr-${color})` }"
        @click="select(color)"
        @keyup.space="select(color)"
        @keyup.enter="select(color)"
      ></div>
    </div>

    <Transition name="fade">
      <span v-if="isErred" class="input-color__error">{{ errorMessage }}</span>
    </Transition>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.input-color
  +pos-r
  +mt(20px)
  +tran

  +m(has-error)
    +mb(20px)

  +e(error)
    +pos-a(left 10px bottom 0)
    transform: translateY(100%)
    +clr-txt(error)
    +fnt-xs

  .colors
    +auto-fit(50px, 10px)
    +e(color)
      +pos-r
      +clr-bg(--color)
      +size(40px)
      +br-md
      +clickable
      +focus-effect
      &::after
        content: ""
        +center
        +clr-bg(light)
        +br-cr
        +tran
        +size(20px)
        opacity: 0

      +m(selected)
        &::after
          opacity: 1
</style>
