export function useModelWrapper<T, Props extends { modelValue: T }>(
  props: Props,
  emit: (event: "update:modelValue", value: T) => void,
) {
  return computed<Props["modelValue"]>({
    get: () => props.modelValue,
    set: value => emit("update:modelValue", value),
  });
}
