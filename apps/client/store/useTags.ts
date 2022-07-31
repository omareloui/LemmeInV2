import { defineStore, acceptHMRUpdate } from "pinia";

import getRandomColor from "~~/assets/utils/getRandomTagColor";
import { useAuthStore } from "~~/store/useAuth";

import type { Tag, AddTag, UpdateTag, Optional } from "~~/types";

export const useTagsStore = defineStore("tags", {
  state: () => ({
    tags: [] as Tag[],
  }),

  actions: {
    setTags(tags: Tag[]) {
      this.tags = tags;
    },

    clearTags() {
      this.tags = [];
    },

    updateTagCache(tag: Tag) {
      const tagIndex = this.tags.findIndex(x => x.id === tag.id);
      if (tagIndex === -1) throw new Error("Can't find the tag to update");
      this.tags[tagIndex] = tag;
    },

    unshiftToTags(tag: Tag) {
      this.tags.unshift(tag);
    },

    removeTag(tagId: string) {
      this.tags = this.tags.filter(x => x.id !== tagId);
    },

    async getTags() {
      const authStore = useAuthStore();
      if (!authStore.isSigned) return;
      const tags = (await useServerFetch("/tags")) as Tag[];
      this.setTags(tags);
    },

    async addTag({ name, color }: AddTag) {
      const { $notify } = useNuxtApp();
      try {
        let wantedColor = color;
        if (!wantedColor) wantedColor = getRandomColor();
        const response = (await useServerFetch("/tags", {
          method: "POST",
          body: {
            name,
            color: wantedColor,
          },
        })) as Tag;
        $notify.success("Created tag.");
        this.unshiftToTags(response);
        return response;
      } catch (e) {
        const err = useErrorParsers(e);
        if (err.name === "FetchError")
          $notify.error(err.response._data.message);
        return false;
      }
    },

    async updateTag(options: UpdateTag) {
      const { $notify } = useNuxtApp();
      try {
        const { id } = options;
        const optionsForRequest = options as Optional<UpdateTag, "id">;
        delete optionsForRequest.id;
        const response = (await useServerFetch(`/tags/${id}`, {
          method: "PUT",
          body: optionsForRequest,
        })) as Tag;
        $notify.success("Updated tag.");
        this.updateTagCache(response);
        return true;
      } catch (e) {
        const err = useErrorParsers(e);
        if (err.name === "FetchError")
          $notify.error(err.response._data.message);
        return false;
      }
    },

    async deleteTag({ tagId, tagName }: { tagId: string; tagName: string }) {
      const { $notify, $confirm } = useNuxtApp();
      try {
        const confirmed = await $confirm(
          `Are you sure you want to delete "${tagName}" tag?`,
          {
            description:
              "That will also remove the tag from all accounts and notes",
            acceptMessage: "Delete",
          },
        );
        if (!confirmed) return false;
        await useServerFetch(`/tags/${tagId}`, {
          method: "DELETE",
          headers: { "Content-Type": "text/plain" },
        });
        this.removeTag(tagId);
        // TODO:
        // this.app.$accessor.vault.removeTagFromAccounts(tagId);
        // this.app.$accessor.notes.removeTagFromNotes(tagId);
        $notify.success("Removed tag.");
        return true;
      } catch (e) {
        const err = useErrorParsers(e);
        if (err.name === "FetchError")
          $notify.error(err.response._data.message);
        return false;
      }
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useTagsStore, import.meta.hot));
