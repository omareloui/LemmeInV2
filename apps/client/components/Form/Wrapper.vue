<script setup lang="ts">
import type { Optional } from "types";

import InputBase from "../Input/Base.vue";
import InputEmail from "../Input/Email.vue";
import InputPassword from "../Input/Password.vue";
// import InputCheck from "../Input/Check.vue";
import InputSelect from "../Input/Select.vue";
import InputTextarea from "../Input/Textarea.vue";
import InputTagColor from "../Input/TagColor.vue";
import InputTags from "../Input/Tags.vue";

export type TInputBase = InstanceType<typeof InputBase>;
export type TInputEmail = InstanceType<typeof InputEmail>;
export type TInputPassword = InstanceType<typeof InputPassword>;
// export type TInputCheck = InstanceType<typeof InputCheck>;
export type TInputSelect = InstanceType<typeof InputSelect>;
export type TInputTextarea = InstanceType<typeof InputTextarea>;
export type TInputTagColor = InstanceType<typeof InputTagColor>;
export type TInputTags = InstanceType<typeof InputTags>;

export type TInput =
  | TInputBase
  | TInputEmail
  | TInputPassword
  // | TInputCheck
  | TInputSelect
  | TInputTextarea
  | TInputTagColor
  | TInputTags;

type PasswordValue = { value: string; isNative: boolean } | string;
type FieldValue = string | string[] | File[] | PasswordValue | Date | undefined;

type AcceptableValues =
  | FieldValue
  | { value: string; isNative: boolean }
  | { id: string; [key: string]: FieldValue }[]
  | { [key: string]: FieldValue };

type Values = Record<string, AcceptableValues>;

type SubmitFunction = (values: Values) => void | Promise<void>;

const props = withDefaults(
  defineProps<{
    submitFunction: SubmitFunction;
    componentsHandler: Optional<
      ReturnType<typeof useFormComponents>,
      "addComponentRef" | "addExtendedComponentRef" | "getExtendedComponents"
    >;
    submitButtonText?: string;
    isExpandable?: boolean;
    isDanger?: boolean;
  }>(),
  { submitButtonText: "Submit", isExpandable: false, isDanger: false },
);

const isLoading = ref(false);
const isExpandableShown = ref(false);

let components: TInput[] = [];

async function setComponents() {
  const { inputComponents, getExtendedComponents } = props.componentsHandler;
  await nextTick();
  components = [
    ...inputComponents,
    ...(getExtendedComponents ? getExtendedComponents() : []),
  ];
}

function checkIfComponentsHaveError() {
  if (components.length === 0) return false;
  for (let i = 0; i < components.length; i += 1)
    if (components[i].errorMessage) return true;
  return false;
}

async function validate() {
  components.forEach(x => x.validate());
  await nextTick();
  return checkIfComponentsHaveError();
}

function getValues(): Values {
  const result: Values = {};

  components.forEach(comp => {
    if ("isNative" in comp) {
      const passComp = comp as TInputPassword;
      if (passComp.hasOAuth) {
        const passwordResult: PasswordValue = {
          value: passComp.$props.modelValue as string,
          isNative: passComp.isNative,
        };
        result[passComp.$props.identifier as string] = passwordResult;
      } else
        result[passComp.$props.identifier as string] =
          passComp.$props.modelValue;
    } else
      result[comp.$props.identifier as string] = comp.$props
        .modelValue as AcceptableValues;
  });

  return result;
}

async function onSubmit() {
  try {
    isLoading.value = true;

    await setComponents();

    const hasError = await validate();
    if (hasError) return;

    await props.submitFunction(getValues());
  } catch (e) {
    const { $notify } = useNuxtApp();
    $notify.error(useErrorMessage(e));
  } finally {
    isLoading.value = false;
  }
}

onBeforeUpdate(props.componentsHandler.clearComponents);
</script>

<template>
  <form :class="{ 'form--danger': isDanger }" @submit.prevent="onSubmit">
    <div class="fields">
      <slot></slot>
    </div>

    <ButtonBase
      v-if="isExpandable && !isExpandableShown"
      class="expand-button"
      @click="isExpandableShown = true"
    >
      more options
      <Icon name="drop" size="15px" />
    </ButtonBase>

    <Transition name="slide-down">
      <div v-if="isExpandable && isExpandableShown" class="fields">
        <slot name="expandable"></slot>
      </div>
    </Transition>

    <InputSubmit :is-loading="isLoading" class="submit" @enter="onSubmit">
      {{ submitButtonText }}
    </InputSubmit>
  </form>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

form
  .fields
    +grid(1fr 1fr, $gap: 15px)

    :deep(> *)
      grid-column: 1 / 3

    :deep(> .gap)
      height: 0.7rem
      grid-column: 1 / 3

  +lt-mobile
    .fields
      :deep(> *)
        grid-column: unset
        &:not(.half)
          grid-column: 1 / 3

  .expand-button
    opacity: 0.8
    +pos-r
    +center-text
    +mx(auto)
    +mb(10px)
    +mt(20px)
    +pr(20px)
    +fnt-sm
    +block
    +br-md
    i
      +center-v
      opacity: 0.8
      right: 0

  .submit
    grid-column: 1 / 3
    +mt(15px)

  &.form--danger .submit
      +clr-bg(danger)
</style>
