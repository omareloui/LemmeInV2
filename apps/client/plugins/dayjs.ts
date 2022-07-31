import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export type DayJS = typeof dayjs;

export default defineNuxtPlugin(() => ({
  provide: {
    dayjs,
  },
}));
