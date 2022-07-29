<script setup lang="ts">
import type { Tag } from "~~/types";

const props = defineProps<{ tag: Tag }>();

const emit = defineEmits<{ (e: "edit-tag", value: Tag): void }>();

function goToTag() {
  const router = useRouter();
  router.push(`/vault?tags=${props.tag.id}`);
}

function editTag() {
  emit("edit-tag", props.tag);
}
</script>

<template>
  <GlassCard
    class="tag"
    tint="background-secondary"
    no-back-shape
    focusable
    clickable
    float
    @click="editTag"
    @dblclick="goToTag"
    @keyup:space="editTag"
    @keyup:enter="editTag"
  >
    <div>
      <span
        class="tag__color"
        :style="{ '--color': `var(--clr-${tag.color})` }"
      ></span>
      <div class="tag__name">{{ tag.name }}</div>
      <div class="tag__accounts-count">{{ tag.accountsCount || 0 }}</div>
    </div>
  </GlassCard>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.tag
  > div
    +br-md
    +pa(20px)

  +e(color)
    +center-v
    +clr-bg(--color)
    +size(20px)
    +br-sm

  +e(name)
    +pl(35px)

  +e(accounts-count)
    --size: 30px
    +center-v
    +size(min-content var(--size))
    +px(8px)
    +fnt-sm
    +br-md
    +clr-bg(tertiary)
    right: 10px
    line-height: var(--size)
</style>
