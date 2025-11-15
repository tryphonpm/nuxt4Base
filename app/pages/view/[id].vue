<script setup lang="ts">
import type { IEcrit, ILigne } from '../../../server/models/Ecrit'

const route = useRoute()
const router = useRouter()

// Récupérer l'ID depuis l'URL
const ecritId = route.params.id as string

// Gestion du SEO
useHead({
  title: 'Visualiser un écrit - Envoûtement',
  meta: [
    { name: 'description', content: 'Visualiser un écrit dans MongoDB' }
  ]
})

// Charger l'écrit à visualiser
const { data: ecritData, pending, error: loadError } = await useFetch<{ success: boolean, data: IEcrit }>(`/api/ecrits/${ecritId}`)

// Obtenir l'écrit
const ecrit = computed(() => ecritData.value?.data || null)

// Formater la date
function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Obtenir le style CSS pour une ligne
function getLineStyle(ligne: ILigne) {
  const styles: any = {
    paddingLeft: `${ligne.nbrTab * 2}rem`
  }
  
  switch (ligne.style) {
    case 'italique':
      return { ...styles, fontStyle: 'italic' }
    case 'gras':
      return { ...styles, fontWeight: 'bold' }
    case 'citation':
      return { ...styles, fontStyle: 'italic', color: '#6b7280', borderLeft: '3px solid #9ca3af', paddingLeft: `${ligne.nbrTab * 2 + 1}rem` }
    case 'code':
      return { ...styles, fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }
    default:
      return styles
  }
}
</script>

<template>
  <UContainer class="py-8">
    <!-- Loader pendant le chargement -->
    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-12" />
      <USkeleton class="h-64" />
    </div>

    <!-- Erreur de chargement -->
    <UAlert
      v-else-if="loadError"
      icon="i-lucide-alert-circle"
      color="error"
      title="Erreur de chargement"
      description="Impossible de charger l'écrit. Vérifiez que l'ID est correct."
      class="mb-8"
    >
      <template #actions>
        <UButton to="/liste" color="neutral" variant="outline">
          Retour à la liste
        </UButton>
      </template>
    </UAlert>

    <!-- Affichage de l'écrit -->
    <div v-else-if="ecrit" class="space-y-8">
      <!-- En-tête avec breadcrumb -->
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <NuxtLink to="/" class="hover:text-primary">Accueil</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          <NuxtLink to="/liste" class="hover:text-primary">Liste des écrits</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          <span>Visualiser</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h1 class="text-3xl font-bold">{{ ecrit.titre }}</h1>
            <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-3">
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-hash" class="w-4 h-4" />
                <span>Index: {{ ecrit.index }}</span>
              </div>
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-align-left" class="w-4 h-4" />
                <span>{{ ecrit.lignes.length }} ligne{{ ecrit.lignes.length > 1 ? 's' : '' }}</span>
              </div>
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                <span>{{ formatDate(ecrit.createdAt!) }}</span>
              </div>
            </div>
          </div>
          <div class="flex gap-3">
            <UButton
              to="/liste"
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="outline"
            >
              Retour
            </UButton>
            <UButton
              :to="`/edit/${ecrit._id}`"
              icon="i-lucide-pencil"
              color="primary"
            >
              Éditer
            </UButton>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800"></div>

      <!-- Contenu de l'écrit -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-text" class="w-5 h-5 text-primary" />
            <h2 class="text-xl font-semibold">Contenu de l'écrit</h2>
          </div>
        </template>

        <div class="space-y-4">
          <div
            v-for="(ligne, index) in ecrit.lignes"
            :key="index"
            class="py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors rounded-lg px-3 -mx-3"
          >
            <div class="flex items-start gap-3">
              <UBadge color="neutral" variant="soft" size="sm" class="mt-1 min-w-[3rem] justify-center">
                {{ index + 1 }}
              </UBadge>
              <div class="flex-1">
                <p :style="getLineStyle(ligne)" class="text-base leading-relaxed">
                  {{ ligne.ligne }}
                </p>
                <div v-if="ligne.style !== 'normal' || ligne.nbrTab > 0" class="flex items-center gap-2 mt-2">
                  <UBadge
                    v-if="ligne.style !== 'normal'"
                    color="primary"
                    variant="soft"
                    size="xs"
                  >
                    {{ ligne.style }}
                  </UBadge>
                  <UBadge
                    v-if="ligne.nbrTab > 0"
                    color="neutral"
                    variant="soft"
                    size="xs"
                  >
                    {{ ligne.nbrTab }} tab{{ ligne.nbrTab > 1 ? 's' : '' }}
                  </UBadge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Métadonnées -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-info" class="w-5 h-5 text-primary" />
            <h2 class="text-xl font-semibold">Métadonnées</h2>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Index</div>
            <div class="text-lg font-semibold">{{ ecrit.index }}</div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Nombre de lignes</div>
            <div class="text-lg font-semibold">{{ ecrit.lignes.length }}</div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">ID MongoDB</div>
            <div class="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">{{ ecrit._id }}</div>
          </div>
        </div>

        <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">Dates</div>
          <div class="space-y-1 text-sm">
            <div><span class="font-medium">Créé le :</span> {{ formatDate(ecrit.createdAt!) }}</div>
            <div v-if="ecrit.updatedAt"><span class="font-medium">Modifié le :</span> {{ formatDate(ecrit.updatedAt!) }}</div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Cas où l'écrit n'a pas été trouvé -->
    <UAlert
      v-else
      icon="i-lucide-alert-circle"
      color="error"
      title="Écrit introuvable"
      description="L'écrit que vous essayez de visualiser n'existe pas ou n'a pas pu être chargé."
    >
      <template #actions>
        <UButton to="/liste" color="neutral" variant="outline">
          Retour à la liste
        </UButton>
      </template>
    </UAlert>
  </UContainer>
</template>
