# 🔑 Guide de configuration des clés API Google pour la localisation par images

Ce guide vous explique comment configurer les clés API Google nécessaires pour la fonctionnalité de localisation par images.

## ⚠️ IMPORTANT : Facturation requise

Les APIs Google Cloud Vision et Google Maps **nécessitent que la facturation soit activée** sur votre projet Google Cloud, même si vous restez dans les limites du quota gratuit.

**Ne vous inquiétez pas** : Google offre un crédit gratuit de **$300** pour les nouveaux comptes, et les quotas gratuits sont généreux :
- **Vision API** : 1 000 requêtes/mois gratuites pour TEXT_DETECTION
- **Geocoding API** : 40 000 requêtes/mois gratuites
- **Static Maps API** : 28 000 requêtes/mois gratuites

## 📋 Étapes de configuration

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Notez votre **Project ID** (ex: `347115092148`)

### 2. Activer la facturation

**⚠️ Cette étape est obligatoire, même pour utiliser les quotas gratuits.**

1. Dans Google Cloud Console, allez dans **Billing** (Facturation)
2. Cliquez sur **Link a billing account** (Lier un compte de facturation)
3. Suivez les étapes pour ajouter une méthode de paiement
4. **Important** : Vous ne serez pas facturé tant que vous restez dans les limites gratuites

**Lien direct** : https://console.developers.google.com/billing/enable?project=VOTRE_PROJECT_ID

### 3. Activer les APIs nécessaires

Activez ces APIs dans votre projet :

1. **Cloud Vision API**
   - Allez dans **APIs & Services** > **Library**
   - Recherchez "Cloud Vision API"
   - Cliquez sur **Enable**

2. **Maps Geocoding API**
   - Recherchez "Geocoding API"
   - Cliquez sur **Enable**

3. **Maps Static API** (pour Street View)
   - Recherchez "Maps Static API"
   - Cliquez sur **Enable**

### 4. Créer les clés API

1. Allez dans **APIs & Services** > **Credentials**
2. Cliquez sur **Create Credentials** > **API Key**
3. Créez **deux clés API** :
   - Une pour **Cloud Vision API** → `GOOGLE_CLOUD_VISION_API_KEY`
   - Une pour **Maps APIs** → `GOOGLE_MAPS_API_KEY`

**⚠️ Sécurité** : Configurez les restrictions pour chaque clé :
- **Application restrictions** : Restreignez par HTTP referrers (domaines Vercel) ou IPs
- **API restrictions** : Limitez à l'API spécifique (Vision API ou Maps API)

### 5. Configurer les variables d'environnement

#### En local (`.env.local`)

```bash
GOOGLE_CLOUD_VISION_API_KEY="AIzaSy..."
GOOGLE_MAPS_API_KEY="AIzaSy..."
```

#### Sur Vercel

1. Allez dans votre projet Vercel
2. **Settings** > **Environment Variables**
3. Ajoutez les deux variables :
   - `GOOGLE_CLOUD_VISION_API_KEY`
   - `GOOGLE_MAPS_API_KEY`
4. Cochez **Production**, **Preview**, et **Development**
5. Redéployez l'application

## 🧪 Tester la configuration

Une fois configuré, testez la localisation par images :

1. Allez sur la page de localisation
2. Sélectionnez un département
3. Uploadez une image contenant une adresse ou un lieu
4. Vérifiez que la localisation fonctionne

## ❌ Erreur "BILLING_DISABLED"

Si vous voyez l'erreur :
```
This API method requires billing to be enabled
```

**Solution** :
1. Vérifiez que la facturation est activée : https://console.developers.google.com/billing/enable?project=VOTRE_PROJECT_ID
2. Attendez 2-3 minutes après activation
3. Réessayez

## 📊 Surveiller l'utilisation

Pour surveiller votre utilisation et éviter les dépassements :

1. Allez dans **APIs & Services** > **Dashboard**
2. Consultez les quotas et l'utilisation de chaque API
3. Configurez des alertes si nécessaire

## 🔒 Sécurité

**Important** : Ne commitez jamais vos clés API dans Git !

- ✅ Utilisez `.env.local` en local (déjà dans `.gitignore`)
- ✅ Utilisez les variables d'environnement Vercel en production
- ✅ Configurez les restrictions sur les clés API dans Google Cloud Console

## 📚 Ressources

- [Documentation Cloud Vision API](https://cloud.google.com/vision/docs)
- [Documentation Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Pricing Cloud Vision](https://cloud.google.com/vision/pricing)
- [Pricing Maps APIs](https://developers.google.com/maps/billing-and-pricing/pricing)

## 💡 Astuce

Pour économiser les quotas, le système utilise plusieurs stratégies :
- **EXIF GPS** : Si l'image contient des coordonnées GPS, elles sont utilisées en priorité
- **Landmarks** : Détection des monuments connus (Tour Eiffel, etc.)
- **OCR** : Extraction de texte uniquement si nécessaire

