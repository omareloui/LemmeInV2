import { useNotifyStore } from "~~/store/useNotify";

type NotifyFn = (message: string, options?: { duration?: number }) => void;
type NotifyType = "error" | "warn" | "info" | "success";

export type Notify = {
  [K in NotifyType]: NotifyFn;
};

export default defineNuxtPlugin(() => {
  const notifyStore = useNotifyStore();

  const notify: Notify = {
    error(message, options) {
      notifyStore.error({ message, duration: options?.duration });
    },
    warn(message, options) {
      notifyStore.warn({ message, duration: options?.duration });
    },
    info(message, options) {
      notifyStore.info({ message, duration: options?.duration });
    },
    success(message, options) {
      notifyStore.success({ message, duration: options?.duration });
    },
  };

  return {
    provide: {
      notify,
    },
  };
});
