<script setup lang="ts">
import type { Note } from "types";
import { useNotesStore } from "~~/store/useNotes";

const route = useRoute();
const router = useRouter();
const notesStore = useNotesStore();

const n = await notesStore.getNote(route.params.noteId as string);

const note = ref<Note>(n);

const hasTags = computed(() => !!note.value.tags && note.value.tags.length > 0);

const showCreatedAt = ref(false);

const isEditing = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const editData = reactive<{ title: string; body: string; tags: string[] }>({
  title: note.value.title || "",
  body: note.value.body || "",
  tags: note.value.tags ? note.value.tags.map(x => x.id) : [],
});

function closeEditing() {
  isEditing.value = false;
}

function cancel() {
  closeEditing();
  editData.title = note.value.title || "";
  editData.body = note.value.body || "";
  editData.tags = note.value.tags ? note.value.tags.map(x => x.id) : [];
}

function onKeyup(e: KeyboardEvent) {
  if (isEditing.value && e.code === "Escape") cancel();
}

async function openEditing() {
  isEditing.value = true;
  await nextTick();
  // TODO:
  // this.$refs.bodyInput.focus()
}

async function save() {
  if (isSaving.value) return;
  isSaving.value = true;
  const { title, body, tags } = editData;
  const newNote = await notesStore.updateNote({
    id: note.value.id,
    title,
    body,
    tags,
  });
  if (newNote) {
    note.value = newNote;
    closeEditing();
  }
  isSaving.value = false;
}

async function deleteNote() {
  if (isDeleting.value) return;
  isDeleting.value = true;
  const deleted = await notesStore.deleteNote(note.value.id);
  if (deleted) router.push("/notes");
  isDeleting.value = false;
}

onMounted(() => window.addEventListener("keyup", onKeyup));
onUnmounted(() => window.removeEventListener("keyup", onKeyup));
</script>

<template>
  <Container
    padding-bottom
    no-heading
    class="note"
    :class="{
      'note--no-heading': !note.title,
      'note--no-body': !note.body,
      'note--is-editing': isEditing,
    }"
  >
    <!-- Edit button -->
    <Transition name="fade">
      <ButtonBase
        v-if="!isEditing"
        class="note__edit-button"
        @click="openEditing"
      >
        <icon name="edit" />
      </ButtonBase>
      <ButtonBase v-else class="note__edit-button" @click="cancel">
        <icon name="close" />
      </ButtonBase>
    </Transition>

    <!-- Title -->
    <h1 v-if="!isEditing && note.title" class="note__title">
      {{ note.title }}
    </h1>
    <InputMinimalText
      v-if="isEditing"
      ref="headingInput"
      v-model="editData.title"
      is-textarea
      class="note__title"
      placeholder="Title"
    />

    <Marked
      v-if="!isEditing && note.body"
      class="note__body"
      :content="note.body"
    />
    <InputMinimalText
      v-if="isEditing"
      ref="bodyInput"
      v-model="editData.body"
      is-textarea
      class="note__body"
      placeholder="Note"
    />

    <Splitter class="note__splitter" />

    <div v-if="hasTags && !isEditing" class="note__tags">
      <ChipTag
        v-for="tag in note.tags"
        :key="tag.id"
        v-bind="{ tag }"
        no-remove-button
        invert
      />
    </div>

    <div v-if="isEditing" class="note__tags--edit">
      <InputTags v-model="editData.tags" identifier="tags" left-icon="" />
    </div>

    <div v-if="!isEditing" class="dates">
      <span
        class="dates__wrapper"
        @mouseenter="showCreatedAt = true"
        @mouseleave="showCreatedAt = false"
      >
        <Transition name="note-dates">
          <span v-if="showCreatedAt" class="dates__created">
            Created {{ $dayjs(note.createdAt).fromNow() }}
          </span>
        </Transition>

        <span class="dates__edit">
          Edited {{ $dayjs(note.updatedAt).fromNow() }}
        </span>
      </span>
    </div>

    <div v-if="isEditing" class="note__edit-buttons">
      <ButtonMain large cta block :is-loading="isSaving" @click="save"
        >Save</ButtonMain
      >
      <ButtonMain
        large
        block
        color="danger"
        :is-loading="isDeleting"
        @click="deleteNote"
        >Delete Note</ButtonMain
      >
    </div>
  </Container>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.note
  +pos-r

  +m(no-heading)
    &:not(.note__is-editing)
      +mt(50px)

  +e(edit-button)
    +pos-a(top 0 right 20px)

  +e(title)
    +fnt-7xl
    +fnt-bold
    +fnt(heading)
    +w(max 100%)
    +break-word

  +e(body)
    +fnt-lg
    +mt(20px)
    +break-word

  +e(splitter)
    +my(10px)

  +e(tags)
    +flex($gap: 10px 15px, $center-v: true)
    +w(max 600px)
    +mx(auto)

    +m(edit)
      +mt(30px)

  .dates
    +fnt-xs
    +clr-txt(main, $opacity: 0.8)
    +flex
    justify-content: flex-end

    +e(wrapper)
      +pos-r
    +e(created)
      +pos-a(bottom 0 left 50%)
      +inline-block
      +w(max-content)
      transform: translate(-50%, 100%)
      +br-sm
      +pa(3px 5px)
      +clr-bg(secondary)

  +e(edit-buttons)
    +grid(1fr, $gap: 30px, $center: true)
    +mt(20px)
    +lt-mobile
      gap: 10px
      grid-template-columns: 1fr 1fr
</style>
