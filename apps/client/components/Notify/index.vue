<script setup lang="ts">
import { useNotifyStore } from "store/useNotify";

const notifyStore = useNotifyStore();
</script>

<template>
  <div>
    <div class="notifications">
      <div
        v-for="notification in notifyStore.notifications"
        :key="notification.id"
        :class="`notification notification--${notification.type} ${
          notification.isShown ? 'notification--shown' : ''
        }`"
      >
        <Transition name="fade">
          <div v-if="notification.isShown" class="notification__content">
            {{ notification.message }}
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

$offset: 10px

.notifications
  +zi(notifications)
  +grid($gap: 5px)
  +pos-f(bottom $offset right $offset)
  +w(100%)
  +not-clickable

  .notification
    +grid($center-v: true)
    justify-self: right
    width: calc(100% - #{$offset} * 2)
    +center-text
    +fnt-lg

    +lt-tablet
      +w(auto)
      max-width: calc(var(--screen-tablet) - #{$offset * 2})
      text-align: left

    +e(content)
      +br-sm
      +pa(10px 20px)
      +clr-txt(light)

    // Set notifications colors
    @each $type in success error warn info
      &--#{$type} .notification__content
        +clr-bg($type)
</style>
