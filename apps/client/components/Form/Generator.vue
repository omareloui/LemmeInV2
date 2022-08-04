<script setup lang="ts">
import InputBase from "../Input/Base.vue";
import InputEmail from "../Input/Email.vue";
import InputPassword from "../Input/Password.vue";
// import InputCheck from "../Input/Check.vue";
import InputTagColor from "../Input/TagColor.vue";

export type TInputBase = InstanceType<typeof InputBase>;
export type TInputEmail = InstanceType<typeof InputEmail>;
export type TInputPassword = InstanceType<typeof InputPassword>;
// export type TInputCheck = InstanceType<typeof InputCheck>;
export type TInputTagColor = InstanceType<typeof InputTagColor>;

export type TInput =
  | TInputBase
  | TInputEmail
  | TInputPassword
  // | TInputCheck
  | TInputTagColor;
export type TInputProps = TInput["$props"];

export type FieldType = "Base" | "Email" | "Password" | "TagColor";

export type Field = {
  id: string;
  fieldType: FieldType;
  props: TInputProps;
  display?: {
    isHalfColumn?: boolean;
  };
};

export type Gap = "gap";

export type FieldOrGap = Field | Gap;

export type ExpandableFields = {
  expandableFields: FieldOrGap[];
};

export type Option = Field | Gap | ExpandableFields;

export type Structure = Option[];

const GAP: Gap = "gap";

type PasswordValue = { value: string; isNative: boolean } | string;
type FieldValue = string | string[] | File[] | PasswordValue | Date;

type AcceptableValues =
  | FieldValue
  | { [key: string]: FieldValue }
  | { id: string; [key: string]: FieldValue }[];

type Values = Record<string, AcceptableValues>;

type SubmitFunction = (values: Values) => void | Promise<void>;

const props = withDefaults(
  defineProps<{
    formFields: Structure;
    submitFunction: SubmitFunction;
    submitButtonText?: string;
    danger?: boolean;
  }>(),
  { submitButtonText: "Submit", danger: false },
);

const refComponents = ref<TInput[] | null>(null);
const isLoading = ref(false);
const isExpandableShown = ref(false);

function removeGap<T extends Structure | FieldOrGap[]>(
  fields: T,
): Omit<T, Gap> {
  return fields.filter(x => x !== GAP) as Omit<T, Gap>;
}

const topLevelFields = props.formFields.filter(
  x => x !== "gap" && !(x as ExpandableFields).expandableFields,
) as FieldOrGap[];

const expandableFields: FieldOrGap[] = props.formFields
  .filter(x => x !== "gap" && !!(x as ExpandableFields).expandableFields)
  .reduce(
    (acc, field) => [...acc, ...(field as ExpandableFields).expandableFields],
    [] as FieldOrGap[],
  );

// const couldExpand = expandableFields.length > 0;

const fields = removeGap(topLevelFields.concat(expandableFields)) as Field[];

function getValues(): Values {
  const result: Values = {};
  fields.forEach(x => {
    // TODO:
    // if (x.type === "password") {
    //   const passwordComponent = getInputComponent(x) as any;
    //   if (passwordComponent.hasOAuth) {
    //     const passwordResult: PasswordValue = {
    //       value: x.value as string,
    //       isNative: passwordComponent.isNative,
    //     };
    //     result[x.id] = passwordResult;
    //   } else result[x.id] = x.value;
    // }
    // else
    result[x.id] = x.props.modelValue;
  });
  return result;
}

function startLoading() {
  isLoading.value = true;
}

function endLoading() {
  isLoading.value = false;
}

function validate() {
  const comps = refComponents.value;
  if (comps) comps.forEach(x => x.validate());
}

function checkIfComponentsHaveError() {
  const comps = refComponents.value;
  if (!comps) return false;
  for (let i = 0; i < comps.length; i += 1) {
    const inputComponent = comps[i];
    if (inputComponent.errorMessage) return true;
  }
  return false;
}

async function onSubmit() {
  const { $notify } = useNuxtApp();
  try {
    startLoading();
    validate();
    await nextTick();
    const hasError = checkIfComponentsHaveError();
    if (hasError) return;
    await props.submitFunction(getValues());
  } catch (e) {
    $notify.error(useErrorMessage(e));
  } finally {
    endLoading();
  }
}
</script>

<template>
  <form
    class="form-generator"
    :class="{
      'form-generator--danger': danger,
    }"
    @submit.prevent="onSubmit"
  >
    <div class="fields">
      <div
        v-for="(field, index) in topLevelFields"
        :key="index"
        class="form-field"
        :class="{
          'form-field--gap': field === 'gap',
          'form-field--input': field !== 'gap',
          'form-field--half': field !== 'gap' && field.display?.isHalfColumn,
        }"
      >
        <Component
          :is="`Input${field.fieldType}`"
          v-if="field !== 'gap'"
          ref="refComponents"
          v-bind="{ ...field.props }"
          v-model="field.props.modelValue"
          :identifier="field.id"
        ></Component>
      </div>
    </div>

    <!-- <ButtonBase
      v-if="couldExpand && !isExpandableShown"
      class="expand-button"
      @click="isExpandableShown = true"
    >
      more options
      <Icon name="drop" size="15px" />
    </ButtonBase>

    <Transition name="slide-down">
      <div v-if="couldExpand && isExpandableShown" class="fields">
        <div
          v-for="(field, index) in expandableFields"
          :key="index"
          class="form-field"
          :class="{
            'form-field--gap': field === 'gap',
            'form-field--input': field !== 'gap',
            'form-field--half': field !== 'gap' && field.style === 'half',
          }"
        >
          <Component
            :is="`input-${field.type}`"
            v-if="field !== 'gap'"
            ref="refComponents"
            v-model="field.value"
            :identifier="field.id"
            :label="field.label"
            v-bind="{ ...field.props }"
          ></Component>
        </div>
      </div>
    </Transition> -->

    <InputSubmit v-bind="{ isLoading }" class="submit" @enter="onSubmit">
      {{ submitButtonText }}
    </InputSubmit>
  </form>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.form-generator

  .fields
    +grid(1fr 1fr, $gap: 15px)

  .form-field
    +m(gap)
      height: 0.7rem
      grid-column: 1 / 3

    +m(input)
      grid-column: 1 / 3

    +lt-mobile
      grid-column: unset
      &:not(.form-field--half)
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

  +m(danger)
    .submit
      +clr-bg(danger)
</style>
