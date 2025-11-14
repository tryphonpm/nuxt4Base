import { Ecrit } from '../../models/Ecrit'

// POST /api/ecrits - Créer un nouvel écrit
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Validation basique
    if (!body.titre) {
      throw createError({
        statusCode: 400,
        message: 'Le titre est requis',
      })
    }

    if (!body.lignes || !Array.isArray(body.lignes) || body.lignes.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Au moins une ligne est requise',
      })
    }

    // Trier les lignes par index avant de créer
    const lignesSorted = body.lignes.sort((a: any, b: any) => a.index - b.index)

    // Créer l'écrit
    const ecrit = await Ecrit.create({
      titre: body.titre,
      index: body.index || body.lignes.length,
      lignes: lignesSorted,
      updatedAt: new Date(),
    })

    return {
      success: true,
      data: ecrit,
      message: 'Écrit créé avec succès',
    }
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'écrit:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erreur lors de la création de l\'écrit',
      data: error.data,
    })
  }
})

