<script setup lang="ts">
// Gestion du SEO
useHead({
  title: 'Accueil - Envoûtement',
  meta: [
    { name: 'description', content: 'Gestion des écrits MongoDB' }
  ]
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-8">
    <div class="text-center space-y-8 max-w-2xl">
      <!-- Titre -->
      <h1 class="text-6xl font-bold tracking-tight">
        Envoûtement
      </h1>

      <!-- Image -->
      <div class="relative w-full max-w-md mx-auto">
        <img 
          src="/img/papou.jpg" 
          alt="Papou" 
          class="w-full h-auto rounded-2xl shadow-2xl"
        />
      </div>

      <!-- Description optionnelle -->
      <p class="text-xl text-gray-500 dark:text-gray-400">
        Gestion des écrits
      </p>
    </div>
  </div>
</template>
