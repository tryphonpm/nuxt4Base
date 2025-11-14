import { readdirSync, readFileSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

// Obtenir le chemin du fichier actuel
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chemins
const projectRoot = join(__dirname, '..')
const pagesDir = join(projectRoot, 'public', 'imports', 'pages')

// URI MongoDB depuis .env ou défaut
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/envoutement'

// Définir le schéma Ecrit (identique au modèle serveur)
const ligneSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  ligne: { type: String, required: true },
  style: { 
    type: String, 
    enum: ['normal', 'italique', 'gras', 'citation', 'code'],
    default: 'normal'
  },
  nbrTab: { type: Number, default: 0 }
}, { _id: false })

const ecritSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  index: { type: Number, required: true, default: 0 },
  lignes: { type: [ligneSchema], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Modèle Ecrit
const Ecrit = mongoose.models.Ecrit || mongoose.model('Ecrit', ecritSchema)

// Fonction pour traiter un fichier
function traiterFichier(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const lignes = content.split('\n')
    .map(line => line.trimEnd())
    .filter(line => line.length > 0)
  
  if (lignes.length === 0) {
    return null
  }

  // Extraire le titre (première ligne)
  const titre = lignes[0].trim()
  
  // Traiter les lignes (à partir de la 2ème)
  const lignesTexte = lignes.slice(1)
    .map((ligne, index) => {
      // Compter les tabulations au début
      const match = ligne.match(/^(\t+)/)
      const nbrTab = match?.[1]?.length || 0
      
      // Enlever les tabulations ET espaces du début pour le texte
      const texte = ligne.replace(/^[\t\s]+/, '').trimEnd()
      
      // Retourner seulement si la ligne a du contenu
      if (texte) {
        return {
          index,
          ligne: texte,
          style: 'normal',
          nbrTab
        }
      }
      return null
    })
    .filter(l => l !== null)
  
  // Réindexer correctement
  const lignesReindexees = lignesTexte.map((ligne, idx) => ({
    ...ligne,
    index: idx
  }))

  return {
    titre,
    lignes: lignesReindexees
  }
}

// Fonction principale
async function importerToutesCesPages() {
  console.log('📚 Import automatique des pages\n')
  console.log(`📁 Dossier: ${pagesDir}`)
  console.log(`🔗 MongoDB: ${MONGODB_URI}\n`)

  try {
    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connecté à MongoDB\n')

    // Lire tous les fichiers .txt
    const fichiers = readdirSync(pagesDir)
      .filter(f => f.endsWith('.txt'))
      .sort()
    
    console.log(`📄 ${fichiers.length} fichier(s) .txt trouvé(s)\n`)
    console.log('🚀 Début de l\'import...\n')

    let importes = 0
    let erreurs = 0
    let doublon = 0
    let indexIncremental = 1  // Compteur pour l'index des écrits

    for (const fichier of fichiers) {
      const filePath = join(pagesDir, fichier)
      
      try {
        // Traiter le fichier
        const data = traiterFichier(filePath)
        
        if (!data) {
          console.log(`⚠️  ${fichier} - Fichier vide, ignoré`)
          erreurs++
          continue
        }

        // Vérifier si un écrit avec ce titre existe déjà
        const existant = await Ecrit.findOne({ titre: data.titre })
        
        if (existant) {
          console.log(`⏭️  ${fichier} - "${data.titre}" existe déjà, ignoré`)
          doublon++
          continue
        }

        // Créer l'écrit dans MongoDB avec index incrémental
        const nouvelEcrit = new Ecrit({
          titre: data.titre,
          index: indexIncremental,
          lignes: data.lignes,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        
        await nouvelEcrit.save()
        
        console.log(`✅ ${fichier} - "${data.titre}" importé (index: ${indexIncremental}, ${data.lignes.length} lignes)`)
        importes++
        indexIncremental++  // Incrémenter pour le prochain écrit
        
      } catch (err) {
        console.error(`❌ ${fichier} - Erreur: ${err.message}`)
        erreurs++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 RÉSUMÉ')
    console.log('='.repeat(60))
    console.log(`✅ Importés avec succès : ${importes}`)
    console.log(`⏭️  Doublons ignorés     : ${doublon}`)
    console.log(`❌ Erreurs              : ${erreurs}`)
    console.log(`📄 Total traités        : ${fichiers.length}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n❌ Erreur fatale:', error.message)
    process.exit(1)
  } finally {
    // Fermer la connexion MongoDB
    await mongoose.connection.close()
    console.log('\n🔌 Déconnecté de MongoDB')
  }
}

// Exécution
importerToutesCesPages()
  .then(() => {
    console.log('\n🎉 Import terminé !')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error)
    process.exit(1)
  })

