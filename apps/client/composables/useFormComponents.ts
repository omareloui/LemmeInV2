// @ts-ignore
import type { TInput } from "~~/components/Form/Wrapper.vue";

export function useFormComponents() {
  let inputComponents: TInput[] = [];
  let extendedComponents: TInput[] | undefined;

  function addComponentRef(el?: unknown) {
    if (el) inputComponents.push(el as TInput);
  }
  function addExtendedComponentRef(el?: unknown) {
    if (el)
      if (extendedComponents) extendedComponents.push(el as TInput);
      else extendedComponents = [el];
  }
  function clearComponents() {
    inputComponents = [];
  }

  function getExtendedComponents() {
    return [...(extendedComponents || [])];
  }

  return {
    inputComponents,
    addComponentRef,
    addExtendedComponentRef,
    getExtendedComponents,
    clearComponents,
  };
}
