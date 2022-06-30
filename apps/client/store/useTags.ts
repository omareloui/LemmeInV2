import { defineStore, acceptHMRUpdate } from "pinia";

import type { Tag, AddTag, UpdateTag, Optional } from "~~/@types";

import getRandomColor from "~~/assets/utils/getRandomTagColor";

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
      if (!this.app.$accessor.auth.isSigned) return;
      const { data: tags } = (await this.$axios.get("/tags")) as {
        data: Tag[];
      };
      this.setTags(tags);
    },

    async addTag({ name, color }: AddTag) {
      try {
        let wantedColor = color;
        if (!wantedColor) wantedColor = getRandomColor();
        const response = await this.$axios.post("/tags", {
          name,
          color: wantedColor,
        });
        const tag = response.data as Tag;
        this.$notify.success("Created tag.");
        this.unshiftToTags(tag);
        return tag;
      } catch (e) {
        // @ts-ignore
        this.$notify.error(e.response ? e.response.data.message : e.message);
        return false;
      }
    },

    async updateTag(options: UpdateTag) {
      try {
        const { id } = options;
        const optionsForRequest = options as Optional<UpdateTag, "id">;
        delete optionsForRequest.id;
        const response = await this.$axios.put(
          `/tags/${id}`,
          optionsForRequest,
        );
        const newTag = response.data as Tag;
        this.$notify.success("Updated tag.");
        this.updateTagCache(newTag);
        return true;
      } catch (e) {
        // @ts-ignore
        this.$notify.error(e.response ? e.response.data.message : e.message);
        return false;
      }
    },

    async deleteTag({ tagId, tagName }: { tagId: string; tagName: string }) {
      try {
        const confirmed = await this.$confirm(
          `Are you sure you want to delete "${tagName}" tag?`,
          {
            description:
              "That will also remove the tag from all accounts and notes",
            acceptMessage: "Delete",
          },
        );
        if (!confirmed) return false;
        await this.$axios.delete(`/tags/${tagId}`);
        this.removeTag(tagId);
        this.app.$accessor.vault.removeTagFromAccounts(tagId);
        this.app.$accessor.notes.removeTagFromNotes(tagId);
        this.$notify.success("Removed tag.");
        return true;
      } catch (e) {
        // @ts-ignore
        this.$notify.error(e.response ? e.response.data.message : e.message);
        return false;
      }
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useTagsStore, import.meta.hot));
