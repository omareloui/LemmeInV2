import { defineStore, acceptHMRUpdate } from "pinia";

import { useAuthStore } from "store/useAuth";
import { useTagsStore } from "store/useTags";
import { useNotesStore } from "store/useNotes";

import type { Resources } from "~~/types";

export const useResourcesStore = defineStore("resources", {
  state: () => ({}),

  getters: {},

  actions: {
    async load() {
      const authStore = useAuthStore();
      const notesStore = useNotesStore();
      const tagsStore = useTagsStore();

      if (!authStore.isSigned) return;

      // FIXME:
      // const resources = (await useServerFetch("/resources")) as Resources;

      const token = await authStore.getToken();
      const { accounts, notes, tags } = (await $fetch(
        "http://localhost:8000/resources",
        {
          headers: { authorization: `Bearer ${token}` },
        },
      )) as Resources;

      // await vaultStore.decryptAndSetAccounts(accounts)
      await notesStore.decryptAndSetNotes(notes);
      await tagsStore.setTags(tags);
      // await analyzeStore.init()
    },

    clear() {
      const notesStore = useNotesStore();
      const tagsStore = useTagsStore();

      // vaultStore.clearAccounts()
      notesStore.clearNotes();
      tagsStore.clearTags();
      // analyzeStore.clearData()
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useResourcesStore, import.meta.hot));
