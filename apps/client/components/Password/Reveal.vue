<script setup lang="ts">
const props = defineProps<{ password: string }>();

const isPassShown = ref(false);

const glassCardProps = {
  noBackShape: true,
  tint: "background-secondary",
};

function toggleShowPass() {
  isPassShown.value = !isPassShown.value;
}
</script>

<template>
  <GlassCard
    class="password-reveal"
    :class="{ 'password-reveal--shown': isPassShown }"
    v-bind="glassCardProps"
  >
    <div class="password-reveal__body">
      <span class="password">
        {{ isPassShown ? password : "********" }}
      </span>

      <GlassCard
        v-bind="glassCardProps"
        :blur="30"
        :opacity="0.8"
        class="overlay__wrapper"
      >
        <div class="overlay"></div>
      </GlassCard>

      <Icon
        class="icon"
        :name="isPassShown ? 'EyeClosed' : 'Eye'"
        size="28px"
        clickable
        focusable
        @click="toggleShowPass"
      />
    </div>
  </GlassCard>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.password-reveal
  --height: 45px

  +e(body)
    +pos-r
    +size(100% var(--height))
    +w(max calc(min(100vw, var(--container-width)) - 90px))
    +no-wrap
    +br-md
    +px(10px)
    overflow: hidden
    line-height: var(--height)

    .overlay
      +pos-a(top 0 left 0)
      +size(100%)
      +tran(opacity)

    .icon
      +center-v
      right: 10px

    .password
      +clr-txt(main, $opacity: 0.2)

  +m(shown)
    +e(password-reveal, body)
      .overlay
        opacity: 0
        +not-clickable
      .password
        +clr-txt(main)
</style>
