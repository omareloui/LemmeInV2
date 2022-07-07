<script setup lang="ts">
import {
  FormField,
  FormValues,
  PasswordValue,
  FormStructure,
  ExpandableFields,
  FormGap,
  // InputText,
  // InputPassword,
} from "~~/@types";

const GAP: FormGap = "gap";

// type InputComponent = InputText | InputPassword;

type FieldOrGap = FormField | FormGap;
type SubmitFunction = (values: FormValues) => void;

const props = withDefaults(
  defineProps<{
    formFields: FormStructure;
    submitButtonText?: string;
    submitFunction: SubmitFunction;
    gridLayout: string;
    danger?: boolean;
  }>(),
  { submitButtonText: "Submit", danger: false },
);

const isLoading = ref(false);
const isExpandableShown = ref(false);

function removeGap<T extends FormField | ExpandableFields>(
  fields: FormStructure,
): T[] {
  return fields.filter(x => x !== GAP) as T[];
}

function getInputComponent(x: FormField) {
  // return ($refs[x.id])[0]  as InputComponent
  return false;
}

const topLevelFields: FieldOrGap[] = (props.formFields as FieldOrGap[]).filter(
  // @ts-ignore
  x => !x.expandableFields,
);

const expandableFields: FieldOrGap[] = props.formFields
  // @ts-ignore
  .filter(x => !!x.expandableFields)
  .reduce(
    // @ts-ignore
    (acc, field) => [...acc, ...field.expandableFields],
    [] as FieldOrGap[],
  );

const couldExpand = expandableFields.length > 0;

const fields: FormField[] = removeGap(topLevelFields.concat(expandableFields));

function getValues(): FormValues {
  const result: FormValues = {};
  fields.forEach((x: FormField) => {
    // Handle password value if the types is password
    if (x.type === "password") {
      const passwordComponent = getInputComponent(x) as any;
      if (passwordComponent.hasOAuth) {
        const passwordResult: PasswordValue = {
          value: x.value as string,
          isNative: passwordComponent.isNative,
        };
        result[x.id] = passwordResult;
      } else result[x.id] = x.value;
    }
    // Handle the rest of the fields
    else result[x.id] = x.value;
  });
  return result;
}

const values = getValues();

const fieldsToGet: FormField[] = isExpandableShown.value
  ? fields
  : removeGap(topLevelFields);

const components = fieldsToGet.map(getInputComponent);

function startLoading() {
  isLoading.value = true;
}

function endLoading() {
  isLoading.value = false;
}

function validate() {
  const validateInput = (inputComponent: any) => inputComponent.validate();
  components.forEach(validateInput);
}

function checkIfComponentsHaveError() {
  for (let i = 0; i < components.length; i += 1) {
    const inputComponent = components[i] as any;
    if (inputComponent.errorMessage) return true;
  }
  return false;
}

async function onSubmit() {
  const { $notify } = useNuxtApp();
  try {
    startLoading();
    // Validation
    validate();
    await nextTick();
    const hasError = checkIfComponentsHaveError();
    if (hasError) return;
    await props.submitFunction(values);
  } catch (err) {
    const e = err as any;
    if (e.response) $notify.error(e.response.data.message);
    else $notify.error(e.message);
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
          'form-field--half': field !== 'gap' && field.style === 'half',
        }"
      >
        <component
          :is="`input-${field.type}`"
          v-if="field !== 'gap'"
          :ref="field.id"
          v-model="field.value"
          :identifier="field.id"
          :label="field.label"
          v-bind="{ ...field.props }"
        ></component>
      </div>
    </div>

    <ButtonBase
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
          <component
            :is="`input-${field.type}`"
            v-if="field !== 'gap'"
            :ref="field.id"
            v-model="field.value"
            :identifier="field.id"
            :label="field.label"
            v-bind="{ ...field.props }"
          ></component>
        </div>
      </div>
    </Transition>

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
