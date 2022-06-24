<script setup lang="ts">
import { useConfirmStore } from "store/useConfirm";

const confirmStore = useConfirmStore();

function select(selected: "accept" | "cancel") {
  let isConfirmed = false;
  if (selected === "accept") isConfirmed = true;
  confirmStore.select(isConfirmed);
}
</script>

<template>
  <Dialogue
    no-close-button
    :is-shown="confirmStore.isConfirming"
    class="confirmation-dialogue"
    @close="select('cancel')"
  >
    <div class="confirmation">
      <div class="confirmation__body">
        {{ confirmStore.message }}
      </div>
      <div v-if="confirmStore.description" class="confirmation__description">
        {{ confirmStore.description }}
      </div>
      <div class="confirmation__buttons">
        <ButtonMain large color="info" @click="select('accept')">
          {{ confirmStore.acceptMessage }}
        </ButtonMain>
        <ButtonMain button-main large color="cancel" @click="select('cancel')">
          Cancel
        </ButtonMain>
      </div>
    </div>
  </Dialogue>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.confirmation-dialogue
  :deep(.dialogue__body)
    +pa(55px)
    +center-text

  .confirmation
    +e(body)
      +fnt-2xl

    +e(description)
      +mt(10px)
      +fnt-sm
      +clr-txt(main, $opacity: 0.8)

    +e(buttons)
      +mt(20px)
      +grid(1fr, $gap: 20px, $center: true)
      +lt-mobile
        grid-template-columns: 1fr 1fr
</style>
