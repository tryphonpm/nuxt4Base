<script setup lang="ts">
import type { IEcrit, ILigne } from '../../server/models/Ecrit'

// Gestion du SEO
useHead({
  title: 'Liste des écrits - Envoûtement',
  meta: [
    { name: 'description', content: 'Liste de tous les écrits dans MongoDB' }
  ]
})

// Toast pour les notifications
const toast = useToast()

// Type pour la réponse API
interface ApiResponse {
  success: boolean
  data: IEcrit[]
  count: number
}

// État pour les écrits
const { data: ecritsData, refresh: refreshEcrits, pending } = await useFetch<ApiResponse>('/api/ecrits')

// Computed pour obtenir la liste des écrits
const ecrits = computed(() => ecritsData.value?.data || [])

// État pour l'écrit sélectionné (visualisation)
const selectedEcrit = ref<IEcrit | null>(null)
const isViewModalOpen = ref(false)

// Fonction pour visualiser un écrit
function visualiserEcrit(ecrit: IEcrit) {
  selectedEcrit.value = ecrit
  isViewModalOpen.value = true
}

// Fonction pour supprimer un écrit
async function supprimerEcrit(id: string) {
  try {
    const { error } = await useFetch(`/api/ecrits/${id}`, {
      method: 'DELETE'
    })

    if (error.value) {
      throw new Error(error.value.data?.message || 'Erreur lors de la suppression')
    }

    toast.add({
      title: 'Succès',
      description: 'Écrit supprimé avec succès',
      color: 'success'
    })

    await refreshEcrits()
  } catch (err: any) {
    toast.add({
      title: 'Erreur',
      description: err.message || 'Erreur lors de la suppression',
      color: 'error'
    })
  }
}

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
    <div class="space-y-8">
      <!-- En-tête -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Liste des écrits</h1>
          <p class="mt-2 text-gray-500 dark:text-gray-400">
            Base de données : <span class="font-semibold text-primary">envoutement</span> • Collection : <span class="font-semibold text-primary">ecrits</span>
          </p>
        </div>
        <div class="flex items-center gap-3">
          <UBadge v-if="ecrits.length > 0" size="lg" color="primary">
            {{ ecrits.length }} écrit{{ ecrits.length > 1 ? 's' : '' }}
          </UBadge>
          <UButton
            to="/create"
            icon="i-lucide-plus"
            size="lg"
          >
            Créer un écrit
          </UButton>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800"></div>

      <!-- Liste des écrits -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-library" class="w-5 h-5 text-primary" />
              <h2 class="text-xl font-semibold">Tous les écrits</h2>
            </div>
            <UButton
              @click="() => refreshEcrits()"
              :loading="pending"
              variant="outline"
              size="sm"
              icon="i-lucide-refresh-cw"
            >
              Actualiser
            </UButton>
          </div>
        </template>

        <div v-if="pending" class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-24" />
        </div>

        <div v-else-if="ecrits.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📝</div>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            Aucun écrit dans la base de données
          </p>
          <UButton
            to="/create"
            icon="i-lucide-plus"
            size="lg"
          >
            Créer votre premier écrit
          </UButton>
        </div>

        <div v-else class="space-y-4">
          <UCard
            v-for="ecrit in ecrits"
            :key="ecrit._id"
            class="p-4"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold mb-2">{{ ecrit.titre }}</h3>
                <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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

              <div class="flex gap-2">
                <UButton
                  @click="visualiserEcrit(ecrit)"
                  icon="i-lucide-eye"
                  size="sm"
                  color="primary"
                  variant="ghost"
                >
                  Voir
                </UButton>
                <UButton
                  @click="supprimerEcrit(ecrit._id!)"
                  icon="i-lucide-trash-2"
                  size="sm"
                  color="error"
                  variant="ghost"
                >
                  Supprimer
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </UCard>

      <!-- Informations de connexion -->
      <UAlert
        icon="i-lucide-info"
        color="primary"
        variant="subtle"
        title="Configuration MongoDB"
        description="Base de données 'envoutement' • Collection 'ecrits' • Assurez-vous que MongoDB est démarré"
      />
    </div>

    <!-- Modal de visualisation -->
    <UModal v-model="isViewModalOpen" v-if="selectedEcrit">
      <UCard class="sm:max-w-3xl">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">{{ selectedEcrit.titre }}</h3>
            <UButton
              @click="isViewModalOpen = false"
              icon="i-lucide-x"
              size="sm"
              color="neutral"
              variant="ghost"
            />
          </div>
        </template>

        <div class="space-y-4">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Créé le {{ formatDate(selectedEcrit.createdAt!) }}
          </div>

          <div class="border-t border-gray-200 dark:border-gray-800"></div>

          <div class="space-y-3 max-h-96 overflow-y-auto">
            <div
              v-for="(ligne, index) in selectedEcrit.lignes"
              :key="index"
              class="py-2"
            >
              <div class="flex items-start gap-2">
                <UBadge color="neutral" size="xs" class="mt-1">{{ index + 1 }}</UBadge>
                <p :style="getLineStyle(ligne)" class="flex-1">
                  {{ ligne.ligne }}
                </p>
                <UBadge
                  v-if="ligne.style !== 'normal'"
                  color="primary"
                  variant="soft"
                  size="xs"
                  class="mt-1"
                >
                  {{ ligne.style }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </UModal>
  </UContainer>
</template>

