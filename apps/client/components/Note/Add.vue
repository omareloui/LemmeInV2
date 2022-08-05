<script setup lang="ts">
import type { AddNote } from "types";
import { useNotesStore } from "../../store/useNotes";

const emit = defineEmits<{ (e: "close-dialogue"): void }>();

const formData = reactive({ title: "", body: "", tags: [] });

const { inputComponents, addComponentRef, clearComponents } =
  useFormComponents();

async function addNote(options: AddNote) {
  const succeeded = await useNotesStore().addNote(options);
  if (succeeded) emit("close-dialogue");
}
</script>

<template>
  <div class="add-note">
    <h2 class="add-note__heading">Add Note</h2>
    <FormWrapper
      submit-button-text="Create Note"
      :submit-function="addNote"
      :components="inputComponents"
      @clear-components="clearComponents"
    >
      <InputBase
        :ref="addComponentRef"
        v-model="formData.title"
        identifier="title"
        label="Title"
        :min-length="2"
        not-required
      />
      <InputTextarea
        :ref="addComponentRef"
        v-model="formData.body"
        identifier="body"
        label="Note"
        :min-length="2"
        :rows="10"
        focus-on-mount
        not-required
      />
      <InputTags
        :ref="addComponentRef"
        v-model="formData.tags"
        left-icon=""
        not-required
      />
    </FormWrapper>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.add-note
  +pa(55px 30px)

  +e(heading)
    +clr-txt(primary)
    +center-text
    +fnt-5xl
</style>
