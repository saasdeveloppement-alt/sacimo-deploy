# 🔑 Guide : Création des Clés API pour la Localisation IA

Ce guide vous explique comment créer et configurer les clés API Google nécessaires pour le système de localisation par images.

---

## 📋 Clés API Requises

1. **Google Cloud Vision API** : Pour l'OCR (extraction de texte depuis les images)
2. **Google Maps API** : Pour le géocodage (adresse → coordonnées GPS) et Street View

---

## 🚀 Étape 1 : Créer un Projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google
3. Cliquez sur le sélecteur de projet en haut (à côté de "Google Cloud")
4. Cliquez sur **"Nouveau projet"**
5. Donnez un nom au projet (ex: "SACIMO Localisation")
6. Cliquez sur **"Créer"**
7. Attendez quelques secondes, puis sélectionnez le nouveau projet

---

## 🔍 Étape 2 : Activer Google Cloud Vision API

1. Dans la console Google Cloud, allez dans **"APIs & Services"** → **"Library"** (Bibliothèque)
2. Recherchez **"Cloud Vision API"**
3. Cliquez sur le résultat
4. Cliquez sur **"Enable"** (Activer)
5. Attendez quelques secondes que l'API soit activée

---

## 🗺️ Étape 3 : Activer Google Maps APIs

1. Toujours dans **"APIs & Services"** → **"Library"**
2. Recherchez et activez les APIs suivantes :
   - **"Geocoding API"** → Cliquez sur **"Enable"**
   - **"Street View Static API"** → Cliquez sur **"Enable"**

---

## 🔑 Étape 4 : Créer les Clés API

### Option A : Créer une Clé API Unique (Plus Simple)

1. Allez dans **"APIs & Services"** → **"Credentials"** (Identifiants)
2. Cliquez sur **"+ CREATE CREDENTIALS"** (Créer des identifiants)
3. Sélectionnez **"API key"** (Clé API)
4. Une clé API sera générée automatiquement
5. **Copiez cette clé** (vous ne pourrez plus la voir après)

### Option B : Créer des Clés Séparées (Recommandé pour la Production)

#### Clé pour Vision API :
1. **"APIs & Services"** → **"Credentials"**
2. **"+ CREATE CREDENTIALS"** → **"API key"**
3. Cliquez sur la clé créée pour l'éditer
4. Dans **"API restrictions"**, sélectionnez **"Restrict key"**
5. Choisissez **"Cloud Vision API"**
6. Cliquez sur **"Save"**
7. **Copiez la clé** → C'est votre `GOOGLE_CLOUD_VISION_API_KEY`

#### Clé pour Maps APIs :
1. Répétez les étapes 1-2
2. Dans **"API restrictions"**, sélectionnez **"Restrict key"**
3. Choisissez :
   - **"Geocoding API"**
   - **"Street View Static API"**
4. Cliquez sur **"Save"**
5. **Copiez la clé** → C'est votre `GOOGLE_MAPS_API_KEY`

---

## 💳 Étape 5 : Configurer la Facturation (Important)

⚠️ **Les APIs Google nécessitent un compte de facturation activé**

1. Allez dans **"Billing"** (Facturation) dans le menu
2. Si vous n'avez pas de compte de facturation :
   - Cliquez sur **"Link a billing account"** (Lier un compte de facturation)
   - Suivez les instructions pour ajouter une carte bancaire
3. Google offre **$300 de crédit gratuit** pour les nouveaux comptes
4. Les APIs utilisées ont des quotas gratuits :
   - **Vision API** : 1000 requêtes/mois gratuites
   - **Geocoding API** : 200$ de crédit gratuit/mois
   - **Street View Static** : 28,000 requêtes/mois gratuites

---

## 🔐 Étape 6 : Configurer les Restrictions (Recommandé)

Pour sécuriser vos clés API :

1. Cliquez sur la clé API dans **"Credentials"**
2. Dans **"Application restrictions"** :
   - Pour production : **"HTTP referrers"** → Ajoutez votre domaine Vercel
   - Pour développement : **"None"** (temporairement)
3. Dans **"API restrictions"** :
   - Sélectionnez **"Restrict key"**
   - Choisissez uniquement les APIs nécessaires
4. Cliquez sur **"Save"**

---

## 📝 Étape 7 : Ajouter les Clés dans Vercel

### Pour Vercel (Production) :

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet SACIMO
3. Allez dans **"Settings"** → **"Environment Variables"**
4. Ajoutez les variables suivantes :

```
GOOGLE_CLOUD_VISION_API_KEY = votre-clé-vision-api
GOOGLE_MAPS_API_KEY = votre-clé-maps-api
```

5. Sélectionnez **"Production"**, **"Preview"**, et **"Development"**
6. Cliquez sur **"Save"**
7. **Redéployez** votre application pour que les variables soient prises en compte

### Pour le Développement Local :

1. Créez/modifiez le fichier `.env.local` à la racine du projet :

```bash
# Google Cloud Vision API
GOOGLE_CLOUD_VISION_API_KEY=votre-clé-vision-api

# Google Maps API (Geocoding + Street View)
GOOGLE_MAPS_API_KEY=votre-clé-maps-api
```

2. Redémarrez le serveur de développement :
```bash
npm run dev
```

---

## ✅ Étape 8 : Tester les Clés API

### Test Vision API :

```bash
curl "https://vision.googleapis.com/v1/images:annotate?key=VOTRE_CLE_VISION" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [{
      "image": {
        "content": "base64-encoded-image"
      },
      "features": [{
        "type": "TEXT_DETECTION"
      }]
    }]
  }'
```

### Test Geocoding API :

```bash
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Paris&key=VOTRE_CLE_MAPS"
```

---

## 💰 Coûts Estimés

### Tarification Google Cloud (après crédit gratuit) :

- **Vision API** : ~$1.50 pour 1000 images
- **Geocoding API** : ~$5 pour 1000 requêtes
- **Street View Static** : Gratuit jusqu'à 28k/mois

### Estimation par Localisation :

- **Coût moyen** : ~$0.01-0.02 par localisation
- **Avec crédit gratuit** : ~1000-2000 localisations gratuites

---

## 🔒 Sécurité

### Bonnes Pratiques :

1. ✅ **Ne jamais commiter les clés API** dans Git
2. ✅ **Utiliser des restrictions** sur les clés API
3. ✅ **Limiter les quotas** dans Google Cloud Console
4. ✅ **Surveiller l'utilisation** dans "APIs & Services" → "Dashboard"
5. ✅ **Créer des clés séparées** pour dev/prod

### En cas de Fuite de Clé :

1. Allez dans **"Credentials"**
2. Cliquez sur la clé compromise
3. Cliquez sur **"Delete"** ou **"Regenerate"**
4. Mettez à jour les variables d'environnement

---

## 🐛 Dépannage

### Erreur : "API key not valid"
- Vérifiez que la clé est correctement copiée
- Vérifiez que l'API est activée
- Vérifiez les restrictions de la clé

### Erreur : "Billing account required"
- Activez la facturation dans Google Cloud Console
- Attendez quelques minutes que le compte soit activé

### Erreur : "Quota exceeded"
- Vérifiez votre utilisation dans "APIs & Services" → "Dashboard"
- Augmentez les quotas si nécessaire
- Attendez la réinitialisation mensuelle

---

## 📚 Ressources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Documentation Vision API](https://cloud.google.com/vision/docs)
- [Documentation Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Documentation Street View Static](https://developers.google.com/maps/documentation/streetview)
- [Tarification Google Cloud](https://cloud.google.com/pricing)

---

## ✅ Checklist

- [ ] Projet Google Cloud créé
- [ ] Vision API activée
- [ ] Geocoding API activée
- [ ] Street View Static API activée
- [ ] Clés API créées
- [ ] Facturation activée
- [ ] Restrictions configurées
- [ ] Variables d'environnement ajoutées dans Vercel
- [ ] Variables d'environnement ajoutées dans `.env.local`
- [ ] Tests effectués

Une fois toutes ces étapes complétées, votre système de localisation IA sera opérationnel ! 🚀


