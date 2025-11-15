<script setup lang="ts">
import type { IEcrit, ILigne } from '../../../server/models/Ecrit'

// Utiliser le layout print (sans sidebar, mode light)
definePageMeta({
  layout: 'print'
})

const route = useRoute()

// Récupérer l'ID depuis l'URL
const ecritId = route.params.id as string

// Gestion du SEO et fonts
useHead({
  title: 'Imprimer un écrit - Envoûtement',
  meta: [
    { name: 'description', content: 'Prévisualisation d\'impression d\'un écrit' }
  ],
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: 'anonymous'
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap'
    }
  ]
})

// Charger l'écrit à imprimer
const { data: ecritData, pending, error: loadError } = await useFetch<{ success: boolean, data: IEcrit }>(`/api/ecrits/${ecritId}`)

// Obtenir l'écrit
const ecrit = computed(() => ecritData.value?.data || null)

// Obtenir le style CSS pour une ligne (adapté pour l'impression)
function getLineStyle(ligne: ILigne) {
  const styles: any = {
    marginLeft: `${ligne.nbrTab * 2}rem`
  }
  
  switch (ligne.style) {
    case 'italique':
      return { ...styles, fontStyle: 'italic', fontFamily: 'Cormorant, serif' }
    case 'gras':
      return { ...styles, fontWeight: 'bold', fontFamily: 'Cormorant, serif' }
    case 'citation':
      return { 
        ...styles, 
        fontStyle: 'italic', 
        color: '#6b7280', 
        borderLeft: '3px solid #9ca3af', 
        paddingLeft: '1rem',
        marginLeft: `${ligne.nbrTab * 2 + 1}rem`,
        fontFamily: 'Cormorant, serif'
      }
    case 'code':
      return { 
        ...styles, 
        fontFamily: 'Courier New, monospace', 
        backgroundColor: '#f3f4f6', 
        padding: '0.25rem 0.5rem', 
        borderRadius: '0.25rem',
        display: 'inline-block'
      }
    case 'normal':
    default:
      return { ...styles, fontFamily: 'Cormorant, serif' }
  }
}

// Fonction pour déclencher l'impression
function handlePrint() {
  window.print()
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Barre d'outils (cachée à l'impression) -->
    <div class="print:hidden sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <NuxtLink 
              to="/liste"
              class="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            >
              <UIcon name="i-lucide-arrow-left" class="w-5 h-5" />
              <span>Retour à la liste</span>
            </NuxtLink>
            <div class="h-6 w-px bg-gray-300"></div>
            <h2 class="text-lg font-semibold text-gray-900">Prévisualisation d'impression</h2>
          </div>
          <div class="flex items-center gap-3">
            <UColorModeButton />
            <UButton
              :to="`/view/${ecritId}`"
              icon="i-lucide-eye"
              color="neutral"
              variant="outline"
            >
              Voir en détail
            </UButton>
            <UButton
              @click="handlePrint"
              icon="i-lucide-printer"
              color="primary"
              size="lg"
            >
              Imprimer
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Loader pendant le chargement -->
    <div v-if="pending" class="flex items-center justify-center min-h-[50vh] print:hidden">
      <div class="space-y-4 w-full max-w-4xl mx-auto p-8">
        <USkeleton class="h-12" />
        <USkeleton class="h-64" />
      </div>
    </div>

    <!-- Erreur de chargement -->
    <div v-else-if="loadError" class="flex items-center justify-center min-h-[50vh] print:hidden">
      <UAlert
        icon="i-lucide-alert-circle"
        color="error"
        title="Erreur de chargement"
        description="Impossible de charger l'écrit. Vérifiez que l'ID est correct."
      >
        <template #actions>
          <UButton to="/liste" color="neutral" variant="outline">
            Retour à la liste
          </UButton>
        </template>
      </UAlert>
    </div>

    <!-- Contenu à imprimer -->
    <div v-else-if="ecrit" class="max-w-4xl mx-auto print:max-w-none">
      <!-- Page d'impression -->
      <div class="p-8 print:p-12">
        <!-- Visuel en haut si présent -->
        <div v-if="ecrit.visuel" class="mb-8 print:mb-12">
          <img 
            :src="ecrit.visuel" 
            alt="Visuel"
            class="w-48 h-auto object-cover rounded border border-gray-200"
          />
        </div>

        <!-- Titre -->
        <div class="mb-6 print:mb-8">
          <h1 class="text-4xl print:text-5xl font-bold text-gray-900 leading-tight" style="font-family: 'Cormorant', serif;">
            {{ ecrit.titre }}
          </h1>
        </div>

        <!-- Lignes de l'écrit avec lettrine -->
        <div class="flex items-start gap-4">
          <!-- Lettrine à gauche de la première ligne -->
          <div v-if="ecrit.lettrine" class="flex-shrink-0">
            <img 
              :src="ecrit.lettrine" 
              alt="Lettrine"
              class="w-16 h-16 print:w-20 print:h-20 object-cover rounded border border-gray-200"
            />
          </div>
          
          <!-- Contenu des lignes -->
          <div class="flex-1 space-y-0.5 print:space-y-0.5">
            <div
              v-for="(ligne, index) in ecrit.lignes"
              :key="index"
              :style="getLineStyle(ligne)"
              class="text-base print:text-base leading-tight print:leading-tight text-gray-800 min-h-[1.25rem]"
            >
              <template v-if="ligne.ligne && ligne.ligne.trim()">
                {{ ligne.ligne }}
              </template>
              <template v-else>
                &nbsp;
              </template>
            </div>
          </div>
        </div>

        <!-- Footer (visible seulement à l'impression) -->
        <div class="hidden print:block mt-16 pt-8 border-t border-gray-300">
          <div class="flex justify-between text-xs text-gray-600">
            <div>{{ ecrit.titre }}</div>
            <div>Page 1</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cas où l'écrit n'a pas été trouvé -->
    <div v-else class="flex items-center justify-center min-h-[50vh] print:hidden">
      <UAlert
        icon="i-lucide-alert-circle"
        color="error"
        title="Écrit introuvable"
        description="L'écrit que vous essayez d'imprimer n'existe pas ou n'a pas pu être chargé."
      >
        <template #actions>
          <UButton to="/liste" color="neutral" variant="outline">
            Retour à la liste
          </UButton>
        </template>
      </UAlert>
    </div>
  </div>
</template>

<style>
/* Styles spécifiques pour l'impression */
@media print {
  body {
    background: white;
  }
  
  /* Masquer les éléments non nécessaires à l'impression */
  .print\:hidden {
    display: none !important;
  }
  
  /* Optimiser les marges de page */
  @page {
    margin: 2cm;
    size: A4;
  }
  
  /* Éviter les sauts de page au milieu d'une ligne */
  div[class*="space-y"] > div {
    page-break-inside: avoid;
  }
  
  /* Forcer les images en niveaux de gris pour économiser l'encre */
  img {
    filter: grayscale(100%);
    -webkit-filter: grayscale(100%);
  }
}
</style>
