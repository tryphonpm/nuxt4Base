import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Obtenir le chemin du fichier actuel (équivalent de __dirname en ESM)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chemins des fichiers
const projectRoot = join(__dirname, '..')
const inputFile = join(projectRoot, 'public', 'imports', 'all.txt')
const outputDir = join(projectRoot, 'public', 'imports')

console.log('📖 Lecture du fichier all.txt...')

try {
  // Lire le fichier
  const content = readFileSync(inputFile, 'utf-8')
  
  // Découper le contenu en lignes
  const lines = content.split('\n')
  
  console.log(`📊 Nombre total de lignes: ${lines.length}`)
  
  // Afficher les 10 premières lignes pour debug
  console.log('📝 Premières lignes:')
  lines.slice(0, 10).forEach((line, idx) => {
    console.log(`  ${idx + 1}: "${line}" (trimmed: "${line.trim()}")`)
  })
  
  // Pattern pour détecter les séparateurs (ex: - 9 -, - 10 -, etc.)
  const separatorPattern = /^-\s*(\d+)\s*-\s*$/
  
  let currentPageNumber = null
  let currentPageContent = []
  let pagesCreated = 0
  
  console.log('\n✂️  Découpage en cours...\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const match = line.match(separatorPattern)
    
    if (match) {
      // On a trouvé un séparateur
      
      // Sauvegarder la page précédente si elle existe
      if (currentPageNumber !== null && currentPageContent.length > 0) {
        // Extraire le titre (première ligne non vide)
        let titre = ''
        let lignesTexte = []
        
        for (const ligne of currentPageContent) {
          if (!titre && ligne.trim()) {
            // Première ligne non vide = titre
            titre = ligne.trim()
          } else if (titre) {
            // Après le titre, traiter les lignes
            const ligneOriginale = ligne
            
            // Compter les tabulations au début
            const tabMatch = ligneOriginale.match(/^(\t+)/)
            const nbrTab = tabMatch?.[1]?.length || 0
            
            // Enlever les tabulations ET les espaces en début de ligne
            const texte = ligneOriginale.replace(/^[\t\s]+/, '').trimEnd()
            
            // Ajouter seulement si la ligne n'est pas vide
            if (texte) {
              lignesTexte.push({
                nbrTab,
                texte
              })
            }
          }
        }
        
        // Créer le contenu JSON pour debug
        const pageData = {
          titre,
          lignes: lignesTexte
        }
        
        const outputFile = join(outputDir, `page_${currentPageNumber.toString().padStart(2, '0')}.txt`)
        const contentToSave = currentPageContent.join('\n')
        writeFileSync(outputFile, contentToSave, 'utf-8')
        
        console.log(`✅ Page ${currentPageNumber} créée`)
        console.log(`   📝 Titre: "${titre}"`)
        console.log(`   📊 ${lignesTexte.length} lignes de texte`)
        if (lignesTexte.length > 0) {
          const exempleLigne = lignesTexte[0]
          console.log(`   📄 Exemple: [tab:${exempleLigne.nbrTab}] "${exempleLigne.texte.substring(0, 40)}${exempleLigne.texte.length > 40 ? '...' : ''}"`)
        }
        console.log(`   💾 Fichier: page_${currentPageNumber.toString().padStart(2, '0')}.txt`)
        pagesCreated++
      }
      
      // Commencer une nouvelle page
      currentPageNumber = parseInt(match[1], 10)
      currentPageContent = []
    } else {
      // Ajouter la ligne au contenu de la page courante
      if (currentPageNumber !== null) {
        // Garder la ligne originale avec ses tabulations (pas de trim)
        currentPageContent.push(lines[i])
      }
    }
  }
  
  // Sauvegarder la dernière page
  if (currentPageNumber !== null && currentPageContent.length > 0) {
    // Extraire le titre (première ligne non vide)
    let titre = ''
    let lignesTexte = []
    
    for (const ligne of currentPageContent) {
      if (!titre && ligne.trim()) {
        // Première ligne non vide = titre
        titre = ligne.trim()
      } else if (titre) {
        // Après le titre, traiter les lignes
        const ligneOriginale = ligne
        
        // Compter les tabulations au début
        const tabMatch = ligneOriginale.match(/^(\t+)/)
        const nbrTab = tabMatch?.[1]?.length || 0
        
        // Enlever les tabulations ET les espaces en début de ligne
        const texte = ligneOriginale.replace(/^[\t\s]+/, '').trimEnd()
        
        // Ajouter seulement si la ligne n'est pas vide
        if (texte) {
          lignesTexte.push({
            nbrTab,
            texte
          })
        }
      }
    }
    
    const outputFile = join(outputDir, `page_${currentPageNumber.toString().padStart(2, '0')}.txt`)
    const contentToSave = currentPageContent.join('\n')
    writeFileSync(outputFile, contentToSave, 'utf-8')
    
    console.log(`✅ Page ${currentPageNumber} créée`)
    console.log(`   📝 Titre: "${titre}"`)
    console.log(`   📊 ${lignesTexte.length} lignes de texte`)
    if (lignesTexte.length > 0) {
      const exempleLigne = lignesTexte[0]
      console.log(`   📄 Exemple: [tab:${exempleLigne.nbrTab}] "${exempleLigne.texte.substring(0, 40)}${exempleLigne.texte.length > 40 ? '...' : ''}"`)
    }
    console.log(`   💾 Fichier: page_${currentPageNumber.toString().padStart(2, '0')}.txt`)
    pagesCreated++
  }
  
  console.log(`\n🎉 Terminé ! ${pagesCreated} pages créées dans public/imports/`)
  
} catch (error) {
  console.error('❌ Erreur:', error.message)
  process.exit(1)
}

