<script setup lang="ts">
import { useVaultStore } from "store/useVault";
import { useAnalyzeStore } from "store/useAnalyze";
import capitalize from "utils/capitalize";
import getIcon from "utils/getIcon";

import type { Icon, Account } from "types";

const vaultStore = useVaultStore();

const route = useRoute();

const acc = (await vaultStore.getAccount(
  route.params.accountId as string,
)) as Account;
if (!acc) throw new Error("Can't find the required account");

const account = ref<Account>(acc);

const icon = ref<Icon | null>(null);
const isQRShown = ref(false);
const isUpdateAccountShown = ref(false);

let suggestions: string[] = [];
let duplications: Account[] = [];

if (account.value.isNative) {
  const analyzeStore = useAnalyzeStore();
  const { $getPasswordStrength } = useNuxtApp();

  suggestions = $getPasswordStrength(
    account.value.password as string,
  ).suggestions;
  duplications = analyzeStore.duplicated.accounts.filter(
    x => x.id !== account.value.id && x.password === account.value.password,
  );
}

function copyAccId() {
  const { $notify, $copy } = useNuxtApp();
  const accId = account.value.id;
  if (!accId) $notify.error("No account identifier");
  else $copy(accId);
}

function copy() {
  vaultStore.copy(account.value.id);
}

function loadIcon() {
  icon.value = getIcon(account.value);
}

function showQR() {
  isQRShown.value = true;
}

function closeQR() {
  isQRShown.value = false;
}

function showUpdateAccount() {
  isUpdateAccountShown.value = true;
}

function closeUpdateAccount() {
  isUpdateAccountShown.value = false;
}

async function updateAccountData(newAccount: Account) {
  const updatedAccount = await vaultStore.getAccount(newAccount.id);
  if (!updatedAccount) throw new Error("Can't find the account to update!");
  account.value = updatedAccount;
}

async function deleteAccount() {
  try {
    await vaultStore.deleteAccount({
      accountId: account.value.id,
      accountName: account.value.app,
    });
  } catch (e) {
    const { $notify } = useNuxtApp();
    $notify.error(useErrorMessage(e), { duration: 4000 });
  }
}

loadIcon();
</script>

<template>
  <Container padding-bottom class="account-page">
    <template #heading>{{ account.app }}</template>
    <main>
      <section
        class="primal-info"
        :class="{ 'primal-info--is-oauth': !account.isNative }"
      >
        <Icon
          v-if="icon"
          :name="`App${capitalize(icon.name)}`"
          :fill="icon.color"
          :view-box="icon.viewBox"
          size="50px"
        />

        <!-- TODO: add last used for not oauth passwords -->
        <div class="account-info">
          <div v-if="account.accountIdentifier" class="account-identifier">
            {{ account.accountIdentifier }}
            <Icon
              name="Copy"
              clickable
              aria-label="copy account identifier"
              size="15px"
              focusable
              @click="copyAccId"
              @keyup:enter="copyAccId"
              @keyup:space="copyAccId"
            />
          </div>

          <div v-if="account.site" class="site">
            <LinkNewTab :to="account.site">{{ account.site }}</LinkNewTab>
          </div>
        </div>

        <ButtonBase v-if="account.isNative" class="show-qr" @click="showQR">
          <Icon name="QR" size="40px" />
        </ButtonBase>
      </section>

      <section v-if="account.isNative" class="password">
        <PasswordReveal
          class="password-reveal"
          :password="(account.password as string)"
        />
        <Icon
          name="Copy"
          class="copy"
          clickable
          focusable
          size="35px"
          aria-label="copy password"
          @click="copy"
        />
        <PasswordStrength
          class="strength"
          line-height="10px"
          hide-score-text
          :decrypted-password="(account.password as string)"
        />
      </section>

      <section v-if="!account.isNative" class="oauth">
        <h3>Connected with</h3>
        <AccountPreview
          :account="(account.password as Account)"
          no-date
          no-tags
          include-strength
        />
      </section>

      <section v-if="account.tags && account.tags.length > 0" class="tags">
        <LinkBase
          v-for="tag in account.tags"
          :key="tag.id"
          :to="`/vault?tags=${tag.id}`"
        >
          <ChipTag
            class="tags__tag"
            v-bind="{ tag }"
            no-remove-button
            invert
            clickable
          />
        </LinkBase>
      </section>

      <section v-if="account.note" class="note">
        <Marked :content="account.note" class="note" />
      </section>

      <section
        v-if="account.isNative && suggestions.length > 0"
        class="make-better"
      >
        <h3>How to make the password better</h3>
        <ul class="suggestions">
          <li v-for="suggestion in suggestions" :key="suggestion">
            {{ suggestion }}
          </li>
        </ul>
      </section>

      <section
        v-if="account.isNative && duplications.length > 0"
        class="duplicated"
      >
        <h3>Duplicated with</h3>
        <div class="duplications">
          <AccountPreview
            v-for="duplication in duplications"
            :key="duplication.id"
            :account="duplication"
            no-date
            no-tags
            include-strength
            no-copy-password
          />
        </div>
      </section>

      <section class="edit-buttons">
        <ButtonMain large block color="info" @click="showUpdateAccount">
          Edit
        </ButtonMain>
        <ButtonMain large block color="danger" @click="deleteAccount">
          Delete
        </ButtonMain>
      </section>
    </main>

    <Dialogue :is-shown="isQRShown" @close="closeQR">
      <div class="dialogue-content">
        <QR :text="(account.password as string)" />
      </div>
    </Dialogue>
    <Dialogue :is-shown="isUpdateAccountShown" @close="closeUpdateAccount">
      <!-- TODO: -->
      <!-- <AccountEdit
        v-bind="account"
        :tags="account.tags.map(x => x.id)"
        @edit-account="updateAccountData"
        @close-dialogue="closeUpdateAccount"
      /> -->
    </Dialogue>
  </Container>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.account-page

  section.primal-info
    +mt(10px)
    +grid(50px 1fr 60px, $gap: 10px, $center-v: true)

    .account-info
      +w(max 100%)
      overflow: hidden
      .account-identifier
        +no-wrap
        +mb(8px)

      .site
        +mx(10px)
        :deep
          .link
            +fnt-xs
            +py(5px)
            > i
              right: 2px
              top: 2px

    .show-qr
      justify-self: end
      align-self: center
      > i
        +block

    +m(is-oauth)
      grid-template-columns: 50px 1fr

  section.password
    +my(20px)
    +grid($areas: "password copy" "strength strength", $columns: 1fr 50px, $gap: 15px 20px)
    .password-reveal
      grid-area: password
      overflow: hidden
      +w(max 100%)
    .copy
      grid-area: copy
      place-self: center
    .strength
      grid-area: strength

  section.oauth
    h3
      +my(5px)

  section.tags
    +flex($gap: 10px 15px, $center-v: true)
    +w(max 600px)
    +mx(auto)
    +my(30px)

  section.note
    +mb(10px)
    > :first-child
      +br-xl
      +pa(20px)
      +clr-bg(secondary)

  section.edit-buttons
    +grid(1fr, $gap: 10px, $center: true)
    +my(30px)
    +lt-mobile
      grid-template-columns: 1fr 1fr

  section.make-better
    .suggestions
      +ml(40px)
      +mt(10px)
      +fnt-lg

  section.duplicated
    .duplications
      +grid($gap: 20px)
      +mt(10px)

  .dialogue-content
    +pos-r
    +grid($center: true)
    +pa(30px)
    img
      +size(50vmin)
      +br-xl
</style>
