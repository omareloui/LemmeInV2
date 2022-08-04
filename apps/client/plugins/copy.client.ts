export type Copy = (
  textToCopy: string,
  successMessage?: string,
) => Promise<void>;

export default defineNuxtPlugin(() => {
  function copyFromTextarea(input: string) {
    const textarea = document.createElement("textarea");
    textarea.value = input;

    textarea.style.position = "fixed";
    textarea.style.left = "-999999px";
    textarea.style.top = "-999999px";
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, 99999);

    return new Promise(resolve => {
      document.execCommand("copy");
      textarea.remove();
      resolve(true);
    });
  }

  const copy: Copy = async (textToCopy, successMessage) => {
    const { $notify } = useNuxtApp();
    try {
      if (navigator.clipboard && window.isSecureContext)
        navigator.clipboard.writeText(textToCopy);
      else await copyFromTextarea(textToCopy);
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
