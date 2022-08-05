<script setup lang="ts">
import Fuse from "fuse.js";
import _ from "lodash";

import InputBase from "./Base.vue";

const inputEl = ref<InstanceType<typeof InputBase> | null>(null);

const { debounce } = _;

type SearchFunc = (query: string) => unknown[];

const props = withDefaults(
  defineProps<{
    modelValue: string;
    identifier?: string;
    name?: string;
    placeholder?: string;
    hint?: string;
    label?: string;
    notRequired?: boolean;
    noAutoComplete?: boolean;
    focusOnMount?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    invalidPatternMessage?: string;
    searchFunction?: SearchFunc;

    searchKeys: string | string[];
    searchElements: unknown[];

    debouncingDuration?: number;

    listenForSlash?: boolean | (() => boolean);
  }>(),
  {
    identifier: "search",
    placeholder: "Search",
    minLength: 0,
    maxLength: 150,
    noAutoComplete: true,
    focusOnMount: false,
    debouncingDuration: 200,
    listenForSlash: false,
    name: undefined,
    hint: undefined,
    label: undefined,
    pattern: undefined,
    invalidPatternMessage: undefined,
    searchFunction: undefined,
  },
);

function defaultSearch(query: string): ReturnType<SearchFunc> {
  if (!query || !props.searchElements || props.searchElements.length === 0)
    return [];
  const fuseOptions: { keys?: string[] } = {};
  const isObj = !!(typeof props.searchElements[0] === "object");
  if (isObj)
    fuseOptions.keys = Array.isArray(props.searchKeys)
      ? props.searchKeys
      : [props.searchKeys];

  const fuse = new Fuse(props.searchElements, fuseOptions);
  if (!props.searchKeys || props.searchKeys.length === 0)
    throw new Error("You have to provide search key(s)");
  return fuse.search(query).map(x => x.item);
}

const emit = defineEmits<{
  (e: "search-result", value: ReturnType<SearchFunc> | undefined): void;
  (e: "clear"): void;
  (e: "update:modelValue", value: unknown): void;
}>();

const content = useModelWrapper(props, emit);

const isSearching = computed(() => !!content.value);

const debouncedSearch = debounce(
  props.searchFunction || defaultSearch,
  props.debouncingDuration,
);

function search(query: string) {
  try {
    emit("search-result", debouncedSearch(query));
  } catch (e) {
    const { $notify } = useNuxtApp();
    $notify.error("No search key provided.");
  }
}

function focus() {
  if (inputEl.value) inputEl.value.focus();
}

function shouldFocusOnSlash() {
  let shouldFocus = false;
  if (typeof props.listenForSlash === "function")
    shouldFocus = props.listenForSlash();
  else if (typeof props.listenForSlash === "boolean")
    shouldFocus = props.listenForSlash;
  return shouldFocus;
}

function onKeyUp(e: KeyboardEvent) {
  const isSlashKey = e.code === "Slash";
  const shouldFocus = shouldFocusOnSlash();
  if (shouldFocus && isSlashKey) focus();
}

function onInput() {
  search(content.value);
}

function clear() {
  emit("clear");
  focus();
}

onMounted(() => {
  window.addEventListener("keyup", onKeyUp);
});

onUnmounted(() => {
  window.removeEventListener("keyup", onKeyUp);
});

defineExpose({ search, focus });
</script>

<template>
  <InputBase
    ref="inputEl"
    v-bind="props"
    v-model="content"
    :name="name || identifier"
    type="search"
    left-icon="search"
    :right-icon="isSearching ? 'CloseCircled' : undefined"
    not-required
    @input="onInput"
    @right-icon-click="clear"
  />
</template>
