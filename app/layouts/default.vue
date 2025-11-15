<script setup lang="ts">
// Navigation items
const navigation = [
  {
    label: 'Créer un écrit',
    to: '/create',
    icon: 'i-lucide-file-plus'
  },
  {
    label: 'Liste des écrits',
    to: '/liste',
    icon: 'i-lucide-library'
  }
]
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-800">
        <NuxtLink to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <UIcon name="i-lucide-sparkles" class="w-6 h-6 text-primary" />
          <h1 class="text-xl font-bold">Envoûtement</h1>
        </NuxtLink>

      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4">
        <UColorModeButton />
        <ul class="space-y-1">
          <li v-for="item in navigation" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              active-class="bg-primary/10 text-primary font-semibold"
            >
              <UIcon :name="item.icon" class="w-5 h-5" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>© {{ new Date().getFullYear() }}</span>
          <!-- <UColorModeButton /> -->
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</template>

