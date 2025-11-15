<script setup lang="ts">
import type { IEcrit, ILigne } from '../../../server/models/Ecrit'

const route = useRoute()
const router = useRouter()
const toast = useToast()

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
const { data: ecritData, pending, error: loadError, refresh } = await useFetch<{ success: boolean, data: IEcrit }>(`/api/ecrits/${ecritId}`)

// Obtenir l'écrit
const ecrit = computed(() => ecritData.value?.data || null)

// État pour suivre les mises à jour en cours
const isUpdating = ref(false)

// États pour les zones de drag & drop
const isDraggingLettrine = ref(false)
const isDraggingVisuel = ref(false)
const isUploadingImage = ref(false)

// Références pour les inputs fichiers
const lettrineinput = ref<HTMLInputElement | null>(null)
const visuelinput = ref<HTMLInputElement | null>(null)

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

// Modifier le nombre de tabulations d'une ligne
async function modifierTabulation(ligneIndex: number, delta: number) {
  if (!ecrit.value) return
  
  const ligneOriginale = ecrit.value.lignes[ligneIndex]
  if (!ligneOriginale) return
  
  const nouvelleTabulation = (ligneOriginale.nbrTab || 0) + delta
  
  // Vérifier que la tabulation reste dans les limites acceptables
  if (nouvelleTabulation < 0 || nouvelleTabulation > 10) {
    toast.add({
      title: 'Attention',
      description: 'Le nombre de tabulations doit être entre 0 et 10',
      color: 'warning'
    })
    return
  }
  
  // Créer une copie des lignes avec la modification
  const nouvellesLignes = ecrit.value.lignes.map((ligne, idx) => 
    idx === ligneIndex 
      ? { ...ligne, nbrTab: nouvelleTabulation }
      : ligne
  )
  
  try {
    isUpdating.value = true
    
    await $fetch(`/api/ecrits/${ecritId}`, {
      method: 'PUT',
      body: {
        titre: ecrit.value.titre,
        index: ecrit.value.index,
        lignes: nouvellesLignes
      }
    })
    
    // Rafraîchir les données
    await refresh()
    
    toast.add({
      title: 'Succès',
      description: 'Tabulation modifiée avec succès',
      color: 'success'
    })
  } catch (err: any) {
    toast.add({
      title: 'Erreur',
      description: err.message || 'Erreur lors de la mise à jour',
      color: 'error'
    })
  } finally {
    isUpdating.value = false
  }
}

// Convertir un fichier en base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Valider la taille du fichier (5Mo max)
function validateFileSize(file: File): boolean {
  const maxSize = 5 * 1024 * 1024 // 5Mo en bytes
  return file.size <= maxSize
}

// Upload d'image (lettrine ou visuel)
async function uploadImage(file: File, type: 'lettrine' | 'visuel') {
  if (!ecrit.value) return
  
  // Vérifier le type de fichier
  if (!file.type.startsWith('image/')) {
    toast.add({
      title: 'Erreur',
      description: 'Le fichier doit être une image',
      color: 'error'
    })
    return
  }
  
  // Vérifier la taille
  if (!validateFileSize(file)) {
    toast.add({
      title: 'Erreur',
      description: 'L\'image ne doit pas dépasser 5Mo',
      color: 'error'
    })
    return
  }
  
  try {
    isUploadingImage.value = true
    
    // Convertir en base64
    const base64 = await fileToBase64(file)
    
    // Mettre à jour l'écrit
    const updateData: any = {
      titre: ecrit.value.titre,
      index: ecrit.value.index,
      lignes: ecrit.value.lignes
    }
    
    if (type === 'lettrine') {
      updateData.lettrine = base64
    } else {
      updateData.visuel = base64
    }
    
    await $fetch(`/api/ecrits/${ecritId}`, {
      method: 'PUT',
      body: updateData
    })
    
    // Rafraîchir les données
    await refresh()
    
    toast.add({
      title: 'Succès',
      description: `${type === 'lettrine' ? 'Lettrine' : 'Visuel'} ajouté avec succès`,
      color: 'success'
    })
  } catch (err: any) {
    toast.add({
      title: 'Erreur',
      description: err.message || 'Erreur lors de l\'upload',
      color: 'error'
    })
  } finally {
    isUploadingImage.value = false
  }
}

// Supprimer une image
async function removeImage(type: 'lettrine' | 'visuel') {
  if (!ecrit.value) return
  
  try {
    isUploadingImage.value = true
    
    const updateData: any = {
      titre: ecrit.value.titre,
      index: ecrit.value.index,
      lignes: ecrit.value.lignes
    }
    
    if (type === 'lettrine') {
      updateData.lettrine = null
    } else {
      updateData.visuel = null
    }
    
    await $fetch(`/api/ecrits/${ecritId}`, {
      method: 'PUT',
      body: updateData
    })
    
    // Rafraîchir les données
    await refresh()
    
    toast.add({
      title: 'Succès',
      description: `${type === 'lettrine' ? 'Lettrine' : 'Visuel'} supprimé avec succès`,
      color: 'success'
    })
  } catch (err: any) {
    toast.add({
      title: 'Erreur',
      description: err.message || 'Erreur lors de la suppression',
      color: 'error'
    })
  } finally {
    isUploadingImage.value = false
  }
}

// Gérer le drop d'un fichier
function handleDrop(event: DragEvent, type: 'lettrine' | 'visuel') {
  event.preventDefault()
  
  if (type === 'lettrine') {
    isDraggingLettrine.value = false
  } else {
    isDraggingVisuel.value = false
  }
  
  const file = event.dataTransfer?.files[0]
  if (file) {
    uploadImage(file, type)
  }
}

// Gérer le drag over
function handleDragOver(event: DragEvent, type: 'lettrine' | 'visuel') {
  event.preventDefault()
  
  if (type === 'lettrine') {
    isDraggingLettrine.value = true
  } else {
    isDraggingVisuel.value = true
  }
}

// Gérer le drag leave
function handleDragLeave(type: 'lettrine' | 'visuel') {
  if (type === 'lettrine') {
    isDraggingLettrine.value = false
  } else {
    isDraggingVisuel.value = false
  }
}

// Gérer le clic pour sélectionner un fichier
function handleFileSelect(event: Event, type: 'lettrine' | 'visuel') {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    uploadImage(file, type)
  }
  // Réinitialiser l'input pour permettre de sélectionner le même fichier
  input.value = ''
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

      <!-- Images (Lettrine et Visuel) -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-image" class="w-5 h-5 text-primary" />
            <h2 class="text-xl font-semibold">Images</h2>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Lettrine -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">Lettrine</label>
              <UButton
                v-if="ecrit.lettrine"
                @click="removeImage('lettrine')"
                :disabled="isUploadingImage"
                icon="i-lucide-trash-2"
                size="xs"
                color="error"
                variant="ghost"
              >
                Supprimer
              </UButton>
            </div>
            
            <!-- Zone de drop si pas d'image -->
            <div
              v-if="!ecrit.lettrine"
              @drop="(e) => handleDrop(e, 'lettrine')"
              @dragover="(e) => handleDragOver(e, 'lettrine')"
              @dragleave="() => handleDragLeave('lettrine')"
              @click="() => lettrineinput?.click()"
              :class="[
                'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
                isDraggingLettrine 
                  ? 'border-primary bg-primary/10 scale-105' 
                  : 'border-gray-300 dark:border-gray-700 hover:border-primary/50'
              ]"
            >
              <input
                ref="lettrineinput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="(e) => handleFileSelect(e, 'lettrine')"
              />
              <div class="space-y-2">
                <UIcon 
                  name="i-lucide-upload" 
                  class="w-12 h-12 mx-auto"
                  :class="isDraggingLettrine ? 'text-primary' : 'text-gray-400'"
                />
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ isDraggingLettrine ? 'Déposez l\'image ici' : 'Glissez une image ou cliquez' }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF jusqu'à 5Mo
                </p>
              </div>
              <div v-if="isUploadingImage" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center rounded-lg">
                <USkeleton class="h-8 w-8 rounded-full" />
              </div>
            </div>

            <!-- Affichage de l'image si présente -->
            <div v-else class="relative group">
              <img 
                :src="ecrit.lettrine" 
                alt="Lettrine"
                class="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <UButton
                  @click="removeImage('lettrine')"
                  :disabled="isUploadingImage"
                  icon="i-lucide-trash-2"
                  size="lg"
                  color="error"
                >
                  Supprimer
                </UButton>
              </div>
            </div>
          </div>

          <!-- Visuel -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">Visuel</label>
              <UButton
                v-if="ecrit.visuel"
                @click="removeImage('visuel')"
                :disabled="isUploadingImage"
                icon="i-lucide-trash-2"
                size="xs"
                color="error"
                variant="ghost"
              >
                Supprimer
              </UButton>
            </div>
            
            <!-- Zone de drop si pas d'image -->
            <div
              v-if="!ecrit.visuel"
              @drop="(e) => handleDrop(e, 'visuel')"
              @dragover="(e) => handleDragOver(e, 'visuel')"
              @dragleave="() => handleDragLeave('visuel')"
              @click="() => visuelinput?.click()"
              :class="[
                'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
                isDraggingVisuel 
                  ? 'border-primary bg-primary/10 scale-105' 
                  : 'border-gray-300 dark:border-gray-700 hover:border-primary/50'
              ]"
            >
              <input
                ref="visuelinput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="(e) => handleFileSelect(e, 'visuel')"
              />
              <div class="space-y-2">
                <UIcon 
                  name="i-lucide-upload" 
                  class="w-12 h-12 mx-auto"
                  :class="isDraggingVisuel ? 'text-primary' : 'text-gray-400'"
                />
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ isDraggingVisuel ? 'Déposez l\'image ici' : 'Glissez une image ou cliquez' }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF jusqu'à 5Mo
                </p>
              </div>
              <div v-if="isUploadingImage" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center rounded-lg">
                <USkeleton class="h-8 w-8 rounded-full" />
              </div>
            </div>

            <!-- Affichage de l'image si présente -->
            <div v-else class="relative group">
              <img 
                :src="ecrit.visuel" 
                alt="Visuel"
                class="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <UButton
                  @click="removeImage('visuel')"
                  :disabled="isUploadingImage"
                  icon="i-lucide-trash-2"
                  size="lg"
                  color="error"
                >
                  Supprimer
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </UCard>

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
            class="py-1 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors rounded-lg px-3 -mx-3"
          >
            <div class="flex items-start gap-3">
              <UBadge color="neutral" variant="soft" size="sm" class="mt-1 min-w-[3rem] justify-center flex-shrink-0">
                {{ index + 1 }}
              </UBadge>
              <div class="flex-1 min-w-0">
                <p :style="getLineStyle(ligne)" class="text-base leading-relaxed">
                  {{ ligne.ligne }}
                </p>
                <div v-if="ligne.style !== 'normal'" class="mt-2">
                  <UBadge
                    color="primary"
                    variant="soft"
                    size="xs"
                  >
                    {{ ligne.style }}
                  </UBadge>
                </div>
              </div>
              
              <!-- Contrôles de tabulation alignés à droite -->
              <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-md px-2 py-1 flex-shrink-0 mt-1">
                <UButton
                  @click="modifierTabulation(index, -1)"
                  :disabled="ligne.nbrTab === 0 || isUpdating"
                  icon="i-lucide-minus"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  class="h-2 w-6"
                />
                <span class="text-xs font-medium min-w-[3rem] text-center">
                  <UIcon name="i-lucide-indent" class="w-3 h-3 inline" />
                  {{ ligne.nbrTab }}
                </span>
                <UButton
                  @click="modifierTabulation(index, 1)"
                  :disabled="ligne.nbrTab >= 10 || isUpdating"
                  icon="i-lucide-plus"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  class="h-6 w-6"
                />
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
