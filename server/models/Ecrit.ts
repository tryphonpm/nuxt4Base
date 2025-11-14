import { defineMongooseModel } from '#nuxt/mongoose'

// Définir le schéma Ecrit pour la collection 'ecrits'
export const Ecrit = defineMongooseModel({
  name: 'Ecrit',
  schema: {
    titre: {
      type: String,
      required: true,
    },
    lignes: [{
      index: {
        type: Number,
        required: true,
      },
      ligne: {
        type: String,
        required: true,
      },
      style: {
        type: String,
        required: true,
        enum: ['normal', 'italique', 'gras', 'citation', 'code'],
        default: 'normal',
      },
      nbrTab: {
        type: Number,
        required: true,
        default: 0,
      },
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  options: {
    collection: 'ecrits',
  },
})

// Types TypeScript
export interface ILigne {
  index: number
  ligne: string
  style: 'normal' | 'italique' | 'gras' | 'citation' | 'code'
  nbrTab: number
}

export interface IEcrit {
  _id?: string
  titre: string
  lignes: ILigne[]
  createdAt?: Date
  updatedAt?: Date
}

