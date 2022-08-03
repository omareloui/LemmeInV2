<script setup lang="ts">
const textareaInputEl = ref<HTMLTextAreaElement | null>(null);

const props = withDefaults(
  defineProps<{
    modelValue: string;
    identifier: string;
    default?: string;
    name?: string;
    placeholder?: string;
    hint?: string;
    label?: string;

    minLength?: number;
    maxLength?: number;

    notRequired?: boolean;

    focusOnMount?: boolean;

    rows?: number;

    leftIcon?: string;
    rightIcon?: string;
    isRightIconClickable?: boolean;
    isLeftIconClickable?: boolean;
  }>(),
  {
    notRequired: false,
    minLength: 3,
    maxLength: 150,
    invalidPatternMessage: "This is an invalid value.",
    noAutoComplete: false,
    focusOnMount: false,
    rows: 5,
    isRightIconClickable: false,
    isLeftIconClickable: false,
    default: undefined,
    name: undefined,
    placeholder: undefined,
    hint: undefined,
    label: undefined,
    pattern: undefined,
    leftIcon: undefined,
    rightIcon: undefined,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: unknown): void;
  (e: "left-icon-click"): void;
  (e: "right-icon-click"): void;
}>();

const content = useModelWrapper(props, emit);

const isFocus = ref(false);
const errorMessage = ref("");

const isErred = computed(() => !!errorMessage.value);
const trimmedValue = computed(() => content.value);
const placeholderValue = computed(() => {
  if (props.label) return props.placeholder;

  if (isFocus.value) {
    if (props.placeholder) return props.placeholder;
    if (props.hint) return `eg. ${props.hint}`;
  }
  return "";
});

function onInit() {
  if (props.default) content.value = props.default;
}

function onFocus() {
  isFocus.value = true;
}
function onBlur() {
  isFocus.value = false;
}
function focus() {
  textareaInputEl.value?.focus();
}
function clear() {
  content.value = "";
}

function handleIconClick(side: "right" | "left") {
  if (side === "right") emit("right-icon-click");
  if (side === "left") emit("left-icon-click");
  focus();
}

function setError(message: string) {
  errorMessage.value = message;
}
function clearError() {
  setError("");
}

function onInput() {
  if (isErred.value) clearError();
}

function validate() {
  if (
    !props.notRequired ||
    (props.notRequired && trimmedValue.value.length > 0)
  ) {
    if (!trimmedValue.value) return setError("This field can't be empty.");
    if (trimmedValue.value.length > props.maxLength)
      return setError(
        `The value can't be more than ${props.maxLength} characters long.`,
      );
    if (trimmedValue.value.length < props.minLength)
      return setError(
        `The value can't be less than ${props.minLength} characters long.`,
      );
  }
  return clearError();
}

defineExpose({
  clear,
  focus,
  validate,
  isErred,
  errorMessage,
});

onInit();
onMounted(() => {
  if (props.focusOnMount) focus();
});
</script>

<template>
  <div
    class="input-wrapper"
    :class="{
      'input-wrapper--hover-label': content || isFocus,
      'input-wrapper--has-label': !!label,
      'input-wrapper--has-error': !!errorMessage,
      'input-wrapper--has-left-icon': !!leftIcon,
      'input-wrapper--has-right-icon': !!rightIcon,
    }"
  >
    <glass-card
      class="input-glass"
      tint="background-tertiary"
      no-back-shape
      :opacity="0.4"
      :blur="5"
      border-radius="md"
    >
      <div>
        <textarea
          :id="identifier"
          :value="modelValue"
          class="input"
          :name="name || identifier"
          :placeholder="placeholderValue"
          :rows="rows"
          :maxlength="maxLength"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
        ></textarea>
      </div>
    </glass-card>

    <label v-if="label" :for="identifier" class="label">
      {{ label }}
      <span v-if="notRequired" class="label__optional">(optional)</span>
    </label>

    <transition name="fade">
      <span v-if="!!errorMessage" class="error">{{ errorMessage }}</span>
    </transition>

    <transition
      v-for="side of (['right', 'left'] as const)"
      :key="side"
      name="fade"
    >
      <icon
        v-if="
          (side === 'right' && !!rightIcon) || (side === 'left' && leftIcon)
        "
        :class="`icon icon--${side}`"
        :name="side === 'right' ? rightIcon! : leftIcon!"
        size="28px"
        :is-clickable="
          (side === 'left' && isLeftIconClickable) ||
          (side === 'right' && isRightIconClickable)
        "
        :is-focusable="
          (side === 'left' && isLeftIconClickable) ||
          (side === 'right' && isRightIconClickable)
        "
        :fill="!!errorMessage ? 'error' : undefined"
        @click="handleIconClick(side)"
        @keyup:enter="handleIconClick(side)"
        @keyup:space="handleIconClick(side)"
      />
    </transition>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.input-wrapper
  +pos-r
  +tran

  *
    +fnt(input)

  .input-glass
    > div
      +br-md

  .input
    +scroll
    +size(100%)
    +br-md
    +block
    resize: none
    +clr-bg(none)
    +brdr(none)
    +pa(10px 20px)
    +tran
    +input-search-reset
    +focus-effect(input, focus focus-visible)

  +m(has-label)
    +mt(15px)

  .label
    +tran
    +pos-a(top 10px left 10px)
    +clr-txt
    +fnt-medium
    +no-select
    opacity: 0.6
    +e(optional)
      +fnt-xs
      +tran

  +m(hover-label)
    .label
      top: -19px
      left: 5px !important
      opacity: 1
      +fnt-xs
      +e(optional)
        opacity: 0

  +m(has-error)
    +mb(15px)
    .label
      +clr-txt(error)

    .input
      +clr(error, border-color)

  .error
    +pos-a(left 10px bottom 0px)
    transform: translateY(calc(100% + 5px))
    +clr-txt(error)
    +fnt-xs

  +m(has-left-icon)
    .label
      left: 50px

  @each $side in right left
    .icon--#{$side}
      +pos-a(top 10px)
      #{$side}: 12px

    &--has-#{$side}-icon
      .input
        padding-#{$side}: 50px
</style>
