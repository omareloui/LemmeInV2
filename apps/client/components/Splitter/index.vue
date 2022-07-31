<template>
  <hr />
</template>

<style lang="sass" scoped>
@use "~/assets/scss/mixins" as *

hr
  +brdr(none, 0)
  +h(1px)
  +clr-bg(tertiary, $opacity: 0.8)
</style>
