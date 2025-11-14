import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'état de la connexion
    const isConnected = mongoose.connection.readyState === 1
    
    if (!isConnected) {
      return {
        success: false,
        connected: false,
        message: 'Non connecté à MongoDB',
        details: {
          readyState: mongoose.connection.readyState,
          readyStateDescription: getReadyStateDescription(mongoose.connection.readyState)
        }
      }
    }

    // Récupérer les informations de la connexion
    const db = mongoose.connection.db
    const admin = db?.admin()
    
    // Obtenir les statistiques du serveur
    const serverStatus = await admin?.serverStatus()
    
    // Lister les bases de données
    const { databases } = await admin?.listDatabases() || { databases: [] }
    
    // Obtenir les collections de la base actuelle
    const collections = await db?.listCollections().toArray()
    
    // Statistiques de la base courante
    const dbStats = await db?.stats()

    return {
      success: true,
      connected: true,
      message: 'Connecté à MongoDB avec succès',
      connectionInfo: {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
        readyStateDescription: getReadyStateDescription(mongoose.connection.readyState)
      },
      serverInfo: {
        version: serverStatus?.version,
        uptime: serverStatus?.uptime,
        process: serverStatus?.process
      },
      databaseInfo: {
        currentDatabase: db?.databaseName,
        collections: collections?.map(c => ({
          name: c.name,
          type: c.type
        })) || [],
        stats: {
          collections: dbStats?.collections,
          dataSize: formatBytes(dbStats?.dataSize || 0),
          indexSize: formatBytes(dbStats?.indexSize || 0),
          storageSize: formatBytes(dbStats?.storageSize || 0)
        }
      },
      allDatabases: databases.map((db: any) => ({
        name: db.name,
        sizeOnDisk: formatBytes(db.sizeOnDisk),
        empty: db.empty
      }))
    }
  } catch (error: any) {
    return {
      success: false,
      connected: false,
      message: 'Erreur lors du test de connexion',
      error: error.message,
      details: {
        readyState: mongoose.connection.readyState,
        readyStateDescription: getReadyStateDescription(mongoose.connection.readyState)
      }
    }
  }
})

function getReadyStateDescription(state: number): string {
  const states: Record<number, string> = {
    0: 'Déconnecté',
    1: 'Connecté',
    2: 'En cours de connexion',
    3: 'En cours de déconnexion',
    99: 'Non initialisé'
  }
  return states[state] || 'État inconnu'
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

