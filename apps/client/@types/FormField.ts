import type { InputSelectOption } from "./InputSelectOption";

export type InputTypes =
  | "text"
  | "email"
  | "password"
  | "select"
  | "radio"
  | "check"
  | "file"
  | "tag-color"
  | "tags"
  | "textarea";

export type PasswordValue = { value: string; isNative: boolean } | string;
export type AcceptableFormValues =
  | string
  | string[]
  | File[]
  | PasswordValue
  | { id: string; [key: string]: string | number | boolean }[];

export type FormValues = {
  [fieldId: string]: AcceptableFormValues;
};

export type FormGap = "gap";

export interface FormField {
  id: string;
  type: InputTypes;
  value: AcceptableFormValues;
  label?: string;
  props?: Partial<{
    default: AcceptableFormValues;
    notRequired: boolean;
    leftIcon: string;
    placeholder: string;
    hint: string;
    minLength: number;
    maxLength: number;
    pattern: RegExp;
    invalidPatternMessage: string;
    options: InputSelectOption[];
    primaryKey: string;
    focusOnMount: boolean;
    noIcon: boolean;
    hasOAuth: boolean;
    showPasswordStrength: boolean;
    rows: number;
    isOAuthDefault: boolean;
  }>;
  style?: "half";
}

export interface ExpandableFields {
  expandableFields: (FormField | FormGap)[];
}

export type FormOptions = FormField | FormGap | ExpandableFields;

export type FormStructure = FormOptions[];
