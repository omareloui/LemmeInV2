<script setup lang="ts">
import getIcon from "utils/getIcon";
import capitalize from "utils/capitalize";

import type { Account } from "types";
import { useVaultStore } from "~~/store/useVault.js";

const props = withDefaults(
  defineProps<{
    account: Account;
    tagsToShow?: number;
    noDate?: boolean;
    noTags?: boolean;
    noCopyAccountIdentifier?: boolean;
    noCopyPassword?: boolean;
    includeStrength?: boolean;
  }>(),
  {
    tagsToShow: 5,
    noDate: false,
    noTags: false,
    noCopyAccountIdentifier: false,
    noCopyPassword: false,
    includeStrength: false,
  },
);

const icon = getIcon(props.account);

const showStrength = props.includeStrength && props.account.isNative;

function copyAccId() {
  const { $notify, $copy } = useNuxtApp();
  if (!props.account.accountIdentifier) $notify.error("No account identifier");
  else $copy(props.account.accountIdentifier);
}

function copy() {
  const vaultStore = useVaultStore();
  vaultStore.copy(props.account.id);
}
</script>

<template>
  <GlassCard no-back-shape tint="background-main" float>
    <div
      class="account"
      :class="{
        'account--has-strength': showStrength,
      }"
    >
      <div class="info">
        <PasswordStrength
          v-if="showStrength"
          class="info__strength"
          shape="dot"
          dot-size="10px"
          hide-score-text
          :decrypted-password="(account.password as string)"
        />

        <Icon
          class="info__icon"
          :name="`App${capitalize(icon.name)}`"
          :fill="icon.color"
          :view-box="icon.viewBox"
          size="40px"
        />

        <div class="info__text-info">
          <LinkBase class="app" :to="`/vault/${account.id}`">
            {{ account.app }}
          </LinkBase>
          <div v-if="account.accountIdentifier" class="account-identifier">
            {{ account.accountIdentifier }}
            <Icon
              v-if="!noCopyAccountIdentifier"
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
        </div>

        <Icon
          v-if="account.isNative && !noCopyPassword"
          class="info__copy"
          name="Copy"
          size="25px"
          view-box="25.6 32"
          clickable
          @click="copy"
        />
      </div>

      <div
        v-if="!noTags && account.tags && account.tags.length > 0"
        class="tags"
      >
        <LinkBase
          v-for="tag in [...account.tags!].splice(0, tagsToShow)"
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
        <span v-if="account.tags.length > tagsToShow" class="tags__more">
          +{{ account.tags.length - tagsToShow }}
        </span>
      </div>

      <div v-if="!noDate" class="created-at">
        Added {{ $dayjs(account.createdAt).fromNow() }}
      </div>
    </div>
  </GlassCard>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.account
  +br-lg
  +pa(10px 20px)

  .info
    +grid(45px 1fr 30px, $gap: 15px)

    +e(text-info)
      align-self: center
      overflow: auto
      +no-scroll
      .app
        +fnt(heading)
        +mb(3px)
      .account-identifier
        +clr-txt(main, $opacity: 0.5)

    +e(copy)
      align-self: center

  +m(has-strength)
    .info
      +grid(10px 45px 1fr 30px, $gap: 10px)
      +e(strength)
        align-self: center

  .tags
    +flex($gap: 4px 10px)
    +my(10px)

    +e(more)
      +inline-block
      +br-cr
      +size(30px)
      +fnt-xs
      +clr-bg(primary, $opacity: 0.4)
      +center-text
      line-height: 30px
      backdrop-filter: blur(4px)

  .created-at
    +clr-txt(main, $opacity: 0.5)
    +fnt-xs
    +mt(5px)
</style>
