<script setup lang="ts">
import type { Account } from "types";
import { useVaultStore } from "store/useVault";

const vaultStore = useVaultStore();

const route = useRoute();

const searchQuery = ref((route.query.search as string | undefined) || "");
const searchResult = reactive<{ accounts: Account[] }>({ accounts: [] });

function updateSearchResult(accounts: Account[]) {
  searchResult.accounts = accounts;
}

useMatchSearchQuery(searchQuery);
</script>

<template>
  <Container padding-bottom class="accounts-page">
    <template #heading>The Vault</template>
    <InputSearch
      v-if="vaultStore.hasAccounts"
      v-model="searchQuery"
      placeholder="Search the vault..."
      class="search-input"
      :search-elements="vaultStore.accounts"
      :search-keys="['app', 'accountIdentifier', 'site', 'tags.name']"
      @search-result="updateSearchResult($event as Account[])"
      @clear="searchQuery = ''"
    />

    <main>
      <div v-if="!vaultStore.hasAccounts" class="no-account">
        <div class="no-account__body">
          <h2 class="no-account__heading">No accounts yet!</h2>
          <span class="no-account__add">
            You can add an account by clicking on the floating menu on the
            bottom right.
          </span>
        </div>
      </div>

      <TransitionGroup
        v-if="vaultStore.hasAccounts"
        name="list"
        tag="div"
        class="accounts"
      >
        <div
          v-for="account in searchQuery
            ? searchResult.accounts
            : vaultStore.accounts"
          :key="account.id"
        >
          <AccountPreview v-bind="{ account }" include-strength />
        </div>
      </TransitionGroup>
    </main>
  </Container>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.accounts-page
  .search-input
    +my(20px)
    +lt-tablet
      +mx(min(100px, 5vw))

  main
    .accounts
      +grid($gap: 20px)

    .no-account
      +grid($center: true)
      +center-text
      +h(min 400px)
      +w(max 700px)
      +mx(auto)
      overflow: auto
      +no-scroll

      +e(heading)
        +clr-txt(main, $opacity: 0.8)
        +mb(20px)

      +e(add)
        +fnt-base
</style>
