<script setup lang="ts">
import type { HTMLInputEvent, InputSelectOption } from "types";

import InputSearch from "~~/components/Input/Search.vue";

const searchField = ref<InstanceType<typeof InputSearch> | null>(null);

const props = withDefaults(
  defineProps<{
    identifier: string;
    modelValue: string;
    name?: string;
    primaryKey?: string;
    options: InputSelectOption[];
    label?: string;
    noteRequired?: boolean;
    isSearchable?: boolean;
    defaultButtonText?: string;
    leftIcon?: string;
  }>(),
  {
    primaryKey: "value",
    notRequired: false,
    isSearchable: false,
    name: undefined,
    label: undefined,
    defaultButtonText: undefined,
    leftIcon: undefined,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const content = useModelWrapper(props, emit);

const isDropdownOpen = ref(false);

const searchQuery = ref("");
const searchResult = reactive<{ result: { id: string }[] }>({ result: [] });

const errorMessage = ref("");
const hoverLabel = ref(false);

const isErred = computed(() => !!errorMessage.value);
const selectedOption = computed(() =>
  props.options.find(x => x.id === content.value),
);
const isSearching = computed(() => !!searchQuery.value);

function clearError() {
  errorMessage.value = "";
}

function select(e: HTMLInputEvent | Event) {
  if (isErred.value) clearError();
  content.value = (e as HTMLInputEvent).target.value;
}

function selectOnSpace(e: HTMLInputEvent | KeyboardEvent) {
  const inputElement = (e as HTMLInputEvent).target.querySelector("input");
  if (!inputElement) return;
  select({ target: { value: inputElement.value } } as HTMLInputEvent);
}

function clear() {
  content.value = "";
}

function validate() {
  if (!props.notRequired && !content.value) {
    errorMessage.value = "You have to select something.";
    return;
  }
  clearError();
}

function clearSearch() {
  searchQuery.value = "";
}

function getOptionsElements() {
  const optionsContainer = document.getElementById(props.identifier);
  if (!optionsContainer) return [];
  const list = optionsContainer.querySelector("ul");
  const listItems = list?.querySelectorAll("li");
  if (!listItems) return [];
  return Array.from(listItems);
}

function focusOnSelected() {
  if (!content.value) return;
  const optionsList = getOptionsElements();
  if (optionsList.length === 0) return;
  const selectedElement = optionsList.find(
    x => x.querySelector("input")?.value === content.value,
  );
  selectedElement?.focus();
}

function focusOnSearch() {
  if (props.isSearchable && searchField.value) searchField.value.focus();
}

async function openDropdown() {
  isDropdownOpen.value = true;
  hoverLabel.value = true;
  await nextTick();
  focusOnSelected();
}

function closeDropdown() {
  isDropdownOpen.value = false;
  hoverLabel.value = false;
  if (props.isSearchable) clearSearch();
}

async function toggleShowOptions() {
  if (isDropdownOpen.value) closeDropdown();
  else openDropdown();
  if (!props.isSearchable) return;
  clearSearch();
  await nextTick();
  focusOnSearch();
}

function closeDropdownOnClickingAway(e: MouseEvent) {
  const path = e.composedPath() as HTMLElement[];
  const clickedSelectorElement = path?.find((clickedElement: HTMLElement) =>
    clickedElement.classList?.contains("selector"),
  );
  if (!clickedSelectorElement) closeDropdown();
}

function closeDropdownOnEscapeAndTabOnOutFocus(e: KeyboardEvent) {
  if (e.code === "Escape") closeDropdown();
  if (e.code === "Tab") {
    const elements = e.composedPath();
    const selectorTabbedElement = ([...elements] as HTMLElement[]).find(x =>
      x?.classList?.contains("selector"),
    );
    if (!selectorTabbedElement) closeDropdown();
  }
}

function focusPrevOption(e: KeyboardEvent) {
  const target = e.target as Element;
  if (!target) return;
  const optionsList = getOptionsElements();
  if (optionsList.length === 0) return;
  const lastElement = optionsList[optionsList.length - 1];
  // If it's the button then select the last element
  if (target.classList.contains("selector")) {
    lastElement.focus();
    return;
  }
  const targetIndex = optionsList.indexOf(target as HTMLLIElement);
  if (targetIndex === 0) {
    lastElement.focus();
    return;
  }
  optionsList[targetIndex - 1].focus();
}

function focusNextOption(e: KeyboardEvent) {
  const target = e.target as Element;
  if (!target) return;
  const optionsList = getOptionsElements();
  if (optionsList.length === 0) return;
  const firstElement = optionsList[0];
  // If it's the button then select the first element
  if (target.classList.contains("selector")) {
    firstElement.focus();
    return;
  }
  const targetIndex = optionsList.indexOf(target as HTMLLIElement);
  if (targetIndex === optionsList.length - 1) {
    firstElement.focus();
    return;
  }
  optionsList[targetIndex + 1].focus();
}

function updateSearch(result: unknown) {
  searchResult.result = result as { id: string }[];
}

onMounted(() => {
  window.addEventListener("keyup", closeDropdownOnEscapeAndTabOnOutFocus);
  window.addEventListener("click", closeDropdownOnClickingAway);
});

onUnmounted(() => {
  window.removeEventListener("keyup", closeDropdownOnEscapeAndTabOnOutFocus);
  window.removeEventListener("click", closeDropdownOnClickingAway);
});

defineExpose({
  validate,
  isErred,
  clearError,
  errorMessage,
});
</script>

<template>
  <div
    class="selector"
    :class="{
      'selector--selected': !!content,
      'selector--has-error': isErred,
      'selector--has-label': !!label,
      'selector--hover-label': hoverLabel || !!content,
      'selector--has-left-icon': !!leftIcon,
    }"
    @keyup.space="toggleShowOptions"
    @keyup.up="focusPrevOption"
    @keyup.down="focusNextOption"
    @keydown.space.prevent
    @keydown.up.prevent
    @keydown.down.prevent
  >
    <div class="selector__label" @click="openDropdown">{{ label }}</div>

    <GlassCard
      class="selector__button"
      tint="background-tertiary"
      no-back-shape
      :opacity="0.4"
      :blur="5"
      @click="toggleShowOptions"
    >
      <div tabindex="0">
        <Icon
          v-if="!!leftIcon"
          :name="leftIcon"
          size="28px"
          class="selector__left-icon"
          :fill="!!errorMessage ? 'error' : 'dark'"
        />

        <Transition name="fade">
          <span
            v-if="hoverLabel || !!content"
            class="selector__button-text"
            :class="{ 'selector__button-text--no-value': !selectedOption }"
          >
            {{
              (selectedOption && selectedOption[primaryKey]) ||
              defaultButtonText ||
              `Select a ${primaryKey}`
            }}
          </span>
        </Transition>

        <Icon
          name="Drop"
          class="selector__button-icon"
          :style="{
            transform: isDropdownOpen
              ? 'translateY(-50%) rotate(180deg)'
              : 'translateY(-50%)',
            fill: isErred ? 'error' : 'dark',
          }"
        />
      </div>
    </GlassCard>

    <Transition name="fade">
      <span v-if="isErred" class="selector__error">{{ errorMessage }}</span>
    </Transition>

    <Transition name="slide-down">
      <GlassCard
        v-if="isDropdownOpen"
        :id="identifier"
        tint="background-tertiary"
        no-back-shape
        :opacity="0.4"
        :blur="5"
        border-radius="md"
        class="dropdown"
        :class="{ 'dropdown--open': isDropdownOpen }"
      >
        <div>
          <InputSearch
            v-if="isSearchable"
            ref="searchField"
            v-model="searchQuery"
            class="dropdown__search"
            :search-keys="primaryKey"
            :search-elements="options"
            no-autocomplete
            @clear="clearSearch"
            @search-result="updateSearch"
          />

          <TransitionGroup name="input-select-search" tag="ul" class="options">
            <li
              v-for="option in isSearching ? searchResult.result : options"
              :key="option.id"
              class="option"
              :class="{ 'option--selected': option.id === content }"
              tabindex="0"
              @keyup.up="focusPrevOption"
              @keyup.down="focusNextOption"
              @keyup.space="selectOnSpace"
              @keydown.space.prevent
              @keydown.up.prevent
              @keydown.down.prevent
            >
              <input
                :id="option.id.toString()"
                type="radio"
                class="option__input"
                :name="name || identifier"
                :value="option.id"
                @change="select"
              />
              <label
                class="option__label"
                :for="option.id.toString()"
                @click="closeDropdown"
              >
                {{ option[primaryKey] }}
              </label>
            </li>
          </TransitionGroup>
        </div>
      </GlassCard>
    </Transition>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.selector
  +pos-r
  +br-md

  +e(label)
    +zi(selector-label)
    +tran
    +center-v
    +pos-a(left 10px)
    +clr-txt
    +fnt-medium
    +no-select
    +clickable
    opacity: 0.6

  +e(button)
    +zi(selector)
    > div
      +focus-effect(input)
      +pos-r
      +size(100% 45px)
      +br-md
      +brdr(none)
      +clickable

  +m(has-label)
    +mt(15px)

  +m(hover-label)
    .selector__label
      top: -10px
      left: 5px !important
      opacity: 1
      +fnt-xs

  +e(error)
    +pos-a(left 10px top 50px)
    +clr-txt(error)
    +fnt-xs

  +e(button-text)
    +center-v
    left: 10px
    +m(no-value)
      +clr-txt($opacity: 60)

  +e(button-icon)
    +tran(transform)
    +center-v
    right: 20px

  +e(left-icon)
    +center-v
    left: 12px

  +m(has-left-icon)
    .selector
      +e(label)
        left: 50px

      +e(button-text)
        +pl( 30px)

  +m(has-error)
    +mb(15px)
    +e(selector, button)
      > div
        +clr(error, border-color)

    +e(selector, button-icon)
      :deep(svg)
        +clr(error, fill)

    .selector__button-text,
    .selector__label
      +clr-txt(error)

  .dropdown
    +pos-r
    +zi(selector-dropdown)
    > div
      +pos-a(top 5px)
      +pa(10px)
      +w(100%)
      +h(max 200px)
      +scroll
      +br-md
      +brdr(none)
      overflow-x: auto

    .options
      +list-reset
      +mt(5px)

      .option
        +br-sm
        +focus-effect(input)
        +pa(5px 10px)

        &:hover,
        &:focus
          +clr-bg(secondary)

        +m(selected)
          +clr-bg

        &:not(:last-child)
          +mb(5px)

        +e(input)
          +input-radio-reset

        +e(label)
          +tran(color)
          +block
          +clickable

  +m(has-error)
    .dropdown
      > div
        +clr(error, border-color)
</style>
