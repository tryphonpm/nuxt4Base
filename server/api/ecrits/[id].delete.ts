import { Ecrit } from '../../models/Ecrit'

// DELETE /api/ecrits/:id - Supprimer un écrit
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID écrit requis',
      })
    }

    const ecrit = await Ecrit.findByIdAndDelete(id)

    if (!ecrit) {
      throw createError({
        statusCode: 404,
        message: 'Écrit non trouvé',
      })
    }

    return {
      success: true,
      message: 'Écrit supprimé avec succès',
    }
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'écrit:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erreur lors de la suppression de l\'écrit',
    })
  }
})

