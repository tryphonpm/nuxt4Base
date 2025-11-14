# Guide MongoDB pour Nuxt 4

## 📦 Installation

Le module `nuxt-mongoose` est déjà installé dans ce projet.

```bash
npx nuxi@latest module add nuxt-mongoose
```

## ⚙️ Configuration

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet (déjà créé) :

```env
MONGODB_URI=mongodb://localhost:27017/nuxt4base
```

Pour MongoDB Atlas (cloud) :
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### 2. Configuration Nuxt

Le module est déjà configuré dans `nuxt.config.ts` :

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/ui', 'nuxt-mongoose'],
  // ...
})
```

## 🗄️ Structure du projet

```
app/
├── server/
│   ├── models/          # Modèles Mongoose
│   │   └── User.ts      # Exemple de modèle User
│   └── api/             # Routes API
│       └── users/
│           ├── index.get.ts    # GET /api/users
│           ├── index.post.ts   # POST /api/users
│           └── [id].delete.ts  # DELETE /api/users/:id
└── pages/
    └── db/
        └── index.vue    # Page de test MongoDB
```

## 📝 Créer un modèle Mongoose

Exemple de modèle dans `app/server/models/User.ts` :

```typescript
import { defineMongooseModel } from '#nuxt/mongoose'

export const User = defineMongooseModel({
  name: 'User',
  schema: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
})

// Type TypeScript
export interface IUser {
  _id?: string
  name: string
  email: string
  age?: number
  createdAt?: Date
}
```

## 🔌 Créer des routes API

### GET - Récupérer des données
`app/server/api/users/index.get.ts` :

```typescript
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    return {
      success: true,
      data: users,
      count: users.length,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des utilisateurs',
    })
  }
})
```

### POST - Créer des données
`app/server/api/users/index.post.ts` :

```typescript
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const user = await User.create({
      name: body.name,
      email: body.email,
      age: body.age,
    })

    return {
      success: true,
      data: user,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la création',
    })
  }
})
```

### DELETE - Supprimer des données
`app/server/api/users/[id].delete.ts` :

```typescript
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    await User.findByIdAndDelete(id)
    
    return {
      success: true,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la suppression',
    })
  }
})
```

## 🎨 Utiliser dans les pages (avec Nuxt UI)

Exemple dans `app/pages/db/index.vue` :

```vue
<script setup lang="ts">
import type { IUser } from '~/server/models/User'

const toast = useToast()

// Récupérer les données
const { data: usersData, refresh } = await useFetch('/api/users')
const users = computed(() => usersData.value?.data || [])

// Ajouter un utilisateur
async function addUser(formData: IUser) {
  const { error } = await useFetch('/api/users', {
    method: 'POST',
    body: formData
  })

  if (!error.value) {
    toast.add({
      title: 'Succès',
      description: 'Utilisateur ajouté',
      color: 'success'
    })
    await refresh()
  }
}

// Supprimer un utilisateur
async function deleteUser(id: string) {
  await useFetch(`/api/users/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <UContainer>
    <UCard>
      <UTable :rows="users" :columns="columns">
        <!-- Contenu du tableau -->
      </UTable>
    </UCard>
  </UContainer>
</template>
```

## 🚀 Démarrer MongoDB

### MongoDB local

**Windows** :
```bash
# Avec MongoDB installé
mongod

# Ou avec MongoDB dans Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**macOS** :
```bash
# Avec Homebrew
brew services start mongodb-community

# Ou avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Linux** :
```bash
# Service systemd
sudo systemctl start mongod

# Ou avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### MongoDB Atlas (Cloud)

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Obtenez votre URI de connexion
4. Ajoutez-la dans votre fichier `.env`

## 🧪 Tester

1. Démarrez MongoDB (local ou cloud)
2. Lancez votre application Nuxt :
   ```bash
   npm run dev
   ```
3. Accédez à la page de test : `http://localhost:3000/db`

## 📚 Opérations Mongoose courantes

```typescript
// Trouver tous les documents
await User.find()

// Trouver avec condition
await User.find({ age: { $gte: 18 } })

// Trouver un document
await User.findOne({ email: 'test@example.com' })

// Trouver par ID
await User.findById(id)

// Créer
await User.create({ name: 'John', email: 'john@example.com' })

// Mettre à jour
await User.findByIdAndUpdate(id, { name: 'Jane' }, { new: true })

// Supprimer
await User.findByIdAndDelete(id)

// Compter
await User.countDocuments()

// Pagination
await User.find().limit(10).skip(20)

// Tri
await User.find().sort({ createdAt: -1 })
```

## ⚠️ Bonnes pratiques

1. **Toujours gérer les erreurs** avec try/catch
2. **Valider les données** avant d'insérer dans la DB
3. **Utiliser les index** pour les champs souvent recherchés
4. **Ne jamais exposer** les erreurs détaillées au client
5. **Utiliser les types TypeScript** pour la sécurité
6. **Fermer les connexions** correctement (géré automatiquement par nuxt-mongoose)

## 🔐 Sécurité

- Ne jamais commiter le fichier `.env`
- Utiliser des variables d'environnement pour les credentials
- Limiter les permissions de la base de données
- Valider toutes les entrées utilisateur
- Utiliser HTTPS en production

## 📖 Ressources

- [Documentation nuxt-mongoose](https://nuxt.com/modules/nuxt-mongoose)
- [Documentation Mongoose](https://mongoosejs.com/)
- [Documentation MongoDB](https://docs.mongodb.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 🐛 Dépannage

### Erreur de connexion
```
Missing MongoDB URI
```
**Solution** : Vérifiez que `MONGODB_URI` est défini dans `.env`

### Erreur de connexion refusée
```
MongoServerError: connect ECONNREFUSED
```
**Solution** : Vérifiez que MongoDB est démarré localement

### Erreur d'authentification
```
MongoServerError: Authentication failed
```
**Solution** : Vérifiez vos credentials dans l'URI de connexion

