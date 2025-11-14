<script setup lang="ts">
import type { ILigne } from '../../../server/models/Ecrit'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Récupérer l'ID depuis l'URL
const ecritId = route.params.id as string

// Gestion du SEO
useHead({
  title: 'Éditer un écrit - Envoûtement',
  meta: [
    { name: 'description', content: 'Éditer un écrit dans MongoDB' }
  ]
})

// Options de style disponibles
const styleOptions = ['normal', 'italique', 'gras', 'citation', 'code']

// Charger l'écrit à éditer
const { data: ecritData, pending, error: loadError } = await useFetch(`/api/ecrits/${ecritId}`)

// État du formulaire
const formState = reactive({
  titre: '',
  lignes: [] as ILigne[]
})

// Initialiser le formulaire avec les données chargées
watch(() => ecritData.value, (newData) => {
  if (newData?.data) {
    formState.titre = newData.data.titre
    formState.lignes = newData.data.lignes.map(l => ({ ...l }))
  }
}, { immediate: true })

// Indicateur de chargement pour la mise à jour
const isSubmitting = ref(false)

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

// Fonction pour mettre à jour l'écrit - CORRECTION DU SUBMIT
async function mettreAJourEcrit() {
  console.log('🚀 Début de la mise à jour...')
  
  // Validation
  if (!formState.titre.trim()) {
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
    console.log('📤 Envoi de la requête PUT vers:', `/api/ecrits/${ecritId}`)
    console.log('📦 Données:', { titre: formState.titre, lignes: formState.lignes })
    
    // Utilisation de $fetch avec la méthode PUT correcte
    const response = await $fetch(`/api/ecrits/${ecritId}`, {
      method: 'PUT',
      body: {
        titre: formState.titre,
        lignes: formState.lignes
      }
    })

    console.log('✅ Réponse reçue:', response)

    toast.add({
      title: 'Succès',
      description: 'Écrit mis à jour avec succès',
      color: 'success'
    })

    // Retour à la liste après un court délai
    setTimeout(() => {
      router.push('/liste')
    }, 500)
    
  } catch (err: any) {
    console.error('❌ Erreur lors de la mise à jour:', err)
    toast.add({
      title: 'Erreur',
      description: err.data?.message || err.message || 'Erreur lors de la mise à jour',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
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
      <USkeleton class="h-32" />
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

    <!-- Formulaire d'édition -->
    <div v-else-if="formState.titre" class="space-y-8">
      <!-- En-tête avec breadcrumb -->
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <NuxtLink to="/" class="hover:text-primary">Accueil</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          <NuxtLink to="/liste" class="hover:text-primary">Liste des écrits</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          <span>Éditer</span>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold">Éditer l'écrit</h1>
            <p class="mt-2 text-gray-500 dark:text-gray-400">
              Modifiez les informations de votre écrit
            </p>
          </div>
          <UButton
            to="/liste"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="outline"
          >
            Retour
          </UButton>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800"></div>

      <!-- Formulaire -->
      <UCard>
        <div class="space-y-6">
          <!-- Titre -->
          <UFormField label="Titre de l'écrit" required>
            <UInput
              v-model="formState.titre"
              placeholder="Entrez le titre"
              size="lg"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>

          <div class="relative">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="bg-white dark:bg-gray-950 px-2 text-sm text-gray-500 dark:text-gray-400">Lignes de l'écrit</span>
            </div>
          </div>

          <!-- Lignes dynamiques -->
          <div class="space-y-4">
            <div
              v-for="(ligne, index) in formState.lignes"
              :key="index"
              class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 hover:border-primary/50 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UBadge color="primary" variant="soft">
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

              <!-- Texte de la ligne (pleine largeur) -->
              <UFormField label="Texte" required class="w-full">
                <UTextarea
                  v-model="ligne.ligne"
                  placeholder="Entrez le texte de la ligne"
                  :disabled="isSubmitting"
                  :rows="3"
                  class="w-full"
                />
              </UFormField>

              <!-- Style et Tabulations -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="md:col-span-2">
                  <UFormField label="Style">
                    <select
                      v-model="ligne.style"
                      :disabled="isSubmitting"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option v-for="option in styleOptions" :key="option" :value="option">
                        {{ option.charAt(0).toUpperCase() + option.slice(1) }}
                      </option>
                    </select>
                  </UFormField>
                </div>

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
              <div class="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <UIcon name="i-lucide-eye" class="w-3 h-3" />
                  Prévisualisation
                </p>
                <p :style="getLineStyle(ligne)" class="text-sm">
                  {{ ligne.ligne || 'Aucun texte...' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Bouton ajouter une ligne -->
          <UButton
            @click="ajouterLigne"
            icon="i-lucide-plus"
            color="primary"
            variant="outline"
            :disabled="isSubmitting"
            block
          >
            Ajouter une ligne
          </UButton>
        </div>
      </UCard>

      <!-- Boutons d'action en bas -->
      <UCard>
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ formState.lignes.length }} ligne{{ formState.lignes.length > 1 ? 's' : '' }} • Écrit ID: {{ ecritId }}
          </p>
          <div class="flex gap-3">
            <UButton
              to="/liste"
              color="neutral"
              variant="outline"
              :disabled="isSubmitting"
              icon="i-lucide-x"
            >
              Annuler
            </UButton>
            <UButton
              @click="mettreAJourEcrit"
              :loading="isSubmitting"
              size="lg"
              icon="i-lucide-save"
              color="primary"
            >
              {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </UButton>
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
      description="L'écrit que vous essayez de modifier n'existe pas ou n'a pas pu être chargé."
    >
      <template #actions>
        <UButton to="/liste" color="neutral" variant="outline">
          Retour à la liste
        </UButton>
      </template>
    </UAlert>
  </UContainer>
</template>

