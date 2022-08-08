<script setup lang="ts">
import type { ClientAccount as Acc } from "types";

type Account = Acc<"Native" | "OAuthed">;

defineProps<{ accounts: Account[] }>();
</script>

<template>
  <div class="new-added">
    <div class="title">
      <h3 class="title__heading">Newly added</h3>
      <LinkBase class="title__link" to="/vault">Go to vault</LinkBase>
    </div>
    <div class="accounts">
      <AccountPreview
        v-for="acc in accounts"
        :key="acc._id"
        :account="acc"
        no-tags
        no-date
        include-strength
        no-copy-account-identifier
      />
    </div>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.new-added
  .title
    +flex($space-between: true, $wrap: false, $gap: 5px)
    +w(100%)
    +mb(10px)
    +e(heading)
      align-self: baseline
      +fnt-4xl
    +e(link)
      +underline
      +italic
      +fnt-sm
      +clr-txt(main, $opacity: 0.8)
      +no-wrap
      align-self: baseline

  .accounts
    +grid($gap: 20px)
</style>
