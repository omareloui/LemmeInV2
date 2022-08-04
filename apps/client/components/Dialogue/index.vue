<script setup lang="ts">
withDefaults(
  defineProps<{
    isShown: boolean;
    noCloseButton?: boolean;
  }>(),
  { noCloseButton: false },
);

const emit = defineEmits(["close"]);

function closeDialogue() {
  emit("close");
}

function onKeyUp(e: KeyboardEvent) {
  if (e.code === "Escape") closeDialogue();
}

function initEvents() {
  window.addEventListener("keyup", onKeyUp);
}

function removeEvents() {
  window.removeEventListener("keyup", onKeyUp);
}

onMounted(initEvents);
onBeforeUnmount(removeEvents);
</script>

<template>
  <Transition name="dialogue">
    <GlassCard
      v-if="isShown"
      border-radius="none"
      no-back-shape
      tint="background-main"
      :blur="10"
      class="dialogue-wrapper"
    >
      <div class="dialogue">
        <div class="dialogue__body">
          <slot></slot>
          <ButtonGlass
            v-if="!noCloseButton"
            class="close"
            icon="Close"
            color="cancel"
            @click="closeDialogue"
          />
        </div>
      </div>
    </GlassCard>
  </Transition>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.dialogue-wrapper
  +zi(dialogue)
  +pos-f(top 0 left 0)

  .dialogue
    +w(100vw)
    +h(100vh)

    +e(body)
      +pos-r
      +scroll
      +center
      +w(min(90%, 600px))
      +h(max 90vh)
      +float(2)
      +br-lg
      +clr-bg(main)
      overflow-y: auto

    .close
      +pos-a(top 20px right 20px)
</style>
