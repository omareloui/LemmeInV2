<script setup lang="ts">
const isMenuOpen = ref(false);
const isPassGenShown = ref(false);
const isAddPassShown = ref(false);
const defaultPasswordForAddPass = ref("");

function closeMenu() {
  isMenuOpen.value = false;
}
function openMenu() {
  isMenuOpen.value = true;
}
function toggleMenu() {
  if (isMenuOpen.value) closeMenu();
  else openMenu();
}

function handleClick(e: MouseEvent) {
  const clickedElements = e.composedPath() as HTMLElement[];
  let shouldClose = true;
  clickedElements.forEach(x => {
    if (x?.classList?.contains("open-menu")) shouldClose = false;
  });
  if (shouldClose) closeMenu();
}

function initEvents() {
  window.addEventListener("click", handleClick);
}

function removeEvents() {
  window.removeEventListener("click", handleClick);
}

function clearDefaultPass() {
  defaultPasswordForAddPass.value = "";
}

function closePassGen() {
  isPassGenShown.value = false;
}
function closeAddPass() {
  isAddPassShown.value = false;
  clearDefaultPass();
}
function closeAllDialogues() {
  closePassGen();
  closeAddPass();
}

function openAddPass() {
  closeAllDialogues();
  isAddPassShown.value = true;
}

function openPassGen() {
  closeAllDialogues();
  isPassGenShown.value = true;
}

function savePassword(password: string) {
  closeAllDialogues();
  openAddPass();
  defaultPasswordForAddPass.value = password;
}

onMounted(initEvents);
onBeforeMount(removeEvents);
</script>

<template>
  <div class="floating-menu" :class="{ 'floating-menu--open': isMenuOpen }">
    <ButtonGlass
      class="open-menu"
      icon="Add"
      size="50px"
      :color="isMenuOpen ? 'cancel' : 'primary'"
      aria-label="floating menu"
      @click="toggleMenu"
    />

    <Transition name="floating-menu">
      <div v-if="isMenuOpen" class="options">
        <ButtonGlass
          class="options__button"
          icon="Generate"
          icon-view-box="24.8 32"
          size="50px"
          aria-label="generate password"
          @click="openPassGen"
        />

        <ButtonGlass
          class="options__button"
          icon="Key"
          size="50px"
          aria-label="add new password"
          @click="openAddPass"
        />
      </div>
    </Transition>

    <Dialogue :is-shown="isAddPassShown" @close="closeAddPass">
      <AccountAdd
        :password="defaultPasswordForAddPass"
        @close-dialogue="closeAddPass"
      />
    </Dialogue>
    <Dialogue :is-shown="isPassGenShown" @close="closePassGen">
      <PasswordGenerator @save-password="savePassword" />
    </Dialogue>
  </div>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.floating-menu
  +zi(floating-menu)
  +pos-f(bottom 20px right 30px)

  // Open button
  .open-menu
    +tran(transform, 100ms)

  +m(open)
    .open-menu
      transform: rotate(45deg)

  // Options buttons
  .options
    +pos-a(bottom 120%)
    +grid($gap: 10px)
</style>
