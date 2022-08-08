import { defineStore, acceptHMRUpdate } from "pinia";

import { useAuthStore } from "store/useAuth";
import { useVaultStore } from "store/useVault";
import { useAnalyzeStore } from "store/useAnalyze";
import { useTagsStore } from "store/useTags";
import { useNotesStore } from "store/useNotes";

import type { ClientResources as Resources } from "types";

export const useResourcesStore = defineStore("resources", {
  state: () => ({}),

  getters: {},

  actions: {
    async load() {
      const authStore = useAuthStore();
      if (!authStore.isSigned) return;

      const vaultStore = useVaultStore();
      const analyzeStore = useAnalyzeStore();
      const notesStore = useNotesStore();
      const tagsStore = useTagsStore();

      const { accounts, notes, tags } = (await useTokenedFetch(
        "/api/resources",
      )) as Resources;

      await vaultStore.decryptAndSetAccounts(accounts);
      await notesStore.decryptAndSetNotes(notes);
      await tagsStore.setTags(tags);
      await analyzeStore.init();
    },

    clear() {
      const vaultStore = useVaultStore();
      const analyzeStore = useAnalyzeStore();
      const notesStore = useNotesStore();
      const tagsStore = useTagsStore();

      vaultStore.clearAccounts();
      notesStore.clearNotes();
      tagsStore.clearTags();
      analyzeStore.clearData();
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useResourcesStore, import.meta.hot));
