<script setup lang="ts">
import { SwiperSlide } from "swiper/vue";

import { useThemeStore } from "store/useTheme";

import capitalize from "utils/capitalize";
import getIcon from "utils/getIcon";

import type { ClientAccount as Acc } from "types";

type Account = Acc<"Native" | "OAuthed">;

const props = defineProps<{ accounts: Account[] }>();
const themeStore = useThemeStore();

const accounts = props.accounts.map(x => ({ ...x, icon: getIcon(x) }));
</script>

<template>
  <div class="recent-accounts">
    <div class="title">
      <h3 class="title__heading">Recently used</h3>
      <LinkBase class="title__link" to="/vault">Go to vault</LinkBase>
    </div>

    <Slider :item-width="85" :gap="10">
      <SwiperSlide v-for="acc in accounts" :key="acc._id" class="account">
        <GlassCard
          class="account__card"
          :blur="10"
          :opacity="0.4"
          back-shape="circle"
          back-shape-size="60%"
          :back-shape-color="
            Array.isArray(acc.icon.color)
              ? themeStore.currentTheme === 'light'
                ? acc.icon.color[0]
                : acc.icon.color[1]
              : acc.icon.color
          "
          tint="background-secondary"
          is-back-shape-hex-color
        >
          <LinkBase class="account__icon-wrapper" :to="`/vault/${acc._id}`">
            <Icon
              :name="`App${capitalize(acc.icon.name)}`"
              :fill="acc.icon.color"
              :view-box="acc.icon.viewBox"
              size="60px"
              :aria-label="acc.icon.name"
            />
          </LinkBase>
        </GlassCard>
      </SwiperSlide>
    </Slider>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.recent-accounts

  .title
    +flex($space-between: true, $wrap: false, $gap: 5px)
    +w(100%)
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

  .account
    +e(card)
      +pos-r
      +size(85px)
    +e(icon-wrapper)
      +pos-r
      +block
      +size(100%)
      +br-xl
      i
        +center
</style>
