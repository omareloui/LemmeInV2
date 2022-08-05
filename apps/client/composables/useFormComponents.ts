// @ts-ignore
import type { TInput } from "~~/components/Form/Wrapper.vue";

export function useFormComponents() {
  let inputComponents: TInput[] = [];

  function addComponentRef(el?: unknown) {
    if (el) inputComponents.push(el as TInput);
  }
  function clearComponents() {
    inputComponents = [];
  }

  return {
    inputComponents,
    addComponentRef,
    clearComponents,
  };
}
