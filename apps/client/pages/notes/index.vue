<script setup lang="ts">
import { useNotesStore } from "store/useNotes";

import type { ClientNote as Note } from "types";

const route = useRoute();
const notesStore = useNotesStore();

const searchQuery = ref<string>((route.query.search as string) || "");
const searchResult = reactive<{ notes: Note[] }>({ notes: [] });
const isAddNoteOpen = ref(false);

function updateSearchResult(notes: Note[]) {
  searchResult.notes = notes;
}

function openAddNote() {
  isAddNoteOpen.value = true;
}
function closeAddNote() {
  isAddNoteOpen.value = false;
}

useMatchSearchQuery(searchQuery);
</script>

<template>
  <Container padding-bottom class="notes-page">
    <template #heading>Secure Notes</template>

    <InputSearch
      v-model="searchQuery"
      placeholder="Search notes..."
      class="search-input"
      :search-keys="['body', 'title']"
      :search-elements="notesStore.notes"
      @search-result="updateSearchResult($event as Note[])"
      @clear="searchQuery = ''"
    />

    <ButtonMain large cta block class="add-button" @click="openAddNote"
      >Add new note</ButtonMain
    >

    <main>
      <TransitionGroup name="list" class="notes" tag="div">
        <Note
          v-for="note in searchQuery ? searchResult.notes : notesStore.notes"
          :key="note._id"
          class="note"
          v-bind="{ note }"
        />
      </TransitionGroup>
    </main>

    <Dialogue :is-shown="isAddNoteOpen" @close="closeAddNote">
      <NoteAdd @close-dialogue="closeAddNote" />
    </Dialogue>
  </Container>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.notes-page
  .search-input
    +my(20px)
    +lt-tablet
      +mx(min(100px, 5vw))

  main
    .notes
      +grid
      .note
        &:not(:last-child)
          +mb(20px)

  .add-button
    +mb(20px)
    +mx(auto)
    +lt-tablet
      +w(max 300px)
</style>
