import { Ecrit } from '../../models/Ecrit'

// PUT /api/ecrits/:id - Mettre à jour un écrit
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    console.log('🔧 PUT Request - ID:', id)
    console.log('📦 Body reçu:', body)

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

    // Trier les lignes par index
    const lignesSorted = body.lignes.sort((a: any, b: any) => a.index - b.index)

    // Mettre à jour l'écrit
    const updateData: any = {
      titre: body.titre,
      index: body.index || body.lignes.length,
      lignes: lignesSorted,
      updatedAt: new Date(),
    }

    // Ajouter lettrine et visuel si présents
    if (body.lettrine !== undefined) {
      updateData.lettrine = body.lettrine
    }
    if (body.visuel !== undefined) {
      updateData.visuel = body.visuel
    }

    const ecrit = await Ecrit.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Retourner le document mis à jour
    )

    if (!ecrit) {
      throw createError({
        statusCode: 404,
        message: 'Écrit non trouvé',
      })
    }

    console.log('✅ Écrit mis à jour avec succès:', ecrit._id)

    return {
      success: true,
      data: ecrit,
      message: 'Écrit mis à jour avec succès',
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de la mise à jour de l\'écrit:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erreur lors de la mise à jour de l\'écrit',
      data: error.data,
    })
  }
})

