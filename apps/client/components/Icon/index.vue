<script setup lang="ts">
import { useThemeStore } from "store/useTheme";
import capitalize from "utils/capitalize";

const themeStore = useThemeStore();

const props = withDefaults(
  defineProps<{
    name: string;
    size?: string;
    width?: string;
    height?: string;
    stroke?: string;
    viewBox?: string;
    fill?: string | string[];
    clickable?: boolean;
    focusable?: boolean;
    ariaLabel?: string;
  }>(),
  {
    size: "25px",
    width: undefined,
    height: undefined,
    stroke: undefined,
    viewBox: "32 32",
    fill: "text-main",
    ariaLabel: undefined,
  },
);

const emit = defineEmits(["click", "dblclick", "keyup:enter", "keyup:space"]);
const componentName = `Icon${capitalize(props.name).replace(/-/g, "")}`;
const IconComponent = resolveComponent(componentName);
</script>

<template>
  <i
    class="icon-wrapper"
    :class="{
      'icon-wrapper--clickable': clickable,
      'icon-wrapper--focusable': focusable,
    }"
    :style="{
      '--width': width || size,
      '--height': height || size,
      '--fill': Array.isArray(fill)
        ? themeStore.currentTheme === 'light'
          ? fill[0]
          : fill[1]
        : fill.match(/^#[\da-f]{3,8}$/i)
        ? fill
        : `var(--clr-${fill})`,
      '--stroke': stroke && `var(--clr-${stroke})`,
    }"
    :tabindex="focusable ? 0 : undefined"
    :aria-label="ariaLabel"
    @click="emit('click')"
    @dblclick="emit('dblclick')"
    @keyup.enter="emit('keyup:enter')"
    @keyup.space="emit('keyup:space')"
  >
    <svg :viewBox="`0 0 ${viewBox}`">
      <Transition name="fade">
        <IconAdd v-if="name === 'Add'" />
        <IconAccount v-else-if="name === 'Account'" />
        <IconApp v-else-if="name === 'App'" />
        <IconCheck v-else-if="name === 'Check'" />
        <IconClose v-else-if="name === 'Close'" />
        <IconCloseCircled v-else-if="name === 'CloseCircled'" />
        <IconCopy v-else-if="name === 'Copy'" />
        <IconDarkTheme v-else-if="name === 'DarkTheme'" />
        <IconDashboard v-else-if="name === 'Dashboard'" />
        <IconDrop v-else-if="name === 'Drop'" />
        <IconEdit v-else-if="name === 'Edit'" />
        <IconEye v-else-if="name === 'Eye'" />
        <IconEyeClosed v-else-if="name === 'EyeClosed'" />
        <IconGenerate v-else-if="name === 'Generate'" />
        <IconKey v-else-if="name === 'Key'" />
        <IconLightTheme v-else-if="name === 'LightTheme'" />
        <IconLink v-else-if="name === 'Link'" />
        <IconLogo v-else-if="name === 'Logo'" />
        <IconLogout v-else-if="name === 'Logout'" />
        <IconMail v-else-if="name === 'Mail'" />
        <IconNavMenu v-else-if="name === 'NavMenu'" />
        <IconNewTab v-else-if="name === 'NewTab'" />
        <IconNote v-else-if="name === 'Note'" />
        <IconPasswordHealth v-else-if="name === 'PasswordHealth'" />
        <IconQR v-else-if="name === 'QR'" />
        <IconReload v-else-if="name === 'Reload'" />
        <IconSearch v-else-if="name === 'Search'" />
        <IconSettings v-else-if="name === 'Settings'" />
        <IconTags v-else-if="name === 'Tags'" />
        <IconVault v-else-if="name === 'Vault'" />
        <Component :is="IconComponent" v-else></Component>
      </Transition>
    </svg>
  </i>
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

.icon-wrapper
  +pos-r
  +inline-block
  +h(var(--height))
  +w(var(--width))
  +focus-effect
  +br-sm

  svg
    +center
    +clr(--fill, fill)
    +clr(--stroke, stroke)
    +size(100%)

  +m(focusable)
    svg
      +focus-effect(icon)

  +m(clickable)
    +clickable
</style>
