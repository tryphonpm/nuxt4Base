import { Ecrit } from '../../models/Ecrit'

// GET /api/ecrits/:id - Récupérer un écrit par ID
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID écrit requis',
      })
    }

    const ecrit = await Ecrit.findById(id)

    if (!ecrit) {
      throw createError({
        statusCode: 404,
        message: 'Écrit non trouvé',
      })
    }

    return {
      success: true,
      data: ecrit,
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'écrit:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erreur lors de la récupération de l\'écrit',
    })
  }
})

