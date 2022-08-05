<script setup lang="ts">
import { useAnalyzeStore } from "store/useAnalyze";

const analyzeStore = useAnalyzeStore();
</script>

<template>
  <div class="accounts-summery-wrapper">
    <CircleBase class="circle circle--one" color="teal" size="150px" />
    <CircleBase class="circle circle--two" color="mauve" size="140px" />

    <GlassCard
      class="accounts-summery"
      no-back-shape
      tint="background-main"
      :blur="7"
    >
      <div>
        <h2 class="accounts-summery__title">Accounts Health</h2>
        <PercentagePreview
          class="accounts-summery__percentage"
          :percentage="analyzeStore.score"
          size="150px"
        />

        <Number
          tag="div"
          class="accounts-summery__total-accounts"
          :number="analyzeStore.totalAccounts"
          suffix=" accounts"
        />
      </div>
    </GlassCard>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.accounts-summery-wrapper
  +pos-r
  +w(max 500px)
  +mx(auto)

  .accounts-summery
    > div
      +pos-r
      +br-xl
      +pa(10px)

    +e(title)
      +center-text
      +fnt-4xl

    +e(percentage)
      +mx(auto)
      +my(10px)

    +e(total-accounts)
      +fnt-base
      +center-text

  .circle
    +pos-a
    +tran

    +m(one)
      top: -50px
      right: -40px

    +m(two)
      bottom: -20px
      left: -30px

    +lt-narrow
      +m(one)
        +size(200px)
      +m(two)
        +size(180px)

    +lt-tablet
      +m(one)
        +size(300px)
        top: -65px
        right: -50px
      +m(two)
        +size(260px)
        bottom: -80px
        left: -50px
</style>
