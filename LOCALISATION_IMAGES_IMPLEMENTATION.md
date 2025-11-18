# 🗺️ Implémentation : Localisation par Images

## ✅ Fichiers créés/modifiés

### 1. **Schéma Prisma** (`prisma/schema.prisma`)
- ✅ Ajout du modèle `AnnonceLocation` avec :
  - Localisation validée (address, latitude, longitude, precisionMeters)
  - Données auto (autoAddress, autoLatitude, autoLongitude, autoConfidence, autoSource)
  - Logs (visionRaw, geocodingCandidates)
  - Relation avec `AnnonceScrape`

### 2. **Types TypeScript** (`src/types/location.ts`)
- ✅ `AddressCandidate` : Candidat d'adresse avec score
- ✅ `GeocodedCandidate` : Candidat géocodé avec coordonnées
- ✅ `VisionResult` : Résultat Google Vision API
- ✅ `ExifData` : Données EXIF (lat/lng)
- ✅ `LocationFromImageResult` : Résultat complet du pipeline

### 3. **Client Google** (`src/lib/google/locationClient.ts`)
- ✅ `callVisionForImage()` : Appel Google Vision API (OCR)
- ✅ `extractAddressCandidatesFromVision()` : Extraction d'adresses depuis le texte OCR
- ✅ `geocodeAddressCandidates()` : Géocodage via Google Maps API
- ✅ `fetchStreetViewPreview()` : Génération URL Street View Static
- ✅ `readExifFromImage()` : Lecture EXIF avec exifr

### 4. **Routes API**

#### `src/app/api/annonces/[id]/localisation/from-image/route.ts`
- ✅ POST : Upload d'image et pipeline complet
- ✅ Pipeline :
  1. Auth & validation
  2. Lecture EXIF (priorité)
  3. Google Vision API (OCR)
  4. Extraction d'adresses candidates
  5. Géocodage
  6. Sauvegarde dans `AnnonceLocation`

#### `src/app/api/annonces/[id]/localisation/validate/route.ts`
- ✅ POST : Validation/correction manuelle de la localisation

#### `src/app/api/annonces/[id]/route.ts`
- ✅ GET : Récupération d'une annonce avec sa localisation

### 5. **Composant UI** (`src/components/localisation/LocationFromImageCard.tsx`)
- ✅ Upload d'image (drag & drop)
- ✅ Affichage du résultat (adresse, score, Street View)
- ✅ Validation manuelle
- ✅ Affichage des candidats alternatifs
- ✅ Gestion des états (upload, erreur, validation)

### 6. **Intégration** (`src/app/app/localisation/page.tsx`)
- ✅ Import et affichage du composant `LocationFromImageCard`

### 7. **Dépendances** (`package.json`)
- ✅ Ajout de `exifr` pour la lecture EXIF

### 8. **Configuration** (`env.example`)
- ✅ Ajout des variables :
  - `GOOGLE_CLOUD_VISION_API_KEY`
  - `GOOGLE_MAPS_API_KEY`

---

## 🚀 Prochaines étapes

### Migration Prisma
```bash
# Option 1 : Push direct (développement)
npx prisma db push

# Option 2 : Migration (production)
npx prisma migrate dev --name add_annonce_location
```

### Configuration des clés API Google

1. **Google Cloud Vision API** :
   - Créer un projet sur [Google Cloud Console](https://console.cloud.google.com)
   - Activer l'API Vision : `vision.googleapis.com`
   - Créer une clé API
   - Ajouter dans `.env.local` : `GOOGLE_CLOUD_VISION_API_KEY=...`

2. **Google Maps API** :
   - Dans le même projet Google Cloud
   - Activer les APIs :
     - Geocoding API
     - Street View Static API
   - Créer une clé API (ou réutiliser celle de Vision)
   - Ajouter dans `.env.local` : `GOOGLE_MAPS_API_KEY=...`

### Test du système

1. **Tester avec une image EXIF** :
   - Prendre une photo avec un smartphone (GPS activé)
   - Uploader sur `/app/localisation`
   - Vérifier que les coordonnées sont détectées

2. **Tester avec OCR** :
   - Prendre une photo d'une plaque d'adresse
   - Uploader sur `/app/localisation`
   - Vérifier que l'adresse est détectée et géocodée

3. **Tester la validation** :
   - Après détection, cliquer sur "Valider cette localisation"
   - Vérifier que les données sont sauvegardées dans `AnnonceLocation`

---

## 📋 Architecture du Pipeline

```
1. Upload Image
   ↓
2. Lecture EXIF
   ├─ Si GPS trouvé → Sauvegarde directe (confiance 98%)
   └─ Sinon → Continue
   ↓
3. Google Vision API (OCR)
   ↓
4. Extraction d'adresses (patterns regex)
   ↓
5. Géocodage (Google Maps API)
   ↓
6. Calcul du score global
   ↓
7. Sauvegarde dans AnnonceLocation
   ↓
8. Retour JSON avec résultat
```

---

## 🔧 Améliorations futures

1. **Street View Matching** :
   - Comparer l'image uploadée avec Street View
   - Calculer un score de similarité visuelle

2. **Multi-images** :
   - Permettre l'upload de plusieurs images
   - Validation croisée des résultats

3. **Cache** :
   - Mettre en cache les résultats de géocodage
   - Réduire les appels API

4. **Queue** :
   - Traitement asynchrone pour les images volumineuses
   - Notifications de progression

5. **Tests** :
   - Tests unitaires pour `extractAddressCandidatesFromVision`
   - Tests d'intégration pour la route API

---

## 📝 Notes importantes

- **Coûts Google API** :
  - Vision API : ~$1.50 pour 1000 images
  - Geocoding API : ~$5 pour 1000 requêtes
  - Total estimé : ~$0.01-0.02 par localisation

- **Limites** :
  - Taille max image : 10MB
  - Formats supportés : JPG, PNG, WebP
  - 1 image à la fois (MVP)

- **Sécurité** :
  - Auth requise pour toutes les routes
  - Validation des types de fichiers
  - Validation de la taille

---

## ✅ Checklist de déploiement

- [ ] Migration Prisma exécutée
- [ ] Clés API Google configurées
- [ ] Test avec image EXIF
- [ ] Test avec image OCR
- [ ] Test de validation
- [ ] Vérification des logs
- [ ] Vérification des coûts API

---

**Status** : ✅ Implémentation complète, prête pour tests et déploiement

