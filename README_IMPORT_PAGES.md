# Script d'import automatique de pages

## 📋 Description

Le script `scripts/import_pages.js` importe automatiquement tous les fichiers `.txt` du dossier `public/imports/pages/` dans la base de données MongoDB.

## 🚀 Utilisation

### Prérequis

1. **MongoDB démarré** : Assurez-vous que MongoDB est en cours d'exécution
2. **Fichiers préparés** : Les fichiers `.txt` doivent être dans `public/imports/pages/`
3. **Format correct** : Chaque fichier doit avoir :
   - Première ligne = **Titre**
   - Lignes suivantes = **Contenu** (avec tabulations optionnelles)

### Commande

```bash
npm run import:pages
```

## 🔧 Fonctionnement

### 1. **Lecture des fichiers**
- Scanne le dossier `public/imports/pages/`
- Filtre uniquement les fichiers `.txt`
- Trie par ordre alphabétique

### 2. **Traitement de chaque fichier**

Pour chaque fichier (ex: `page_09.txt`) :

```
L'excuse de la girafe              ← Titre (ligne 1)
Une guerrière lourde...            ← Ligne 1 (nbrTab: 0)
	qui réitère un défilé...       ← Ligne 2 (nbrTab: 1)
		le même débarquement...    ← Ligne 3 (nbrTab: 2)
```

Devient :

```javascript
{
  titre: "L'excuse de la girafe",
  index: 9,  // Index incrémental (1, 2, 3, 4, ...)
  lignes: [
    { index: 0, ligne: "Une guerrière lourde...", style: "normal", nbrTab: 0 },
    { index: 1, ligne: "qui réitère un défilé...", style: "normal", nbrTab: 1 },
    { index: 2, ligne: "le même débarquement...", style: "normal", nbrTab: 2 }
  ]
}
```

### 3. **Gestion des doublons**
- Vérifie si un écrit avec le **même titre** existe déjà
- Si oui → ⏭️ Ignore le fichier
- Si non → ✅ Crée l'écrit dans MongoDB

### 4. **Sauvegarde MongoDB**
- Collection : `ecrits`
- Base de données : `envoutement` (ou selon `.env`)
- Ajoute automatiquement `createdAt` et `updatedAt`

## 📊 Exemple de sortie

```bash
📚 Import automatique des pages

📁 Dossier: C:\...\public\imports\pages
🔗 MongoDB: mongodb://localhost:27017/envoutement

🔌 Connexion à MongoDB...
✅ Connecté à MongoDB

📄 78 fichier(s) .txt trouvé(s)

🚀 Début de l'import...

✅ page_09.txt - "L'excuse de la girafe" importé (index: 1, 61 lignes)
✅ page_10.txt - "Sept lieues" importé (index: 2, 72 lignes)
⏭️  page_11.txt - "Le grand écart" existe déjà, ignoré
✅ page_12.txt - "Colisée" importé (index: 3, 67 lignes)
...

============================================================
📊 RÉSUMÉ
============================================================
✅ Importés avec succès : 75
⏭️  Doublons ignorés     : 3
❌ Erreurs              : 0
📄 Total traités        : 78
============================================================

🔌 Déconnecté de MongoDB

🎉 Import terminé !
```

## 📝 Caractéristiques

- ✅ **Import en masse** : Tous les fichiers .txt d'un coup
- ✅ **Index incrémental** : Attribue automatiquement un index (1, 2, 3, ...) à chaque écrit
- ✅ **Extraction intelligente** : Titre + lignes avec tabulations
- ✅ **Gestion des doublons** : Ignore les titres existants
- ✅ **Connexion sécurisée** : Utilise `.env` ou URI par défaut
- ✅ **Logs détaillés** : Affiche chaque opération avec l'index attribué
- ✅ **Résumé final** : Statistiques complètes
- ✅ **Gestion d'erreurs** : Continue même en cas d'erreur sur un fichier

## 🔗 Intégration avec le workflow

### Workflow complet

1. **Découpage** : `npm run split:pages`
   - Lit `public/imports/all.txt`
   - Crée les fichiers `page_XX.txt` dans `public/imports/`

2. **Import** : `npm run import:pages`
   - Lit tous les `page_XX.txt` dans `public/imports/pages/`
   - Importe dans MongoDB

3. **Visualisation** : Ouvrir `/liste` dans l'application
   - Voir tous les écrits importés
   - Éditer, visualiser, supprimer

## ⚙️ Configuration

### Variables d'environnement

Le script utilise `.env` pour la connexion MongoDB :

```env
MONGODB_URI=mongodb://localhost:27017/envoutement
```

Si non défini, utilise par défaut : `mongodb://localhost:27017/envoutement`

## 🛠️ Dépannage

### Erreur : "Cannot connect to MongoDB"
- ✅ Vérifier que MongoDB est démarré : `mongod`
- ✅ Vérifier l'URI dans `.env`

### Erreur : "No such file or directory"
- ✅ Vérifier que le dossier `public/imports/pages/` existe
- ✅ Vérifier qu'il contient des fichiers `.txt`

### Tous les fichiers sont "ignorés" (doublons)
- ✅ Les écrits existent déjà dans MongoDB
- ✅ Pour réimporter : Supprimer d'abord dans l'application `/liste`

## 📂 Structure des fichiers

```
project/
├── scripts/
│   ├── split_pages.js      ← Découpe all.txt en pages
│   └── import_pages.js     ← Importe les pages dans MongoDB
├── public/
│   └── imports/
│       ├── all.txt         ← Fichier source complet
│       └── pages/
│           ├── page_09.txt ← Pages découpées
│           ├── page_10.txt
│           └── ...
└── .env                    ← Configuration MongoDB
```

## 🎯 Cas d'usage

### Import initial complet

```bash
# 1. Découper le fichier all.txt
npm run split:pages

# 2. Importer toutes les pages
npm run import:pages
```

### Ajout de nouvelles pages

1. Ajouter manuellement des fichiers `.txt` dans `public/imports/pages/`
2. Exécuter : `npm run import:pages`
3. Seuls les nouveaux titres seront importés (pas de doublons)

### Réimport après modification

1. Supprimer les écrits concernés dans `/liste`
2. Exécuter : `npm run import:pages`
3. Les fichiers seront réimportés

