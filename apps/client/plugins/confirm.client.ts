import { useConfirmStore, ConfirmOptions } from "~~/store/useConfirm";

export type Confirm = (
  message: string,
  options?: Omit<ConfirmOptions, "message">,
) => Promise<boolean>;

export default defineNuxtPlugin(() => {
  const confirmStore = useConfirmStore();

  const confirm: Confirm = async (message, options) => {
    confirmStore.showConfirm({ message, ...options });

    function waitTillClose() {
      return new Promise(resolve => {
        const unwatch = confirmStore.$onAction(() => {
          if (confirmStore.isConfirming === false) {
            unwatch();
            resolve(true);
          }
        });
      });
    }

    await waitTillClose();

    return confirmStore.result;
  };

  return {
    provide: {
      confirm,
    },
  };
});
