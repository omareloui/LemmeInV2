<script setup lang="ts">
import type { ClientNote as Note } from "types";

const props = defineProps<{ note: Note }>();

const hasTags = props.note.tags && props.note.tags.length > 0;

function goToNote() {
  const router = useRouter();
  router.push(`notes/${props.note._id}`);
}
</script>

<template>
  <GlassCard
    class="note"
    tint="background-secondary"
    no-back-shape
    focusable
    clickable
    float
    @click="goToNote"
    @dblclick="goToNote"
    @keyup:space="goToNote"
    @keyup:enter="goToNote"
  >
    <div>
      <div class="note__content">
        <div v-if="note.title" class="note__title">{{ note.title }}</div>
        <Marked
          v-if="note.body"
          :content="note.body.slice(0, 550)"
          class="note__body"
        />
      </div>
      <Splitter v-if="hasTags" class="note__splitter" />
      <div v-if="hasTags" class="note__tags">
        <ChipTag
          v-for="tag in note.tags"
          :key="tag._id"
          v-bind="{ tag }"
          no-remove-button
          invert
          clickable
        />
      </div>
    </div>
  </GlassCard>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.note
  > div
    +br-md
    +clickable
    overflow: hidden

    > *:not(.note__splitter)
      +px(20px)

  +e(content)
    +pos-r
    +py(10px)
    &:after
      --clr: hsl(var(--clr-hs-background-secondary) var(--clr-l-background-secondary) / var(--clr-o-50))
      content: ""
      +pos-a(bottom 0 left 0)
      +block
      +size(100% 60%)
      +tran($duration: 100ms)
      +no-select
      +not-clickable

      background-image: linear-gradient(transparent, var(--clr))
    &:hover:after
      +h(100%)
      background-image: linear-gradient(transparent 0, var(--clr) 70%)

  +e(title)
    +fnt(heading)
    +fnt-2xl
    +fnt-bold

  +e(body)
    +clr-txt(main, $opacity: 0.8)
    +h(max 200px)
    +tran(color)
    overflow: hidden

  +e(tags)
    +flex($gap: 10px 15px, $center-v: true)
    +w(max 600px)
    +mx(auto)
    +py(20px)
</style>
