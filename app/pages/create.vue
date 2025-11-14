<script setup lang="ts">
import type { ILigne } from '../../server/models/Ecrit'

// Gestion du SEO
useHead({
  title: 'Créer un écrit - Envoûtement',
  meta: [
    { name: 'description', content: 'Créer un nouvel écrit dans MongoDB' }
  ]
})

// Toast pour les notifications
const toast = useToast()
const router = useRouter()

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

// Indicateur de chargement pour l'ajout
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

    // Rediriger vers la liste
    router.push('/liste')
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
      <div>
        <h1 class="text-3xl font-bold">Créer un écrit</h1>
        <p class="mt-2 text-gray-500 dark:text-gray-400">
          Ajoutez un nouvel écrit à votre collection
        </p>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800"></div>

      <!-- Formulaire d'ajout -->
      <UCard>
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
    </div>
  </UContainer>
</template>

