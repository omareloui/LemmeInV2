export type Copy = (
  textToCopy: string,
  successMessage?: string,
) => Promise<void>;

export default defineNuxtPlugin(() => {
  const { $notify } = useNuxtApp();

  const copy: Copy = async (textToCopy, successMessage) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      $notify.success(successMessage || "Copied!");
    } catch (e) {
      $notify.error("Couldn't copy for unknown reason, try again later");
    }
  };

  return {
    provide: {
      copy,
    },
  };
});
