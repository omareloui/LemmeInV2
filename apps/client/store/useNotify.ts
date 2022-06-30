import { defineStore, acceptHMRUpdate } from "pinia";

import type { Optional } from "~~/@types";

interface Notification {
  id: number;
  isShown: boolean;
  type: string;
  message: string;
  duration: number;
}

interface NotificationOptions {
  message: string;
  duration?: number;
}

export const state = () => ({
  transitionDuration: 500,
  idCounter: -1,
  defaultDuration: 2000,
  notifications: [] as Notification[],
});

export const useNotifyStore = defineStore("notify", {
  state: () => ({
    transitionDuration: 500,
    idCounter: -1,
    defaultDuration: 2000,
    notifications: [] as Notification[],
  }),

  getters: {},

  actions: {
    hide(notificationId: number) {
      const notification = this.notifications.find(
        x => x.id === notificationId,
      );
      if (notification) notification.isShown = false;
    },
    show(notificationId: number) {
      const notification = this.notifications.find(
        x => x.id === notificationId,
      );
      if (notification) notification.isShown = true;
    },

    push(notification: Notification) {
      this.notifications.push(notification);
    },
    pop(notificationId: number) {
      this.notifications = this.notifications.filter(
        x => x.id !== notificationId,
      );
    },

    increaseId() {
      this.idCounter += 1;
    },

    notify({
      message,
      duration,
      type,
    }: Optional<
      Pick<Notification, "message" | "duration" | "type">,
      "duration"
    >) {
      const newNotification: Notification = {
        id: this.idCounter,
        isShown: false,
        message,
        duration: duration || this.defaultDuration,
        type,
      };
      this.increaseId();
      this.add(newNotification);
      setTimeout(
        () => this.close(newNotification.id),
        newNotification.duration,
      );
    },

    add(notification: Notification) {
      this.push(notification);
      setTimeout(() => this.show(notification.id), 0);
    },

    close(notificationId: number) {
      this.hide(notificationId);
      setTimeout(() => this.pop(notificationId), this.transitionDuration);
    },

    error({ message, duration }: NotificationOptions) {
      this.notify({ message, duration, type: "error" });
    },
    warn({ message, duration }: NotificationOptions) {
      this.notify({ message, duration, type: "warn" });
    },
    info({ message, duration }: NotificationOptions) {
      this.notify({ message, duration, type: "info" });
    },
    success({ message, duration }: NotificationOptions) {
      this.notify({ message, duration, type: "success" });
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useNotifyStore, import.meta.hot));
