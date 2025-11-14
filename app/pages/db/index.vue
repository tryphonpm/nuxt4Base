<script setup lang="ts">
import type { IEcrit, ILigne } from '../../../server/models/Ecrit'

// Gestion du SEO
useHead({
  title: 'Gestion des Écrits - MongoDB',
  meta: [
    { name: 'description', content: 'Interface de gestion des écrits dans MongoDB' }
  ]
})

// Toast pour les notifications
const toast = useToast()

// Options de style disponibles
const styleOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Italique', value: 'italique' },
  { label: 'Gras', value: 'gras' },
  { label: 'Citation', value: 'citation' },
  { label: 'Code', value: 'code' }
]

// État du formulaire
const formState = reactive({
  titre: '',
  lignes: [
    { index: 0, ligne: '', style: 'normal' as const, nbrTab: 0 }
  ]
})

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

// Indicateur de chargement pour l'ajout
const isSubmitting = ref(false)

// État pour l'écrit sélectionné (visualisation)
const selectedEcrit = ref<IEcrit | null>(null)
const isViewModalOpen = ref(false)

// Fonction pour ajouter une ligne
function ajouterLigne() {
  const nouvelIndex = formState.lignes.length
  formState.lignes.push({
    index: nouvelIndex,
    ligne: '',
    style: 'normal',
    nbrTab: 0
  })
}

// Fonction pour supprimer une ligne
function supprimerLigne(index: number) {
  if (formState.lignes.length > 1) {
    formState.lignes.splice(index, 1)
    // Réindexer les lignes
    formState.lignes.forEach((ligne, idx) => {
      ligne.index = idx
    })
  } else {
    toast.add({
      title: 'Erreur',
      description: 'Au moins une ligne est requise',
      color: 'error'
    })
  }
}

// Fonction pour déplacer une ligne vers le haut
function deplacerLigneHaut(index: number) {
  if (index > 0 && formState.lignes[index] && formState.lignes[index - 1]) {
    const temp = formState.lignes[index]!
    const prev = formState.lignes[index - 1]!
    formState.lignes[index] = {
      index: prev.index,
      ligne: prev.ligne,
      style: prev.style,
      nbrTab: prev.nbrTab
    }
    formState.lignes[index - 1] = {
      index: temp.index,
      ligne: temp.ligne,
      style: temp.style,
      nbrTab: temp.nbrTab
    }
    // Réindexer
    formState.lignes.forEach((ligne, idx) => {
      ligne.index = idx
    })
  }
}

// Fonction pour déplacer une ligne vers le bas
function deplacerLigneBas(index: number) {
  if (index < formState.lignes.length - 1 && formState.lignes[index] && formState.lignes[index + 1]) {
    const temp = formState.lignes[index]!
    const next = formState.lignes[index + 1]!
    formState.lignes[index] = {
      index: next.index,
      ligne: next.ligne,
      style: next.style,
      nbrTab: next.nbrTab
    }
    formState.lignes[index + 1] = {
      index: temp.index,
      ligne: temp.ligne,
      style: temp.style,
      nbrTab: temp.nbrTab
    }
    // Réindexer
    formState.lignes.forEach((ligne, idx) => {
      ligne.index = idx
    })
  }
}

// Fonction pour ajouter un écrit
async function ajouterEcrit() {
  if (!formState.titre) {
    toast.add({
      title: 'Erreur',
      description: 'Le titre est requis',
      color: 'error'
    })
    return
  }

  const lignesVides = formState.lignes.filter(l => !l.ligne.trim())
  if (lignesVides.length > 0) {
    toast.add({
      title: 'Erreur',
      description: 'Toutes les lignes doivent contenir du texte',
      color: 'error'
    })
    return
  }

  try {
    isSubmitting.value = true
    const { error } = await useFetch('/api/ecrits', {
      method: 'POST',
      body: {
        titre: formState.titre,
        lignes: formState.lignes
      }
    })

    if (error.value) {
      throw new Error(error.value.data?.message || 'Erreur lors de l\'ajout')
    }

    toast.add({
      title: 'Succès',
      description: 'Écrit ajouté avec succès',
      color: 'success'
    })

    // Réinitialiser le formulaire
    formState.titre = ''
    formState.lignes = [{ index: 0, ligne: '', style: 'normal', nbrTab: 0 }]

    // Rafraîchir la liste
    await refreshEcrits()
  } catch (err: any) {
    toast.add({
      title: 'Erreur',
      description: err.message || 'Erreur lors de l\'ajout de l\'écrit',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

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
          <h1 class="text-3xl font-bold">Gestion des Écrits</h1>
          <p class="mt-2 text-gray-500 dark:text-gray-400">
            Base de données : <span class="font-semibold text-primary">envoutement</span> • Collection : <span class="font-semibold text-primary">ecrits</span>
          </p>
        </div>
        <UBadge v-if="ecrits.length > 0" size="lg" color="primary">
          {{ ecrits.length }} écrit{{ ecrits.length > 1 ? 's' : '' }}
        </UBadge>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800"></div>

      <!-- Formulaire d'ajout -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-plus" class="w-5 h-5 text-primary" />
            <h2 class="text-xl font-semibold">Ajouter un écrit</h2>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Titre -->
          <UFormField label="Titre de l'écrit" required>
            <UInput
              v-model="formState.titre"
              placeholder="Entrez le titre"
              size="lg"
              :disabled="isSubmitting"
            />
          </UFormField>

          <div class="relative">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="bg-white dark:bg-gray-950 px-2 text-sm text-gray-500 dark:text-gray-400">Lignes</span>
            </div>
          </div>

          <!-- Lignes dynamiques -->
          <div class="space-y-4">
            <div
              v-for="(ligne, index) in formState.lignes"
              :key="index"
              class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UBadge color="neutral" variant="soft">
                    Ligne {{ index + 1 }}
                  </UBadge>
                  
                  <!-- Boutons de déplacement -->
                  <div class="flex gap-1">
                    <UButton
                      @click="deplacerLigneHaut(index)"
                      :disabled="index === 0 || isSubmitting"
                      icon="i-lucide-chevron-up"
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      aria-label="Déplacer vers le haut"
                    />
                    <UButton
                      @click="deplacerLigneBas(index)"
                      :disabled="index === formState.lignes.length - 1 || isSubmitting"
                      icon="i-lucide-chevron-down"
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      aria-label="Déplacer vers le bas"
                    />
                  </div>
                </div>

                <UButton
                  @click="supprimerLigne(index)"
                  :disabled="formState.lignes.length === 1 || isSubmitting"
                  icon="i-lucide-trash-2"
                  size="xs"
                  color="error"
                  variant="ghost"
                >
                  Supprimer
                </UButton>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <!-- Texte de la ligne -->
                <div class="md:col-span-3">
                  <UFormField label="Texte" required>
                    <UTextarea
                      v-model="ligne.ligne"
                      placeholder="Entrez le texte de la ligne"
                      :disabled="isSubmitting"
                      :rows="2"
                    />
                  </UFormField>
                </div>

                <!-- Style -->
                <div class="md:col-span-2">
                  <UFormField label="Style">
                    <USelect
                      v-model="ligne.style"
                      :options="styleOptions"
                      :disabled="isSubmitting"
                    />
                  </UFormField>
                </div>

                <!-- Nombre de tabulations -->
                <div>
                  <UFormField label="Tabulations">
                    <UInput
                      v-model.number="ligne.nbrTab"
                      type="number"
                      :min="0"
                      :max="10"
                      :disabled="isSubmitting"
                    />
                  </UFormField>
                </div>
              </div>

              <!-- Prévisualisation -->
              <div class="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Prévisualisation :</p>
                <p :style="getLineStyle(ligne)" class="text-sm">
                  {{ ligne.ligne || 'Aucun texte...' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="flex justify-between">
            <UButton
              @click="ajouterLigne"
              icon="i-lucide-plus"
              color="neutral"
              variant="outline"
              :disabled="isSubmitting"
            >
              Ajouter une ligne
            </UButton>

            <UButton
              @click="ajouterEcrit"
              :loading="isSubmitting"
              size="lg"
              icon="i-lucide-save"
            >
              Enregistrer l'écrit
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Liste des écrits -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-library" class="w-5 h-5 text-primary" />
              <h2 class="text-xl font-semibold">Liste des écrits</h2>
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
          <p class="text-gray-500 dark:text-gray-400">
            Aucun écrit dans la base de données
          </p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Ajoutez votre premier écrit ci-dessus
          </p>
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
