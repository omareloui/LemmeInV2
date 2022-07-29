<script setup lang="ts">
import { useTagsStore } from "~~/store/useTags";

import type { Tag } from "~~/types";

const route = useRoute();

const tagsStore = useTagsStore();

const searchQuery = ref((route.query.search as string | undefined) || "");
const searchResult = reactive<{ tags: Tag[] }>({ tags: [] });

const isAddTagOpen = ref(false);
const isEditTagOpen = ref(false);
const tagToEdit = ref<Tag | null>(null);

function updateSearchResult(tags: Tag[]) {
  searchResult.tags = tags;
}

function closeAddTag() {
  isAddTagOpen.value = false;
}
function closeEditTag() {
  isEditTagOpen.value = false;
}
function closeDialogues() {
  closeAddTag();
  closeEditTag();
}

// Add tag
function openAddTag() {
  closeDialogues();
  isAddTagOpen.value = true;
}

// Edit tag
function openEditTag() {
  closeDialogues();
  isEditTagOpen.value = true;
}
function editTag(tag: Tag) {
  tagToEdit.value = tag;
  openEditTag();
}

watch(searchQuery, newValue => {
  const router = useRouter();
  const query: typeof route.query = { ...route.query };
  if (newValue) query.search = newValue;
  else delete query.search;
  router.push({
    path: route.path,
    query,
  });
});
</script>

<template>
  <Container padding-bottom class="tags-page">
    <template #heading>Tags</template>

    <InputSearch
      v-model="searchQuery"
      placeholder="Search tags..."
      class="search-input"
      search-keys="name"
      :search-elements="tagsStore.tags"
      focus-on-mount
      @search-result="updateSearchResult($event as Tag[])"
      @clear="searchQuery = ''"
    />

    <ButtonMain large cta block class="add-button" @click="openAddTag"
      >Add new tag</ButtonMain
    >

    <main>
      <TransitionGroup name="list" class="tags" tag="div">
        <Tag
          v-for="tag in searchQuery ? searchResult.tags : tagsStore.tags"
          :key="tag.id"
          class="tag"
          v-bind="{ tag }"
          @edit-tag="editTag"
        />
      </TransitionGroup>
    </main>

    <Dialogue :is-shown="isAddTagOpen" @close="closeAddTag">
      <TagAdd @close-dialogue="closeAddTag" />
    </Dialogue>
    <Dialogue :is-shown="isEditTagOpen" @close="closeEditTag">
      <TagEdit :tag="tagToEdit!" @close-dialogue="closeEditTag" />
    </Dialogue>
  </Container>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.tags-page
  .search-input
    +my(20px)
    +lt-tablet
      +mx(min(100px, 5vw))

  main
    .tags
      +grid
      .tag
        &:not(:last-child)
          +mb(20px)
      +lt-tablet
        grid-template-columns: repeat(2, 1fr)
        .tag
          &:nth-child(even)
            +ml(20px)
          &:nth-last-child(2):nth-child(odd)
            +mb(0)

  .add-button
    +mb(20px)
    +mx(auto)
    +lt-tablet
      +w(max 300px)
</style>
