<script setup lang="ts">
// Gestion du SEO
useHead({
  title: 'Tryphon Nuxt4 Base',
  meta: [
    { name: 'description', content: 'Outils personnels - Base Nuxt 4 avec MongoDB' }
  ]
})

// Liste des outils disponibles
const tools = [
  {
    icon: 'i-lucide-file-text',
    title: 'Gestion des Écrits',
    description: 'Interface de gestion des écrits dans la base MongoDB "envoutement"',
    to: '/db',
    color: 'green' as const
  }
]
</script>

<template>
  <UContainer class="py-16">
    <div class="space-y-16">
      <!-- En-tête Hero -->
      <div class="text-center space-y-6">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <UIcon name="i-lucide-rocket" class="w-10 h-10 text-primary" />
        </div>
        
        <h1 class="text-5xl font-bold tracking-tight">
          Tryphon Nuxt4 Base
        </h1>
        
        <p class="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Outils personnels développés avec Nuxt 4 et Nuxt UI
        </p>

        <div class="flex justify-center gap-4 pt-4">
          <UButton
            to="/db"
            size="xl"
            icon="i-lucide-file-text"
            trailing-icon="i-lucide-arrow-right"
          >
            Gestion des Écrits
          </UButton>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800"></div>

      <!-- Liste des outils -->
      <div>
        <h2 class="text-2xl font-bold text-center mb-8">
          Outils disponibles
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard
            v-for="tool in tools"
            :key="tool.to"
            :ui="{ 
              body: { padding: 'p-6' },
              header: { padding: '' }
            }"
            class="hover:ring-2 hover:ring-primary transition-all cursor-pointer"
            @click="navigateTo(tool.to)"
          >
            <div class="space-y-4">
              <div 
                class="inline-flex items-center justify-center w-12 h-12 rounded-lg"
                :class="`bg-${tool.color}-500/10`"
              >
                <UIcon :name="tool.icon" class="w-6 h-6" :class="`text-${tool.color}-500`" />
              </div>
              
              <div>
                <h3 class="text-lg font-semibold mb-2">
                  {{ tool.title }}
                </h3>
                <p class="text-gray-500 dark:text-gray-400 text-sm">
                  {{ tool.description }}
                </p>
              </div>

              <UButton
                :to="tool.to"
                variant="ghost"
                size="sm"
                trailing-icon="i-lucide-arrow-right"
                class="w-full"
              >
                Ouvrir
              </UButton>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Informations -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-info" class="w-5 h-5 text-primary" />
            <h3 class="text-lg font-semibold">À propos</h3>
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-300">
            Cette application est construite avec les technologies suivantes :
          </p>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="flex items-center gap-2">
              <UBadge color="green" variant="subtle">
                <UIcon name="i-simple-icons-nuxtdotjs" class="w-4 h-4" />
                <span class="ml-1">Nuxt 4</span>
              </UBadge>
            </div>
            
            <div class="flex items-center gap-2">
              <UBadge color="primary" variant="subtle">
                <UIcon name="i-lucide-palette" class="w-4 h-4" />
                <span class="ml-1">Nuxt UI</span>
              </UBadge>
            </div>
            
            <div class="flex items-center gap-2">
              <UBadge color="blue" variant="subtle">
                <UIcon name="i-simple-icons-typescript" class="w-4 h-4" />
                <span class="ml-1">TypeScript</span>
              </UBadge>
            </div>
            
            <div class="flex items-center gap-2">
              <UBadge color="green" variant="subtle">
                <UIcon name="i-lucide-database" class="w-4 h-4" />
                <span class="ml-1">MongoDB</span>
              </UBadge>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
  