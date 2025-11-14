<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'fr'
  }
})

const title = 'Tryphon Nuxt4 Base'
const description = 'Base Nuxt 4 avec MongoDB et Nuxt UI - Outils personnels'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Contenu principal -->
    <div class="flex-1">
      <NuxtPage />
    </div>

    <!-- Footer -->
    <footer class="border-t border-gray-200 dark:border-gray-800 mt-16">
      <UContainer class="py-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-simple-icons-nuxtdotjs" class="w-5 h-5 text-primary" />
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Tryphon • © {{ new Date().getFullYear() }}
            </p>
          </div>

          <UButton
            to="https://github.com/tryphonpm/nuxt4Base"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
            color="gray"
            variant="ghost"
            size="sm"
          />
        </div>
      </UContainer>
    </footer>
  </div>
</template>