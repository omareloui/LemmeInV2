import { defineStore, acceptHMRUpdate } from "pinia";

import type { Note, AddNote, UpdateNote, Optional } from "types";

import { useAuthStore } from "store/useAuth";

export const useNotesStore = defineStore("notes", {
  state: () => ({
    notes: [] as Note[],
  }),

  actions: {
    setNotes(notes: Note[]) {
      this.notes = notes;
    },

    clearNotes() {
      this.notes = [];
    },

    updateNoteCache(note: Note) {
      const noteIndex = this.notes.findIndex(x => x.id === note.id);
      if (noteIndex === -1) throw new Error("Can't find the note to update");
      this.notes[noteIndex] = note;
    },

    unshiftToNotes(note: Note) {
      this.notes.unshift(note);
    },

    removeNote(noteId: string) {
      this.notes = this.notes.filter(x => x.id !== noteId);
    },

    removeTagFromNotes(tagId: string) {
      this.notes = this.notes.map(note => {
        const updatedNote = note;
        if (updatedNote.tags)
          updatedNote.tags = updatedNote.tags.filter(x => x.id !== tagId);
        return updatedNote;
      });
    },

    async getNotes() {
      const authStore = useAuthStore();
      if (!authStore.isSigned) return;
      const notes = (await useServerFetch("/notes")) as Note[];
      this.decryptAndSetNotes(notes);
    },

    async getNote(noteId: string) {
      const noteFromStore = this.notes.find(x => x.id === noteId);
      if (noteFromStore) return noteFromStore;
      const note = (await useServerFetch(`/notes/${noteId}`)) as Note;
      const dNote = await this.decryptNote(note);
      return dNote;
    },

    async addNote(options: AddNote) {
      const { $notify } = useNuxtApp();
      try {
        if (!options.body && !options.title)
          throw new Error('"note" and "title" can\'t be both empty');
        const eNote = await this.encryptNote(options);
        const note = (await useServerFetch("/notes", {
          body: eNote,
          method: "POST",
        })) as Note;
        note.title = options.title;
        note.body = options.body;
        $notify.success("Created note");
        this.unshiftToNotes(note);
        return true;
      } catch (e) {
        const err = useErrorParsers(e);
        if (err.name === "FetchError")
          $notify.error(err.response._data.message);
        else $notify.error(err.message);
        return false;
      }
    },

    async updateNote(options: UpdateNote) {
      const { $notify } = useNuxtApp();
      try {
        const { id } = options;
        const optionsForRequest = options as Optional<UpdateNote, "id">;
        delete optionsForRequest.id;
        const dNote = await this.encryptNote(optionsForRequest);
        const note = (await useServerFetch(`/notes/${id}`, {
          method: "PUT",
          body: dNote,
        })) as Note;
        const newNote = {
          ...note,
          body: options.body,
          title: options.title,
        } as Note;
        $notify.success("Updated note");
        this.updateNoteCache(newNote);
        return newNote;
      } catch (e) {
        const err = useErrorParsers(e);
        if (err.name === "FetchError")
          $notify.error(err.response._data.message);
        else $notify.error(err.message);
        return false;
      }
    },

    async deleteNote(noteId: string) {
      const { $confirm, $notify } = useNuxtApp();
      try {
        const confirmed = await $confirm(
          "Are you sure you want to delete this note?",
          { acceptMessage: "Delete" },
        );
        if (!confirmed) return false;
        await useServerFetch(`/notes/${noteId}`, {
          method: "DELETE",
          headers: { "Content-Type": "text/plain" },
        });
        this.removeNote(noteId);
        $notify.success("Removed note.");
        return true;
      } catch (e) {
        const err = useErrorParsers(e);
        if (err.name === "FetchError")
          $notify.error(err.response._data.message);
        else $notify.error(err.message);
        return false;
      }
    },

    async encryptNote(note: Note | AddNote) {
      const { $cypher } = useNuxtApp();
      const { title, body } = note;
      const encryptedNote = { ...note };
      encryptedNote.title = title ? await $cypher.encrypt(title) : "";
      encryptedNote.body = body ? await $cypher.encrypt(body) : "";
      return note;
    },

    async decryptNote(note: Note) {
      const { $cypher } = useNuxtApp();
      const { title, body } = note;
      const decryptedNote = note;
      decryptedNote.title = title ? await $cypher.decrypt(title) : title;
      decryptedNote.body = body ? await $cypher.decrypt(body) : body;
      return note;
    },

    async decryptAndSetNotes(notes: Note[]) {
      const dNotes = await Promise.all(notes.map(x => this.decryptNote(x)));
      this.setNotes(dNotes);
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useNotesStore, import.meta.hot));
