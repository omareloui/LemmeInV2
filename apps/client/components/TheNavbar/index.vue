<script setup lang="ts">
import { useThemeStore } from "store/useTheme";
import { useAuthStore } from "store/useAuth";

const router = useRouter();
const themeStore = useThemeStore();
const authStore = useAuthStore();

const isOptionsShown = ref(false);

const currentTheme = computed(() => themeStore.currentTheme);
const isSigned = computed(() => authStore.isSigned);

const menu = reactive({
  options: [
    {
      button: {
        icon: "vault",
        description: "vault",
        iconViewBox: "32 25.6",
      },
      onClick: () => router.push("/vault"),
    },
    {
      button: {
        icon: "note",
        description: "secure notes",
      },
      onClick: () => router.push("/notes"),
    },
    {
      button: {
        icon: "tags",
        description: "tags",
        iconViewBox: "28.3 32",
      },
      onClick: () => router.push("/tags"),
    },
    {
      button: {
        icon: "password-health",
        description: "passwords health",
        iconViewBox: "31.1 32",
      },
      onClick: () => router.push("/passwords-health"),
    },
    {
      button: {
        icon: "dashboard",
        description: "dashboard",
        iconViewBox: "32 26.7",
      },
      onClick: () => router.push("/dashboard"),
      doNotShow: !authStore.isSigned || authStore.user?.role !== "admin",
    },
    {
      button: {
        icon: "settings",
        description: "account settings",
        iconViewBox: "28.8 32",
      },
      onClick: () => router.push("/settings"),
    },
    {
      button: {
        icon:
          themeStore.currentTheme === "light" ? "dark-theme" : "light-theme",
        description: `${
          themeStore.currentTheme === "dark" ? "light" : "dark"
        } theme`,
      },
      onClick: themeStore.toggleTheme,
    },
    {
      button: {
        icon: "logout",
        description: "logout",
        iconViewBox: "25.6 32",
      },
      onClick: async () => {
        await authStore.signOut();
        router.push("/");
      },
    },
  ],
});

function closeMenu() {
  isOptionsShown.value = false;
}

function openMenu() {
  isOptionsShown.value = true;
}

function toggleMenu() {
  if (isOptionsShown.value) closeMenu();
  else openMenu();
}

function handleClick(e: MouseEvent) {
  const clickedElements = e.composedPath() as HTMLElement[];
  let shouldClose = true;
  clickedElements.forEach(x => {
    if (x?.classList?.contains("menu__button")) shouldClose = false;
  });
  if (shouldClose) closeMenu();
}

function initEvents() {
  window.addEventListener("click", handleClick);
}

function removeEvents() {
  window.removeEventListener("click", handleClick);
}

watch(currentTheme, newValue => {
  menu.options = menu.options.map(x => {
    const options = x;
    if (options.button.icon.includes("theme"))
      if (newValue === "light") {
        options.button.icon = "dark-theme";
        options.button.description = "dark theme";
      } else {
        options.button.icon = "light-theme";
        options.button.description = "light theme";
      }
    return options;
  });
});

onMounted(initEvents);
onBeforeUnmount(removeEvents);
</script>

<template>
  <header>
    <Container no-heading>
      <div class="home header--left">
        <GlassCard class="glass-nav" no-back-shape tint="background-main">
          <!-- <LinkBase :to="isSigned ? '/home' : '/'">
            <Icon
              name="logo"
              size="100%"
              fill="primary"
              view-box="32 30"
            ></Icon>
          </LinkBase> -->
        </GlassCard>
      </div>

      <span class="gap"></span>

      <Transition name="fade">
        <div v-if="isSigned" class="menu header--right">
          <ButtonGlass
            class="menu__button"
            icon="nav-menu"
            icon-view-box="32 7.5"
            aria-label="nav menu"
            @click="toggleMenu"
          />

          <Transition name="nav-menu">
            <nav v-if="isOptionsShown" class="menu__options">
              <ButtonGlass
                v-for="(option, index) in menu.options.filter(
                  x => !x.doNotShow,
                )"
                :key="index"
                v-bind="option.button"
                @click="option.onClick"
              />
            </nav>
          </Transition>
        </div>
      </Transition>

      <Transition name="fade">
        <nav v-if="!isSigned" class="auth header--right">
          <GlassCard no-back-shape tint="background-main">
            <div class="glass-nav">
              <!-- <LinkBase to="/signin">Sign in</LinkBase>
              <LinkBase class="cta" to="/sign-up" is-cta>Sign up</LinkBase> -->
            </div>
          </GlassCard>
        </nav>
      </Transition>
    </Container>
  </header>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

header
  +py(10px)
  +zi(nav)
  +pos-s(top 0)
  +not-clickable

  .glass-nav
    +size(100%)

  &:deep(.container)
    +grid(1fr auto 2fr, $areas: "header-left - header-right", $gap: 10px, $center: true)
    height: 100%

  // Add grid areas
  @each $grid-area in left right
    .header--#{$grid-area}
      grid-area: header-#{$grid-area}

  .header
    +m(left)
      justify-self: start
    +m(right)
      justify-self: right

  .home
    +size(76px 70px)
    a
      display: inline-block
      +size(100%)
      +clickable
      +pa(5px)
      +br-lg

  .menu
    +e(options)
      +pos-a
      +grid($gap: 10px)
      top: calc(100% - 10px)

  .auth
    .glass-nav
      +w(min-content)
      +grid(repeat(2, 1fr), $gap: 15px)
      +no-wrap
      +pa(5px 10px)
      +br-lg

    a
      +no-underline
      +clr-txt
      +fnt(nav)
      +fnt-xl
      +clickable
      &.cta
        +clr-txt(primary)
</style>
