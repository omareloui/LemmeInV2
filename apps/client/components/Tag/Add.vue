<script setup lang="ts">
import { useTagsStore } from "store/useTags";
import type { Structure } from "~~/components/Form/Generator.vue";
import type { AddTag } from "~~/types";

const tagsStore = useTagsStore();

const formFields = [
  {
    id: "name",
    fieldType: "Base" as const,
    props: {
      modelValue: "",
      label: "Tag name",
      minLength: 2,
      hint: "social_media",
      pattern: /^[^\s!@#$%^&=.,*-+`~|:;?"'/\\[\](){}<>]+$/,
      invalidPatternMessage:
        "You can't use spaces or special characters in the tag",
      focusOnMount: true,
    },
  },
  { id: "color", fieldType: "TagColor" as const, props: { modelValue: "" } },
] as Structure;

const emit = defineEmits<{ (e: "close-dialogue"): void }>();

async function addTag(options: unknown): Promise<void> {
  const succeeded = await tagsStore.addTag(options as AddTag);
  if (succeeded) emit("close-dialogue");
}
</script>

<template>
  <div class="add-tag">
    <h2 class="add-tag__heading">Add Tag</h2>
    <FormGenerator
      :form-fields="formFields"
      submit-button-text="Create Tag"
      :submit-function="addTag"
    />
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.add-tag
  +pa(55px 30px)

  +e(heading)
    +clr-txt(primary)
    +center-text
    +fnt-5xl
</style>
