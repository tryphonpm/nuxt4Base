<script setup lang="ts">
// Forcer le mode light pour l'impression
const colorMode = useColorMode()
colorMode.preference = 'light'
</script>

<template>
  <div class="min-h-screen bg-white">
    <slot />
  </div>
</template>

