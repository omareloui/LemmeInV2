import { defineStore, acceptHMRUpdate } from "pinia";

import type { Note, AddNote, UpdateNote, Optional } from "~~/@types";

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
      if (!this.app.$accessor.auth.isSigned) return;
      const { data: notes } = (await this.$axios.get("/notes")) as {
        data: Note[];
      };
      this.decryptAndSetNotes(notes);
    },

    async getNote(noteId: string) {
      const note = this.notes.find(x => x.id === noteId);
      if (note) return note;
      const { data } = await this.$axios.get(`/notes/${noteId}`);
      const dNote = await this.decryptNote(data);
      return dNote;
    },

    async addNote(options: AddNote) {
      try {
        if (!options.body && !options.title)
          throw new Error('"note" and "title" can\'t be both empty');
        const eNote = await this.encryptNote(options);
        const response = await this.$axios.post("/notes", eNote);
        const note = response.data as Note;
        note.title = options.title;
        note.body = options.body;
        this.$notify.success("Created note");
        this.unshiftToNotes(note);
        return true;
      } catch (e) {
        this.$notify.error(e.response ? e.response.data.message : e.message);
        return false;
      }
    },

    async updateNote(options: UpdateNote) {
      try {
        const { id } = options;
        const optionsForRequest = options as Optional<UpdateNote, "id">;
        delete optionsForRequest.id;
        const dNote = await this.encryptNote(optionsForRequest);
        const response = await this.$axios.put(`/notes/${id}`, dNote);
        const newNote = {
          ...response.data,
          body: options.body,
          title: options.title,
        } as Note;
        this.$notify.success("Updated note");
        this.updateNoteCache(newNote);
        return newNote;
      } catch (e) {
        this.$notify.error(e.response ? e.response.data.message : e.message);
        return false;
      }
    },

    async deleteNote(noteId: string) {
      try {
        const confirmed = await this.$confirm(
          "Are you sure you want to delete this note?",
          { acceptMessage: "Delete" },
        );
        if (!confirmed) return false;
        await this.$axios.delete(`/notes/${noteId}`);
        this.removeNote(noteId);
        this.$notify.success("Removed note.");
        return true;
      } catch (e) {
        this.$notify.error(e.response ? e.response.data.message : e.message);
        return false;
      }
    },

    async encryptNote(note: Note) {
      const { title, body } = note;
      const encryptedNote = note;
      encryptedNote.title = title ? await this.$cypher.encrypt(title) : "";
      encryptedNote.body = body ? await this.$cypher.encrypt(body) : "";
      return note;
    },

    async decryptNote(note: Note) {
      const { title, body } = note;
      const decryptedNote = note;
      decryptedNote.title = title ? await this.$cypher.decrypt(title) : title;
      decryptedNote.body = body ? await this.$cypher.decrypt(body) : body;
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
