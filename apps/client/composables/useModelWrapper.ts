export function useModelWrapper<
  Props extends { modelValue: string | string[] },
>(
  props: Props,
  emit: (event: "update:modelValue", ...args: unknown[]) => void,
) {
  return computed<Props["modelValue"]>({
    get: () => props.modelValue,
    set: value => emit("update:modelValue", value),
  });
}
