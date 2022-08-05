<script setup lang="ts">
import { useTagsStore } from "store/useTags";
import type { AddTag } from "types";

const formData = reactive<AddTag>({ name: "", color: null });

const TAG_NAME_PATTERN = /^[^\s!@#$%^&=.,*-+`~|:;?"'/\\[\](){}<>]+$/;

const tagsStore = useTagsStore();

const emit = defineEmits<{ (e: "close-dialogue"): void }>();

const { inputComponents, clearComponents, addComponentRef } =
  useFormComponents();

async function addTag(options: unknown) {
  const succeeded = await tagsStore.addTag(options as AddTag);
  if (succeeded) emit("close-dialogue");
}
</script>

<template>
  <div class="add-tag">
    <h2 class="add-tag__heading">Add Tag</h2>
    <FormWrapper
      submit-button-text="Create Tag"
      :submit-function="addTag"
      :components="inputComponents"
      @clear-components="clearComponents"
    >
      <InputBase
        :ref="addComponentRef"
        v-model="formData.name"
        identifier="name"
        label="Tag name"
        :min-length="2"
        hint="social_media"
        :pattern="TAG_NAME_PATTERN"
        invalid-pattern-message="You can't use spaces or special characters in the tag"
        focus-on-mount
      />
      <InputTagColor
        :ref="addComponentRef"
        v-model="formData.color"
        identifier="color"
      />
    </FormWrapper>
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
