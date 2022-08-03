<script setup lang="ts">
const inputFile = ref<HTMLInputElement | null>(null);

const props = withDefaults(
  defineProps<{
    modelValue: File[];
    notRequired?: boolean;
    label?: string;
    isMulti?: boolean;
    acceptFiles?: string;
    imagesOnly?: boolean;
    identifier?: string;
    dontKeepPrevious: boolean;
    heading?: string;
    headingTag?: string;
  }>(),
  {
    label: undefined,
    notRequired: false,
    isMulti: false,
    acceptFiles: "*",
    imagesOnly: false,
    identifier: "file",
    dontKeepPrevious: false,
    heading: undefined,
    headingTag: "h3",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: File[]): void;
}>();

const content = useModelWrapper(props, emit);

const errorMessage = ref("");

const fileTypes = props.imagesOnly
  ? "image/png,image/jpg,image/jpeg,image/svg+xml"
  : props.acceptFiles;

const isErred = computed(() => !!errorMessage.value);

function chooseFile() {
  inputFile.value?.click();
}

function clearError() {
  errorMessage.value = "";
}

function updateSelected(e: Event) {
  if (isErred) clearError();

  const selectedFiles = (e.target as HTMLInputElement)?.files!;

  if (!e.target || selectedFiles)
    if (!props.dontKeepPrevious) content.value = props.modelValue;
    else content.value = [];

  {
    let files;
    if (!props.isMulti) files = [Array.from(selectedFiles)[0]];
    else if (!props.dontKeepPrevious)
      files = [...content.value, ...Array.from(selectedFiles)];
    else files = Array.from(selectedFiles);

    content.value = files;
  }
}

function removeFile(fileIndex: number) {
  if (!props.isMulti) content.value = [];

  content.value = content.value.filter((_, i) => i !== fileIndex);
}

function clear() {
  content.value = [];
}

function validate() {
  if (!props.notRequired && content.value.length === 0)
    errorMessage.value = "props field is required";
}

defineExpose({
  clear,
  validate,
  removeFile,
});
</script>

<template>
  <div
    class="input-file-wrapper"
    :class="{ 'input-file-wrapper--has-error': isErred }"
  >
    <Component
      :is="headingTag"
      v-if="heading"
      class="input-file-wrapper__heading"
    >
      {{ heading }}
    </Component>
    <div class="input-file-wrapper__button">
      <label
        class="input-label"
        :for="identifier"
        tabindex="0"
        role="button"
        :aria-label="`${imagesOnly ? 'Image' : 'File'} Upload`"
        @keyup.space="chooseFile"
        @keydown.space.prevent
      >
        {{ label }}
      </label>
      <input
        :id="identifier"
        ref="inputFile"
        class="input-field"
        type="file"
        :accept="fileTypes"
        :multiple="isMulti"
        @change="updateSelected"
      />

      <Transition name="fade">
        <span v-if="isErred" tag="span" class="error">{{ errorMessage }}</span>
      </Transition>
    </div>
  </div>
</template>

<style lang="sass" scoped>
// @use "~/assets/scss/mixins" as *

// .input-file-wrapper
//   +tran
//   +pos-r
//   &__heading
//     +clr-txt(primary,  70)
//     +tran(color, 0.1s)
//   .input-label
//     +clickable
//     +clr-bg(primary, 90)
//     +clr-txt(invert)
//     +pa(5px 10px)
//     +br-md
//     +focus-effect
//     display: inline-block
//   .input-field
//     display: none

//   .error
//     +pos-a(left 25px bottom -20px)
//     +clr-txt(error)
//     +fnt-xs
//     line-height: 10px

//   &--has-error
//     +mb(30px)
//     .input-label
//       +clr-bg(error)
//     .input-file-wrapper__heading
//       +clr-txt(error)
</style>
