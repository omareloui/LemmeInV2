<script setup lang="ts">
import { useTagsStore } from "store/useTags";

import type { ClientTag as Tag, UpdateTag } from "types";

const TAG_NAME_PATTERN = /^[^\s!@#$%^&=.,*-+`~|:;?"'/\\[\](){}<>]+$/;

const tagsStore = useTagsStore();

const props = defineProps<{ tag: Tag }>();
const emit = defineEmits<{ (e: "close-dialogue"): void }>();

const formData = reactive({
  name: props.tag.name || "",
  color: props.tag.color || "",
});

const componentsHandler = useFormComponents();
const { addComponentRef } = componentsHandler;

async function updateTag(options: unknown) {
  const succeeded = await tagsStore.updateTag({
    ...(options as UpdateTag),
    id: props.tag._id,
  });
  if (succeeded) emit("close-dialogue");
}

async function removeTag() {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _id, name } = props.tag;
  const succeeded = await tagsStore.deleteTag({ tagId: _id, tagName: name });
  if (succeeded) emit("close-dialogue");
}
</script>

<template>
  <div class="update-tag">
    <h2 class="update-tag__heading">
      Edit
      <span class="update-tag__heading-tag-name">“{{ tag.name }}”</span> Tag
    </h2>
    <FormWrapper
      class="update-tag__form"
      submit-button-text="Update Tag"
      :submit-function="updateTag"
      :components-handler="componentsHandler"
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
        :default="props.tag.color"
        identifier="color"
      />
    </FormWrapper>

    <FormWrapper
      class="update-tag__remove"
      submit-button-text="Remove Tag"
      :submit-function="removeTag"
      :components-handler="{ inputComponents: [], clearComponents: () => {} }"
      is-danger
    ></FormWrapper>
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
