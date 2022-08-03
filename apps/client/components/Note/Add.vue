<script setup lang="ts">
import type { AddNote } from "types";
import type { Structure } from "~~/components/Form/Generator.vue";
import { useNotesStore } from "../../store/useNotes";

const emit = defineEmits<{ (e: "close-dialogue"): void }>();

const formFields = [
  {
    id: "title",
    fieldType: "Base" as const,
    props: {
      modelValue: "",
      label: "Title",
      minLength: 2,
      notRequired: true,
    },
  },
  {
    id: "body",
    fieldType: "Textarea",
    props: {
      modelValue: "",
      label: "Note",
      minLength: 2,
      rows: 10,
      focusOnMount: true,
      notRequired: true,
    },
  },
  // TODO:
  // {
  //   id: "tags",
  //   fieldType: "Tags",
  //   type: "tags",
  //   props: { modelValue: [], leftIcon: "", notRequired: true },
  // },
] as Structure;

async function addNote(options: AddNote) {
  const succeeded = await useNotesStore().addNote(options);
  if (succeeded) emit("close-dialogue");
}
</script>

<template>
  <div class="add-note">
    <h2 class="add-note__heading">Add Note</h2>
    <FormGenerator
      :form-fields="formFields"
      submit-button-text="Create Note"
      :submit-function="addNote"
    />
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
