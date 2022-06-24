import { defineStore, acceptHMRUpdate } from "pinia";

export interface ConfirmOptions {
  message: string;
  description?: string;
  acceptMessage?: string;
}

export const useConfirmStore = defineStore("confirm", {
  state: () => ({
    DEFAULT_ACCEPT_MESSAGE: "Accept",
    message: "",
    description: "",
    acceptMessage: "",
    isConfirming: false,
    lastConfirmResult: false,
  }),

  getters: {
    result: state => !!state.lastConfirmResult,
  },

  actions: {
    show() {
      this.isConfirming = true;
    },

    closeDialogue() {
      this.isConfirming = false;
    },

    setMessage({ message, description, acceptMessage }: ConfirmOptions) {
      this.message = message;
      this.description = description || "";
      this.acceptMessage = acceptMessage || this.DEFAULT_ACCEPT_MESSAGE;
    },

    removeMessage() {
      this.message = "";
      this.acceptMessage = this.DEFAULT_ACCEPT_MESSAGE;
    },

    setSelected(selected: boolean) {
      this.lastConfirmResult = selected;
    },

    showConfirm({ message, description, acceptMessage }: ConfirmOptions) {
      this.setMessage({ message, description, acceptMessage });
      this.show();
    },

    select(selected: boolean) {
      this.setSelected(selected);
      this.close();
    },

    close() {
      this.closeDialogue();
      setTimeout(() => {
        this.removeMessage();
      }, 500);
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useConfirmStore, import.meta.hot));
