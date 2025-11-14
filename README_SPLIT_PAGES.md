# Script de découpage de pages

## 📋 Description

Le script `scripts/split_pages.js` découpe le fichier `public/imports/all.txt` en plusieurs fichiers individuels basés sur les séparateurs de pages.

## 🚀 Utilisation

### 1. Préparer le fichier source

**IMPORTANT**: Assurez-vous que le fichier `public/imports/all.txt` est bien **sauvegardé** avec le contenu complet avant d'exécuter le script.

Le fichier doit contenir des séparateurs de pages au format :
```
- 9 -
Contenu de la page 9...

- 10 -
Contenu de la page 10...
```

### 2. Exécuter le script

```bash
npm run split:pages
```

### 3. Résultat

Le script créera automatiquement des fichiers dans `public/imports/` :
- `page_09.txt`
- `page_10.txt`
- `page_11.txt`
- etc.

## 🔧 Fonctionnement

1. **Lecture** : Le script lit `public/imports/all.txt`
2. **Détection** : Identifie les séparateurs au format `- XX -`
3. **Découpage** : Sépare le contenu en sections
4. **Extraction du titre** : La première ligne non vide de chaque page devient le titre
5. **Traitement des lignes** :
   - Compte les tabulations `\t` au début de chaque ligne → `nbrTab`
   - Supprime les tabulations ET les espaces en début de ligne
   - Supprime les espaces en fin de ligne (`trimEnd`)
   - Ignore les lignes vides
6. **Sauvegarde** : Crée un fichier pour chaque page avec un nom formaté (`page_01.txt`, `page_02.txt`, etc.)

## 📝 Caractéristiques

- ✅ **Extraction du titre** : La première ligne devient automatiquement le titre
- ✅ **Comptage des tabulations** : Analyse les `\t` au début de chaque ligne → `nbrTab`
- ✅ **Nettoyage du texte** : Supprime les espaces et tabulations en début/fin de ligne
- ✅ **Gère les numéros de page** : De 1 à 999+
- ✅ **Nommage intelligent** : Avec padding (ex: `page_09.txt` au lieu de `page_9.txt`)
- ✅ **Logs détaillés** : Affiche titre, nombre de lignes, et exemple pour chaque page
- ✅ **Gestion d'erreurs** : Lecture/écriture sécurisée

## ⚠️ Problème actuel

**Le fichier `public/imports/all.txt` est vide ou non sauvegardé.**

Pour résoudre ce problème :
1. Ouvrez le fichier `public/imports/all.txt` dans votre éditeur
2. Vérifiez qu'il contient le texte complet avec les séparateurs
3. **Sauvegardez le fichier** (Ctrl+S ou Cmd+S)
4. Réexécutez : `npm run split:pages`

## 📊 Exemple de sortie

```
📖 Lecture du fichier all.txt...
📊 Nombre total de lignes: 5186
📝 Premières lignes:
  1: "- 9 -" (trimmed: "- 9 -")
  2: "L'excuse de la girafe" (trimmed: "L'excuse de la girafe")
  ...

✂️  Découpage en cours...

✅ Page 9 créée
   📝 Titre: "L'excuse de la girafe"
   📊 61 lignes de texte
   📄 Exemple: [tab:0] "Une guerrière lourde toute harnachée"
   💾 Fichier: page_09.txt

✅ Page 10 créée
   📝 Titre: "Sept lieues"
   📊 72 lignes de texte
   📄 Exemple: [tab:0] "La botté du chat,"
   💾 Fichier: page_10.txt

...

🎉 Terminé ! 78 pages créées dans public/imports/
```

### Structure des données extraites

Pour chaque page, le script extrait :

```javascript
{
  titre: "L'excuse de la girafe",  // Première ligne non vide
  lignes: [
    { nbrTab: 0, texte: "Une guerrière lourde toute harnachée" },
    { nbrTab: 1, texte: "qui réitère un défilé..." },         // Ligne avec 1 tabulation
    { nbrTab: 2, texte: "le même débarquement brutal" },      // Ligne avec 2 tabulations
    // ...
  ]
}
```

**Note** : Le script sauvegarde le contenu original dans les fichiers `.txt`, mais affiche les données structurées dans les logs pour faciliter le débogage.

