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
const styleOptions = ['normal', 'italique', 'gras', 'citation', 'code']

// État du formulaire
const formState = reactive({
  titre: '',
  index: 1, // Index de l'écrit (éditable manuellement)
  lignes: [
    { index: 0, ligne: '', style: 'normal' as const, nbrTab: 0 }
  ]
})

// Indicateur de chargement pour l'ajout
const isSubmitting = ref(false)

// Référence pour l'input file
const fileInputRef = ref<HTMLInputElement | null>(null)

// Fonction pour importer un fichier .txt
function importerFichier() {
  fileInputRef.value?.click()
}

// Fonction pour traiter le fichier sélectionné
async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // Vérifier que c'est un fichier .txt
  if (!file.name.endsWith('.txt')) {
    toast.add({
      title: 'Erreur',
      description: 'Seuls les fichiers .txt sont acceptés',
      color: 'error'
    })
    return
  }

  try {
    const text = await file.text()
    const lignes = text.split('\n')
      .map(line => line.trimEnd()) // Enlever les espaces de fin mais garder les tabulations de début
      .filter(line => line.length > 0) // Ignorer les lignes vides
    
    if (lignes.length === 0) {
      toast.add({
        title: 'Erreur',
        description: 'Le fichier est vide',
        color: 'error'
      })
      return
    }

    // Extraire le titre (première ligne)
    const premiereLigne = lignes[0]
    
    // Remplir le titre si vide et prendre les lignes à partir de la 2ème
    let lignesAImporter
    if (!formState.titre && premiereLigne) {
      formState.titre = premiereLigne.trim()
      lignesAImporter = lignes.slice(1).filter(l => l.trim())
    } else {
      // Si le titre est déjà rempli, importer toutes les lignes
      lignesAImporter = lignes.filter(l => l.trim())
    }
    
    formState.lignes = lignesAImporter.map((ligne, index) => {
      // Compter les tabulations au début
      const match = ligne.match(/^(\t+)/)
      const nbrTab = match?.[1]?.length || 0
      // Enlever les tabulations ET espaces du début pour le texte
      const texte = ligne.replace(/^[\t\s]+/, '')
      
      return {
        index,
        ligne: texte,
        style: 'normal' as const,
        nbrTab
      }
    })

    toast.add({
      title: 'Succès',
      description: `Titre et ${formState.lignes.length} ligne${formState.lignes.length > 1 ? 's' : ''} importé${formState.lignes.length > 1 ? 's' : 'e'}`,
      color: 'success'
    })

    // Réinitialiser l'input file
    if (target) target.value = ''
  } catch (err: any) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de lire le fichier',
      color: 'error'
    })
  }
}

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

  // Vérifier qu'au moins une ligne contient du texte
  const lignesAvecTexte = formState.lignes.filter(l => l.ligne.trim())
  if (lignesAvecTexte.length === 0) {
    toast.add({
      title: 'Erreur',
      description: 'Au moins une ligne doit contenir du texte',
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
        index: formState.index,
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
    formState.index = 1
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
          <!-- Titre avec bouton Import -->
          <div class="space-y-2">
            <UFormField label="Titre de l'écrit" required>
              <div class="flex gap-3">
                <UInput
                  v-model="formState.titre"
                  placeholder="Entrez le titre"
                  size="lg"
                  :disabled="isSubmitting"
                  class="flex-1"
                />
                <UButton
                  @click="importerFichier"
                  icon="i-lucide-file-text"
                  color="neutral"
                  variant="outline"
                  size="lg"
                  :disabled="isSubmitting"
                >
                  Importer .txt
                </UButton>
              </div>
            </UFormField>
            
            <!-- Input file caché -->
            <input
              ref="fileInputRef"
              type="file"
              accept=".txt"
              @change="handleFileUpload"
              class="hidden"
            />
            
            <!-- Message d'info pour l'import -->
            <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <UIcon name="i-lucide-info" class="w-3 h-3" />
              Importez un fichier .txt pour remplir automatiquement les lignes et le titre (les tabulations seront préservées)
            </p>
          </div>

          <!-- Index de l'écrit -->
          <div v-if="formState.titre">
            <UFormField label="Index de l'écrit" help="Utilisé pour trier les écrits dans la liste (éditable manuellement)">
              <UInput
                v-model.number="formState.index"
                type="number"
                :min="0"
                :disabled="isSubmitting"
                size="lg"
                class="w-48"
              />
            </UFormField>
          </div>

          <!-- Section des lignes (affichée seulement si le titre est renseigné) -->
          <div v-if="formState.titre" class="space-y-6">
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

              <!-- Texte de la ligne (pleine largeur) -->
              <UFormField label="Texte" required class="w-full">
                <UTextarea
                  v-model="ligne.ligne"
                  placeholder="Entrez le texte de la ligne"
                  :disabled="isSubmitting"
                  :rows="2"
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
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

