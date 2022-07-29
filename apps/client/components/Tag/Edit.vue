<script setup lang="ts">
import { useTagsStore } from "store/useTags";

import type { Tag, UpdateTag } from "types";
import type { Structure } from "~~/components/Form/Generator.vue";

const tagsStore = useTagsStore();

const props = defineProps<{ tag: Tag }>();
const emit = defineEmits<{ (e: "close-dialogue"): void }>();

const formFields = [
  {
    id: "name",
    fieldType: "Base" as const,
    props: {
      modelValue: "",
      default: props.tag.name,
      label: "Tag name",
      minLength: 2,
      hint: "social_media",
      pattern: /^[^\s!@#$%^&=.,*-+`~|:;?"'/\\[\](){}<>]+$/,
      invalidPatternMessage:
        "You can't use spaces or special characters in the tag",
      focusOnMount: true,
    },
  },
  {
    id: "color",
    fieldType: "TagColor" as const,
    default: props.tag.color,
    props: { modelValue: "" },
  },
] as Structure;

async function updateTag(options: unknown) {
  const succeeded = await tagsStore.updateTag({
    ...(options as UpdateTag),
    id: props.tag.id,
  });
  if (succeeded) emit("close-dialogue");
}

async function removeTag() {
  const { id, name } = props.tag;
  const succeeded = await tagsStore.deleteTag({ tagId: id, tagName: name });
  if (succeeded) emit("close-dialogue");
}
</script>

<template>
  <div class="update-tag">
    <h2 class="update-tag__heading">
      Edit
      <span class="update-tag__heading-tag-name">“{{ tag.name }}”</span> Tag
    </h2>
    <FormGenerator
      class="update-tag__form"
      :form-fields="formFields"
      submit-button-text="Update Tag"
      :submit-function="updateTag"
    />

    <FormGenerator
      class="update-tag__remove"
      :form-fields="[]"
      submit-button-text="Remove Tag"
      :submit-function="removeTag"
      danger
    />
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.update-tag
  +pa(55px 30px)

  +e(heading)
    +clr-txt(primary)
    +center-text

  +e(heading-tag-name)
    +break-word

  +e(remove)
    +mt(40px)
</style>
