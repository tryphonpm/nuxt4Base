import { Ecrit } from '../../models/Ecrit'

// GET /api/ecrits - Récupérer tous les écrits
export default defineEventHandler(async (event) => {
  try {
    const ecrits = await Ecrit.find().sort({ createdAt: -1 })
    return {
      success: true,
      data: ecrits,
      count: ecrits.length,
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération des écrits:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des écrits',
      data: error.message,
    })
  }
})

