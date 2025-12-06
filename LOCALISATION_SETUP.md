# 🚀 Configuration - Localisation IA

## ✅ Vérifications préalables

Toutes les dépendances sont déjà installées :
- ✅ `sonner` (v2.0.7) - Pour les notifications toast
- ✅ `lucide-react` (v0.545.0) - Pour les icônes
- ✅ Le Toaster est configuré dans `/src/app/layout.tsx`

## 🔑 Configuration des clés API

### 1. Créer le fichier `.env.local`

À la racine du projet (`/sacimo/.env.local`), créez un fichier avec ce contenu :

```bash
# OpenAI API Key (requis pour l'analyse d'images)
OPENAI_API_KEY=sk-proj-VOTRE_CLE_ICI

# Google Maps API Key (requis pour la géolocalisation)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaVOTRE_CLE_ICI
```

### 2. Obtenir vos clés API

**OpenAI API Key :**
1. Allez sur https://platform.openai.com/api-keys
2. Créez une nouvelle clé API
3. Copiez-la dans `.env.local`

**Google Maps API Key :**
1. Allez sur https://console.cloud.google.com/google/maps-apis
2. Créez un projet ou sélectionnez-en un
3. Activez ces APIs :
   - Maps JavaScript API
   - Geocoding API
   - Static Maps API
   - Street View Static API
4. Créez une clé API
5. Copiez-la dans `.env.local`

### 3. Vérifier que `.env.local` est ignoré

Le fichier `.env.local` est déjà dans `.gitignore` (ligne 82), donc vos clés ne seront pas commitées.

## 📁 Fichiers configurés

✅ **Route API** : `/src/app/api/localisation/simple/route.ts`
- Analyse d'image avec OpenAI Vision
- Géocodage avec Google Maps
- Génération de candidats mockés

✅ **Page Frontend** : `/src/app/dashboard/localisation/page.tsx`
- Upload d'image
- Champs pour code postal et ville
- Affichage des résultats

✅ **Layout** : `/src/app/layout.tsx`
- Toaster configuré avec `expand={true}`

## 🚀 Démarrage

1. **Créez `.env.local`** avec vos clés API (voir ci-dessus)

2. **Redémarrez le serveur** :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   npm run dev
   ```

3. **Accédez à la page** :
   ```
   http://localhost:3000/dashboard/localisation
   ```

4. **Testez** :
   - Uploadez une image de bien immobilier
   - (Optionnel) Ajoutez un code postal
   - Cliquez sur "Lancer la localisation IA"
   - Attendez les résultats !

## 🐛 Dépannage

### Erreur "OPENAI_API_KEY missing"
- Vérifiez que `.env.local` existe à la racine de `/sacimo/`
- Vérifiez que la variable s'appelle exactement `OPENAI_API_KEY`
- Redémarrez le serveur après modification de `.env.local`

### Erreur "GOOGLE_MAPS_API_KEY missing"
- Vérifiez que `.env.local` contient `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Notez le préfixe `NEXT_PUBLIC_` qui est obligatoire pour les variables côté client
- Redémarrez le serveur

### Erreur "Failed to fetch"
- Vérifiez que le serveur Next.js tourne (`npm run dev`)
- Vérifiez la console du navigateur (F12) pour plus de détails
- Vérifiez les logs du serveur dans le terminal

### Erreur "No content in OpenAI response"
- Vérifiez que votre compte OpenAI a des crédits
- Vérifiez que la clé API est valide
- Vérifiez les logs du serveur pour l'erreur exacte

## 📝 Notes

- Les candidats retournés sont **mockés** pour l'instant (version MVP)
- L'analyse d'image utilise GPT-4o Vision
- Les vues satellite et Street View sont générées via Google Maps Static API
- Le code postal est utilisé pour géocoder et centrer la recherche

## 🔄 Prochaines étapes

Pour passer à la version complète avec vraie recherche de parcelles :
- Utilisez `/api/localisation` au lieu de `/api/localisation/simple`
- La page `/app/localisation` utilise déjà cette route complète

