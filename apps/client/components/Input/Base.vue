<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string;
    identifier: string;
    default?: string;
    name?: string;
    type?: string;
    placeholder?: string;
    hint?: string;
    label?: string;

    minLength?: number;
    maxLength?: number;

    notRequired?: boolean;

    pattern?: RegExp;
    invalidPatternMessage?: string;

    noAutoComplete?: boolean;
    focusOnMount?: boolean;

    leftIcon?: string;
    rightIcon?: string;
    secondRightIcon?: string;
    isRightIconClickable?: boolean;
    isLeftIconClickable?: boolean;
    isSecondRightIconClickable?: boolean;
  }>(),
  {
    notRequired: false,
    type: "text",
    minLength: 3,
    maxLength: 150,
    invalidPatternMessage: "This is an invalid value.",
    noAutoComplete: false,
    focusOnMount: false,
    isRightIconClickable: false,
    isSecondRightIconClickable: false,
    isLeftIconClickable: false,
    default: undefined,
    name: undefined,
    placeholder: undefined,
    hint: undefined,
    label: undefined,
    pattern: undefined,
    leftIcon: undefined,
    rightIcon: undefined,
    secondRightIcon: undefined,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: unknown): void;
  (e: "left-icon-click"): void;
  (e: "right-icon-click"): void;
  (e: "second-right-icon-click"): void;
}>();

const content = useModelWrapper(props, emit);

const inputBaseRef = ref<HTMLInputElement | null>(null);

const isFocus = ref(false);
const errorMessage = ref(null as null | string);

const isErred = computed(() => !!errorMessage.value);
const trimmedValue = computed(() => content.value.trim());
const placeholderValue = computed(() => {
  if (!props.label) return props.placeholder;
  if (isFocus.value) {
    if (props.placeholder) return props.placeholder;
    if (props.hint) return `eg. ${props.hint}`;
  }
  return "";
});

function focus() {
  inputBaseRef.value?.focus();
}

function handleIconClick(side: "right" | "second-right" | "left") {
  if (side === "right") emit("right-icon-click");
  if (side === "second-right") emit("second-right-icon-click");
  if (side === "left") emit("left-icon-click");
  focus();
}

function onFocus() {
  isFocus.value = true;
}

function onBlur() {
  isFocus.value = false;
}

function clear() {
  content.value = "";
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
    if (props.pattern && !trimmedValue.value.match(props.pattern))
      return setError(props.invalidPatternMessage);
  }
  return clearError();
}

onBeforeMount(() => {
  if (props.default) content.value = props.default;
});

onMounted(() => {
  if (props.focusOnMount) focus();
});

defineExpose({
  clear,
  focus,
  validate,
  errorMessage,
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
      'input-wrapper--has-left-icon': !!leftIcon,
      'input-wrapper--has-second-right-icon': !!secondRightIcon,
    }"
  >
    <GlassCard
      tint="background-tertiary"
      no-back-shape
      :opacity="0.4"
      :blur="5"
      border-radius="md"
      class="input-glass"
    >
      <div>
        <input
          :id="identifier"
          ref="inputBaseRef"
          v-model="content"
          class="input"
          :type="type"
          :name="name || identifier"
          :placeholder="placeholderValue"
          :autocomplete="noAutoComplete ? 'off' : 'on'"
          @focus="onFocus"
          @blur="onBlur"
          @input="onInput"
        />
      </div>
    </GlassCard>

    <label v-if="label" :for="identifier" class="label">
      {{ label }}
      <span v-if="notRequired" class="label__optional">(optional)</span>
    </label>

    <transition name="fade">
      <span v-if="!!errorMessage" class="error">{{ errorMessage }}</span>
    </transition>

    <transition
      v-for="side of ['right', 'second-right', 'left']"
      :key="side"
      name="fade"
    >
      <Icon
        v-if="
          (side === 'right' && rightIcon) ||
          (side === 'second-right' && secondRightIcon) ||
          (side === 'left' && leftIcon)
        "
        :name="side === 'right' ? rightIcon! : side === 'second-right' ? secondRightIcon ! : leftIcon!"
        size="28px"
        :clickable="
          (side === 'left' && isLeftIconClickable) ||
          (side === 'right' && isRightIconClickable) ||
          (side === 'second-right' && isSecondRightIconClickable)
        "
        :focusable="
          (side === 'left' && isLeftIconClickable) ||
          (side === 'right' && isRightIconClickable) ||
          (side === 'second-right' && isSecondRightIconClickable)
        "
        :class="`icon icon--${side}`"
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
      +size(100% 45px)
      +br-md

  .input
    +clr-bg(none)
    +size(100%)
    +br-md
    +brdr(none)
    +pa(10px 20px)
    +tran
    +input-search-reset
    +focus-effect(input, focus focus-visible)

  +m(has-label)
    +mt(15px)

  .label
    +tran
    +center-v
    left: 20px
    +clr-txt
    +fnt-medium
    +no-select
    opacity: 0.6
    +e(optional)
      +fnt-xs
      +tran

  +m(hover-label)
    .label
      top: -10px
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
    +pos-a(left 10px top 50px)
    +clr-txt(error)
    +fnt-xs

  +m(has-left-icon)
    .label
      left: 50px

  @each $side in right second-right left
    .icon--#{$side}
      +center-v
      #{$side}: 12px

    &--has-#{$side}-icon .input
      padding-#{$side}: 50px

  .icon--second-right
    +center-v
    right: 47px
  &--has-second-right-icon .input
    padding-right: 75px
</style>
