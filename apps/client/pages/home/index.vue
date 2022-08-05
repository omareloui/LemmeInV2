<script setup lang="ts">
import { useVaultStore } from "store/useVault";
import { useAnalyzeStore } from "store/useAnalyze";

type Strength = "compromised" | "weak" | "okay" | "safe";

const vaultStore = useVaultStore();
const analyzeStore = useAnalyzeStore();

function getStrengthColor(s: Strength, accountsCounter: number) {
  if (["compromised", "weak", "okay"].includes(s) && accountsCounter === 0)
    return "safe";
  if (s === "okay") return "warn";
  if (s === "safe") return "safe";
  return "danger";
}
</script>

<template>
  <Container padding-bottom no-heading class="home">
    <section class="accounts-health">
      <HomeAccountsSummery />
    </section>

    <section class="strength-summery">
      <div class="strength-summery__cards">
        <HomeStrengthSummery
          v-for="strength in (['safe', 'okay', 'weak', 'compromised'] as const)"
          :key="strength"
          :title="strength"
          :number="analyzeStore[strength].counter"
          :color="getStrengthColor(strength, analyzeStore[strength].counter)"
        />
        <HomeStrengthSummery
          v-for="prop in (['outdated', 'duplicated'] as const)"
          :key="prop"
          :title="prop"
          :number="analyzeStore[prop].counter"
          :color="analyzeStore[prop].counter === 0 ? 'safe' : 'danger'"
        />
      </div>
      <!-- TODO: -->
      <!-- <LinkBase class="strength-summery__link" to="/accounts-health"
        >More info</LinkBase
      > -->
    </section>

    <section v-if="vaultStore.recentlyUsed.length" class="recently-used">
      <HomeRecentlyUsed :accounts="vaultStore.recentlyUsed" />
    </section>

    <section v-if="vaultStore.newlyAdded.length" class="newly-added">
      <HomeNewlyAdded :accounts="vaultStore.newlyAdded" />
    </section>
  </Container>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.accounts-health
  +mb(20px)

.strength-summery
  +e(cards)
    +grid(1fr, $gap: 20px, $center: true)
    +w(max 500px)
    +mx(auto)

    +lt-narrow
      +columns(repeat(2, 1fr))

    +lt-desktop
      +columns(repeat(6, 1fr))
      +w(max unset)
      +mx(unset)

  +e(link)
    +block
    +mt(5px)
    +center-text
    +underline
    +italic
    +fnt-lg

.recently-used,
.newly-added
  +mt(20px)
</style>
