<script setup lang="ts">
import type { InputCheckOption } from "types";

const { $notify } = useNuxtApp();

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    notRequired?: boolean;
    heading?: string;
    headingTag?: string;
    options: InputCheckOption[];
    mustHaveOneAtLeast?: boolean;
  }>(),
  {
    notRequired: false,
    heading: undefined,
    headingTag: "h3",
    mustHaveOneAtLeast: false,
  },
);

const emit = defineEmits<{ (e: "update:modelValue", value: unknown): void }>();

const reactiveOptions = reactive(props.options);

const content = useModelWrapper(props, emit);

const errorMessage = ref("");

const isErred = computed(() => !!errorMessage.value);

function clearError() {
  errorMessage.value = "";
}

function getChecked() {
  return reactiveOptions.filter(x => x.isChecked).map(x => x.id);
}

function focusOnCheckbox(id: string) {
  const label = document.getElementById(id) as HTMLElement;
  (
    label?.previousElementSibling as HTMLElement & { focus: () => void }
  )?.focus();
}

function validateWillHaveOneCheckedIfNeeded(option: InputCheckOption) {
  const hasOneTrue = !!reactiveOptions.find(x => x !== option && x.isChecked);
  if (props.mustHaveOneAtLeast && !hasOneTrue)
    throw new Error("Must have at least one selected");
}

function changeCheckbox(option: InputCheckOption) {
  if (isErred.value) clearError();

  try {
    validateWillHaveOneCheckedIfNeeded(option);

    reactiveOptions.forEach(x => {
      // eslint-disable-next-line no-param-reassign
      if (option.id === x.id) x.isChecked = !x.isChecked;
    });

    content.value = getChecked();

    focusOnCheckbox(option.id);
  } catch (e) {
    $notify.error(useErrorMessage(e));
  }
}

function clear() {
  reactiveOptions.forEach(x => {
    // eslint-disable-next-line no-param-reassign
    x.isChecked = false;
  });
  content.value = [];
}

function validate() {
  if (!props.notRequired && content.value?.length === 0)
    errorMessage.value = "This field can't be empty.";
}

defineExpose({
  clear,
  validate,
});
</script>

<template>
  <div
    class="checker-wrapper"
    :class="{ 'checker-wrapper--has-error': isErred }"
  >
    <Component :is="headingTag" v-if="heading" class="checker-wrapper__heading">
      {{ heading }}
    </Component>
    <div class="checker-wrapper__options">
      <div v-for="option in reactiveOptions" :key="option.id" class="option">
        <GlassCard
          class="option__checkbox"
          :class="{ 'option__checkbox--is-checked': option.isChecked }"
          role="checkbox"
          :aria-labelledby="option.id"
          :aria-checked="option.isChecked ? 'true' : 'false'"
          focusable
          tint="background-tertiary"
          back-shape="circle"
          :back-shape-color="
            isErred
              ? 'error'
              : option.isChecked
              ? 'success'
              : 'background-tertiary'
          "
          float
          center-content
          @click="changeCheckbox(option)"
          @keyup:space="changeCheckbox(option)"
        >
          <div>
            <Transition name="input-check">
              <Icon
                v-if="option.isChecked"
                name="Check"
                class="option__checkbox-icon"
                size="20px"
              ></Icon>
            </Transition>
          </div>
        </GlassCard>
        <label
          :id="option.id"
          class="option__label"
          @click="changeCheckbox(option)"
        >
          {{ option.value }}
        </label>
      </div>
    </div>
    <Transition name="fade">
      <span v-if="isErred" class="error">{{ errorMessage }}</span>
    </Transition>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

$checker-size: 20px

.checker-wrapper
  +pos-r
  +tran
  +e(heading)

  *
    +fnt(input)

  +e(options)
    +auto-fit(100px, $gap: 20px, $center: false)

  .option
    +grid($center-h: true)
    +pa(10px)
    +e(checkbox)
      +pos-r
      +mb(10px)
      +clickable
      +size(35px)
      +br-md
      > div
        +size(100%)
    +e(checkbox-icon)
      +center-inset
    +e(label)
      +clickable
      +center-text

  .error
    +pos-a(left 25px bottom -20px)
    +clr-txt(error)
    +fnt-xs
    line-height: 10px

  +m(has-error)
    +mb(30px)
    .checker-wrapper__heading
      +clr-txt(error)
    .option
      +e(label)
        +clr-txt(error)
</style>
