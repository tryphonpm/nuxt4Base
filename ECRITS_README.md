# 📝 Système de Gestion des Écrits

## 📚 Description

Ce système permet de gérer des écrits structurés dans une base de données MongoDB. Chaque écrit est composé d'un titre et de lignes avec différents styles de formatage.

## 🗄️ Configuration MongoDB

**Base de données** : `envoutement`  
**Collection** : `ecrits`

Assurez-vous que votre fichier `.env` contient :
```env
MONGODB_URI=mongodb://localhost:27017/envoutement
```

## 📊 Structure des Documents

### Modèle Écrit

Chaque document dans la collection `ecrits` a la structure suivante :

```typescript
{
  _id: ObjectId,
  titre: String,          // Titre de l'écrit (requis)
  lignes: [               // Tableau de lignes (au moins 1 requis)
    {
      index: Number,      // Ordre d'affichage (0, 1, 2, ...)
      ligne: String,      // Contenu textuel de la ligne
      style: String,      // Style: 'normal', 'italique', 'gras', 'citation', 'code'
      nbrTab: Number      // Nombre de tabulations (indentation)
    }
  ],
  createdAt: Date,        // Date de création
  updatedAt: Date         // Date de dernière modification
}
```

### Styles Disponibles

| Style      | Description                                    | Rendu                          |
|------------|------------------------------------------------|--------------------------------|
| `normal`   | Texte standard                                 | Texte normal                   |
| `italique` | Texte en italique                              | *Texte en italique*            |
| `gras`     | Texte en gras                                  | **Texte en gras**              |
| `citation` | Citation avec bordure gauche                   | <q>Citation</q>                |
| `code`     | Code avec fond gris et police monospace        | `code`                         |

### Indentation (nbrTab)

Le champ `nbrTab` permet d'indenter les lignes :
- `0` = pas d'indentation
- `1` = 2rem d'indentation
- `2` = 4rem d'indentation
- etc.

## 🎨 Interface Utilisateur

L'interface de gestion se trouve à l'adresse : **http://localhost:3000/db**

### Fonctionnalités

#### ✅ Ajouter un Écrit

1. Remplissez le **titre** de l'écrit
2. Pour chaque ligne :
   - Saisissez le **texte**
   - Choisissez le **style** (normal, italique, gras, citation, code)
   - Définissez le nombre de **tabulations** (0-10)
3. **Ajoutez des lignes** avec le bouton "Ajouter une ligne"
4. **Réorganisez** les lignes avec les boutons ↑ et ↓
5. **Supprimez** des lignes si nécessaire
6. **Prévisualisez** chaque ligne avant de sauvegarder
7. Cliquez sur **"Enregistrer l'écrit"**

#### 📖 Visualiser un Écrit

- Cliquez sur le bouton **"Voir"** d'un écrit dans la liste
- Une modale s'ouvre avec l'aperçu complet de l'écrit
- Les styles sont appliqués automatiquement

#### 🗑️ Supprimer un Écrit

- Cliquez sur le bouton **"Supprimer"** d'un écrit
- L'écrit sera supprimé définitivement de la base de données

#### 🔄 Actualiser la Liste

- Cliquez sur **"Actualiser"** pour recharger la liste des écrits

## 🛠️ API Routes

### GET /api/ecrits
Récupère tous les écrits triés par date de création (plus récent en premier).

**Réponse** :
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

### POST /api/ecrits
Crée un nouvel écrit.

**Body** :
```json
{
  "titre": "Mon titre",
  "lignes": [
    {
      "index": 0,
      "ligne": "Première ligne",
      "style": "normal",
      "nbrTab": 0
    }
  ]
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {...},
  "message": "Écrit créé avec succès"
}
```

### GET /api/ecrits/:id
Récupère un écrit spécifique par son ID.

**Réponse** :
```json
{
  "success": true,
  "data": {...}
}
```

### DELETE /api/ecrits/:id
Supprime un écrit par son ID.

**Réponse** :
```json
{
  "success": true,
  "message": "Écrit supprimé avec succès"
}
```

## 💡 Exemples d'Utilisation

### Créer un Écrit Simple

**Titre** : "Ma première pensée"

**Lignes** :
1. `{ ligne: "Ceci est une ligne normale", style: "normal", nbrTab: 0 }`
2. `{ ligne: "Ceci est en italique", style: "italique", nbrTab: 0 }`
3. `{ ligne: "Ceci est en gras", style: "gras", nbrTab: 0 }`

### Créer un Écrit Structuré

**Titre** : "Poème"

**Lignes** :
1. `{ ligne: "Le Corbeau et le Renard", style: "gras", nbrTab: 0 }`
2. `{ ligne: "Maître Corbeau, sur un arbre perché,", style: "normal", nbrTab: 1 }`
3. `{ ligne: "Tenait en son bec un fromage.", style: "normal", nbrTab: 1 }`
4. `{ ligne: "- Jean de La Fontaine", style: "citation", nbrTab: 2 }`

### Créer un Écrit avec Code

**Titre** : "Fonction JavaScript"

**Lignes** :
1. `{ ligne: "Voici une fonction simple :", style: "normal", nbrTab: 0 }`
2. `{ ligne: "function hello() { return 'Bonjour'; }", style: "code", nbrTab: 1 }`

## 🔧 Composants Nuxt UI Utilisés

L'interface utilise **100% de composants Nuxt UI** :
- ✅ `<UContainer>` - Layout principal
- ✅ `<UCard>` - Cartes pour les sections
- ✅ `<UButton>` - Boutons d'action
- ✅ `<UInput>` - Champs de saisie
- ✅ `<UTextarea>` - Saisie multilignes
- ✅ `<USelect>` - Sélecteur de style
- ✅ `<UFormField>` - Champs de formulaire
- ✅ `<UBadge>` - Badges pour les numéros et styles
- ✅ `<UIcon>` - Icônes Lucide
- ✅ `<UDivider>` - Séparateurs
- ✅ `<UAlert>` - Alerte d'information
- ✅ `<USkeleton>` - État de chargement
- ✅ `<UModal>` - Modale de visualisation
- ✅ `useToast()` - Notifications

## 🚀 Démarrage Rapide

1. **Démarrez MongoDB** :
   ```bash
   # Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Ou MongoDB local
   mongod
   ```

2. **Vérifiez le fichier .env** :
   ```env
   MONGODB_URI=mongodb://localhost:27017/envoutement
   ```

3. **Lancez l'application** :
   ```bash
   npm run dev
   ```

4. **Accédez à l'interface** :
   http://localhost:3000/db

## 📦 Structure des Fichiers

```
app/
├── server/
│   ├── models/
│   │   └── Ecrit.ts                 # Modèle Mongoose
│   └── api/
│       └── ecrits/
│           ├── index.get.ts         # GET tous les écrits
│           ├── index.post.ts        # POST créer un écrit
│           ├── [id].get.ts          # GET un écrit
│           └── [id].delete.ts       # DELETE un écrit
└── pages/
    └── db/
        └── index.vue                # Interface de gestion
```

## 🎯 Fonctionnalités Clés

- ✅ Gestion complète CRUD (Create, Read, Delete)
- ✅ Ajout/suppression dynamique de lignes
- ✅ Réorganisation des lignes (haut/bas)
- ✅ 5 styles de formatage différents
- ✅ Indentation personnalisable
- ✅ Prévisualisation en temps réel
- ✅ Modale de visualisation
- ✅ Notifications toast
- ✅ États de chargement
- ✅ Design responsive
- ✅ Mode sombre/clair
- ✅ TypeScript complet

## 🔒 Validation

- Le **titre** est obligatoire
- Au moins **une ligne** est requise
- Toutes les lignes doivent contenir du **texte**
- Le **style** doit être l'une des 5 valeurs autorisées
- Le **nbrTab** doit être entre 0 et 10

## 🎨 Personnalisation

Le système est entièrement basé sur Nuxt UI et Tailwind CSS. Vous pouvez personnaliser les styles dans :
- `app.config.ts` - Configuration du thème Nuxt UI
- `app/assets/css/main.css` - Styles personnalisés

## 📝 Notes

- Les écrits sont triés par date de création (plus récent en premier)
- L'indentation utilise `rem` (2rem par tabulation)
- Les styles sont appliqués via des objets JavaScript inline
- La base de données et la collection sont créées automatiquement si elles n'existent pas

---

**Bon développement ! 🚀**

