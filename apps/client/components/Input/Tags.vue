<script setup lang="ts">
import Fuse from "fuse.js";
import { Tag } from "types";
import { useTagsStore } from "~~/store/useTags.js";

type TagId = string;

const tagsStore = useTagsStore();

const searchInput = ref<HTMLInputElement | null>(null);

const props = withDefaults(
  defineProps<{
    identifier?: string;
    modelValue: TagId[];
    label?: string;
    notRequired?: boolean;
    leftIcon?: string;
    default?: TagId[];
  }>(),
  {
    identifier: "tags",
    label: "Tags",
    leftIcon: "Tags",
    default: undefined,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: TagId[]): void;
}>();

const content = useModelWrapper(props, emit);

const isFocus = ref(false);
const isLoadingCreating = ref(false);
const query = ref("");
const errorMessage = ref("");

const isErred = computed(() => !!errorMessage);

const shouldHoverLabel = computed(
  () => isFocus.value || !!query.value || !!content.value.length,
);
const couldCreate = computed(
  () =>
    query.value && tagsStore.tags.findIndex(x => x.name === query.value) === -1,
);
const selectedTags = computed(() =>
  content.value.map(tagId => tagsStore.tags.find(x => x && x.id === tagId)!),
);
const tagsToView = computed(() =>
  tagsStore.tags.filter(x => content.value.findIndex(y => y === x.id) === -1),
);

const tagsFuse = new Fuse(tagsToView.value, { keys: ["name"] });
const searchResult = computed(() =>
  tagsFuse.search(query.value).map(x => x.item),
);

if (props.default) content.value = props.default;

function setError(message: string) {
  errorMessage.value = message;
}
function clearError() {
  setError("");
}
function clearQuery() {
  query.value = "";
}
function focusOnSearch() {
  searchInput.value?.focus();
}
function onFocus() {
  isFocus.value = true;
}
function onBlur() {
  isFocus.value = false;
}

function removeTag(tag: Tag) {
  content.value = content.value.filter(x => x !== tag.id);
}

function selectTag(tag: Tag) {
  clearQuery();
  clearError();
  content.value = [...content.value, tag.id];
  focusOnSearch();
}

async function createTag() {
  try {
    clearError();
    isLoadingCreating.value = true;
    const tag = await tagsStore.addTag({ name: query.value });
    if (!tag) return;
    selectTag(tag);
  } finally {
    isLoadingCreating.value = false;
  }
}

function validate() {
  if (!props.notRequired && content.value.length === 0)
    setError("You have to select at least one tag");
}

defineExpose({ errorMessage, isErred, validate });
</script>

<template>
  <div
    :id="identifier"
    class="input-tags"
    :class="{
      'input-tags--hover-label': shouldHoverLabel,
      'input-tags--has-label': !!label,
      'input-tags--has-error': isErred,
      'input-tags--has-icon': !!leftIcon,
    }"
  >
    <GlassCard
      class="input-tags__body"
      tint="background-tertiary"
      no-back-shape
      :opacity="0.4"
      :blur="5"
      clickable
      @click="focusOnSearch"
    >
      <div>
        <Icon
          v-if="leftIcon"
          :name="leftIcon"
          size="28px"
          class="icon"
          :fill="isErred ? 'error' : undefined"
        />

        <span v-if="label" class="label">
          {{ label }}
          <span v-if="notRequired" class="label__optional">(optional)</span>
        </span>

        <TransitionGroup name="chips" tag="span" class="chips">
          <ChipTag
            v-for="tag in selectedTags"
            :key="tag.id"
            class="chips__chip"
            :tag="tag"
            @remove-tag="removeTag"
          />
        </TransitionGroup>

        <input
          ref="searchInput"
          v-model="query"
          type="text"
          class="input"
          :placeholder="shouldHoverLabel ? 'search tags...' : ''"
          @focus="onFocus"
          @blur="onBlur"
        />
      </div>
    </GlassCard>

    <Transition name="fade">
      <span v-if="isErred" class="error">{{ errorMessage }}</span>
    </Transition>

    <Transition name="slide-down">
      <GlassCard
        v-if="query.length > 1 || (isFocus && tagsToView.length > 0)"
        class="dropdown"
        tint="background-tertiary"
        border-radius="none"
        no-back-shape
        :opacity="0.4"
        :blur="5"
      >
        <div>
          <Transition name="fade">
            <ButtonMain
              v-if="query.length > 1"
              class="create"
              :disabled="!couldCreate"
              block
              cta
              :is-loading="isLoadingCreating"
              @click="createTag"
              >Create "{{ query }}"</ButtonMain
            >
          </Transition>
          <TransitionGroup name="input-select-search" tag="div">
            <div
              v-for="tag in query ? searchResult : tagsToView"
              :key="tag.id"
              class="tag"
              :style="{ '--color': `var(--clr-${tag.color})` }"
              tabindex="0"
              @click="selectTag(tag)"
              @keyup.space="selectTag(tag)"
              @keyup.enter="selectTag(tag)"
            >
              <span class="tag__color"></span>
              <div class="tag__name">{{ tag.name }}</div>
            </div>
          </TransitionGroup>
        </div>
      </GlassCard>
    </Transition>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.input-tags
  +pos-r

  .label
    +tran
    +center-v
    +pos-a(left 10px)
    +clr-txt
    +fnt-medium
    +no-select
    opacity: 0.6
    +e(optional)
      +fnt-xs
      +tran

  +e(body)
    +zi(selector)
    > div
      +pa(10px 20px)
      +pos-r
      +focus-effect(input)
      +w(100%)
      +h(min 45px)
      +br-md
      +brdr(none)
      +clickable

  .input
    +inline-block
    +w(min 75px)
    +h(max 25px)
    +fnt-sm
    +input-reset-appearance
    +brdr(none)
    +clr-bg(none)
    +clr-txt
    &:focus
      outline: none
      +brdr(none)

  .chips
    +e(chip)
      +my(2px)
      +mr(4px)

  +m(has-label)
    +mt(15px)

  +m(has-icon)
    .label
      left: 50px
    .input-tags
      +e(body)
        > div
          +pl(50px)
          .icon
            +center-v
            left: 12px

  +m(hover-label)
    .label
      top: -10px
      left: 5px !important
      opacity: 1
      +fnt-xs
      +e(optional)
        opacity: 0

  .dropdown
    +pos-r
    +zi(selector-dropdown)
    > div
      +pos-a(top 5px)
      +pa(10px)
      +w(100%)
      +h(max 200px)
      +no-scroll
      +br-md
      +brdr(none)
      overflow-x: auto

    .create
      +my(8px)

    .tag
      +pos-r
      +pa(8px 10px)
      +br-md
      +clickable
      +tran
      +focus-effect(input-select, focus hover)
      &:not(:last-child)
        +mb(2px)

      +e(color)
        +center-v
        +clr-bg(--color)
        +size(20px)
        +br-sm

      +e(name)
        +pl(35px)

  .error
    +pos-a(left 10px bottom 0)
    transform: translateY(100%)
    +clr-txt(error)
    +fnt-xs

  +m(has-error)
    +mb(15px)
    +e(input-tags, label)
      +clr-txt(error)
</style>
