# 📥 Guide d'import des données DVF depuis Box.com (Cerema)

## 🎯 Objectif

Ce script importe les données DVF depuis le dossier Box.com du Cerema dans votre base Supabase.

## 📋 Prérequis

1. ✅ Variables d'environnement configurées dans `.env.local`
2. ✅ Table `dvf_transactions` créée dans Supabase
3. ✅ Accès au dossier Box : https://cerema.app.box.com/v/dvfplus-opendata/folder/347156829578

## 🔑 Obtenir les URLs de téléchargement direct

Box.com nécessite généralement une authentification. Pour obtenir les URLs de téléchargement direct :

### Méthode 1 : Lien de téléchargement direct

1. Allez sur : https://cerema.app.box.com/v/dvfplus-opendata/folder/347156829578
2. Cliquez sur un fichier (ex: `dvf-75.csv.gz` ou `dvf-communes-75.csv`)
3. Cliquez sur **"Télécharger"** ou **"Download"**
4. **Faites un clic droit** sur le bouton de téléchargement → **"Copier l'adresse du lien"**
5. Copiez l'URL complète (elle ressemble à : `https://app.box.com/shared/static/...`)

### Méthode 2 : Via l'API Box (avancé)

Si vous avez un token d'accès Box :
1. Créez un compte développeur Box
2. Obtenez un token d'accès
3. Utilisez l'API Box pour lister les fichiers

## 🚀 Configuration

### Étape 1 : Modifier le script

Ouvrez `scripts/import-dvf-box.ts` et modifiez le tableau `DVF_BOX_URLS` :

```typescript
const DVF_BOX_URLS = [
  // Ajoutez ici les URLs de téléchargement direct que vous avez copiées
  "https://app.box.com/shared/static/xxxxxxxxxxxxx/dvf-75.csv.gz",
  "https://cerema.app.box.com/s/yyyyyyyyyyyyyyy/dvf-communes-75.csv",
]
```

### Étape 2 : Exécuter le script

```bash
cd sacimo
npm run import:dvf-box
```

## 🔄 Fallback automatique

Si les URLs Box ne fonctionnent pas, le script essaie automatiquement :
- Les URLs data.gouv.fr (2024, 2023, sans année)
- Les fichiers déjà téléchargés en cache

## 📊 Ce que fait le script

1. **Télécharge** depuis Box.com (ou fallback data.gouv.fr)
2. **Décompresse** si nécessaire (.gz)
3. **Parse et filtre** les données :
   - Type : Appartement ou Maison
   - Prix : 100k€ - 3M€
   - Surface : 15m² - 200m²
   - Date : 2022-2024
4. **Insère par batch de 500** dans Supabase
5. **Affiche les statistiques**

## 🐛 Dépannage

### "403 - Accès refusé"
→ L'URL nécessite une authentification. Utilisez un lien de téléchargement direct ou configurez l'API Box.

### "404 - Fichier non trouvé"
→ L'URL est incorrecte ou le fichier a été déplacé. Vérifiez le lien dans Box.

### "Aucune URL configurée"
→ Ajoutez au moins une URL dans `DVF_BOX_URLS` dans le script.

## 💡 Alternative : Utiliser data.gouv.fr

Si Box ne fonctionne pas, utilisez plutôt :
```bash
npm run import:dvf
```

Ce script utilise directement data.gouv.fr avec plusieurs URLs de fallback.

## ✅ Vérification

Après l'import, testez :
```bash
npm run test:estimation
```

Vous devriez voir des transactions DVF réelles dans les résultats.

---

**Note** : Les URLs Box peuvent expirer. Si le script échoue, vérifiez que les liens sont toujours valides.

