# 📋 RÉCAPITULATIF DES API ET SERVICES - SYSTÈME DE LOCALISATION

## 🎯 Vue d'ensemble

Le système de localisation SACIMO intègre **8 services externes** pour offrir une localisation précise et multi-sources.

---

## ✅ SERVICES ACTUELLEMENT INTÉGRÉS

### 1. 🗺️ **Google Maps Platform** (Obligatoire)
**Statut** : ✅ **Intégré et fonctionnel**

**APIs utilisées** :
- **Geocoding API** : Conversion adresse → coordonnées GPS
- **Reverse Geocoding API** : Conversion coordonnées → adresse
- **Places API** : Recherche de lieux et POI
- **Street View Static API** : Images panoramiques
- **Street View Panorama** : Vue interactive Street View
- **Maps JavaScript API** : Cartes interactives dans l'interface

**Fichiers** :
- `src/lib/google/locationClient.ts`
- `src/components/localisation/MapResults.tsx`
- `src/components/localisation/hypotheses/StreetViewReal.tsx`
- `src/components/localisation/hypotheses/UnifiedMapView.tsx`

**Variables d'environnement** :
- `GOOGLE_MAPS_API_KEY` (backend)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (frontend)
- `GOOGLE_CLOUD_VISION_API_KEY` (pour Vision API)

**Utilisation** :
- Géocodage des adresses extraites
- Affichage des cartes interactives
- Vérification disponibilité Street View
- Génération d'images Street View statiques

---

### 2. 👁️ **Google Cloud Vision API** (Obligatoire)
**Statut** : ✅ **Intégré et fonctionnel**

**Fonctionnalités** :
- **TEXT_DETECTION** : Extraction de texte dans les images (OCR)
- **LABEL_DETECTION** : Identification d'objets et scènes
- **LANDMARK_DETECTION** : Détection de monuments et lieux emblématiques
- **LOGO_DETECTION** : Détection de logos

**Fichiers** :
- `src/lib/google/locationClient.ts` (fonction `callVisionForImage`)

**Utilisation** :
- Extraction d'adresses depuis les images d'annonces
- Détection de landmarks pour localisation précise
- Analyse visuelle des images

---

### 3. 🤖 **OpenAI API** (Obligatoire)
**Statut** : ✅ **Intégré et fonctionnel**

**Modèles utilisés** :
- **GPT-4o-mini** : Analyse d'images et raisonnement LLM
- **GPT-4o-mini Vision** : Géolocalisation depuis images

**Fichiers** :
- `src/lib/services/localisation/engine.ts`
- `src/lib/google/locationClient.ts` (fonction `guessLocationWithLLM`)

**Utilisations** :
- Extraction d'informations depuis texte/URL d'annonces
- Analyse d'images pour géolocalisation (dernier recours)
- Comparaison d'images (utilisateur vs Street View)
- Génération d'explications détaillées des résultats

**Variable d'environnement** :
- `OPENAI_API_KEY`

---

### 4. 🛰️ **IGN (Institut Géographique National)** (Gratuit)
**Statut** : ✅ **Intégré et fonctionnel**

**Services utilisés** :
- **WMTS Geoportail** : Orthophotos (images satellites haute résolution)
  - URL : `https://wxs.ign.fr/choisirgeoportail/geoportail/wmts`
  - Layer : `ORTHOIMAGERY.ORTHOPHOTOS`
- **API Cadastre** : Parcelles cadastrales
  - URL : `https://apicarto.ign.fr/api/cadastre/parcelle`
  - Documentation : https://geo.api.gouv.fr/cadastre

**Fichiers** :
- `src/lib/services/ign.ts`
- `src/components/localisation/hypotheses/SatelliteView.tsx`
- `src/components/localisation/hypotheses/IGNOrthophotoView.tsx`
- `src/components/localisation/hypotheses/CadastreParcelleView.tsx`
- `src/components/localisation/hypotheses/ImageComparison.tsx`

**Utilisation** :
- Récupération d'images satellites IGN pour comparaison
- Affichage des parcelles cadastrales sur les cartes
- Overlay cadastral sur Google Maps

**Note** : Service **gratuit** et **sans clé API** requise

---

### 5. 🗺️ **MapTiler** (Optionnel - Fallback)
**Statut** : ✅ **Intégré comme fallback**

**Service** :
- **Satellite Tiles** : Images satellites (fallback si IGN indisponible)
  - URL : `https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg`

**Fichiers** :
- `src/lib/services/ign.ts` (fonction `fetchMapTilerTile`)

**Utilisation** :
- Fallback automatique si IGN ne répond pas
- Images satellites alternatives

**Variable d'environnement** :
- `NEXT_PUBLIC_MAPTILER_API_KEY` (optionnel)

---

### 6. 📊 **DVF (Demandes de Valeurs Foncières)** (En développement)
**Statut** : ⚠️ **Stub implémenté, API non connectée**

**Service** :
- Dataset public data.gouv.fr
- Données de ventes immobilières

**Fichiers** :
- `src/lib/services/localisation/dvf.ts`

**Fonctionnalités prévues** :
- Calcul de densité de ventes par zone
- Prix moyen/médian par secteur
- Score de cohérence prix/surface

**Note** : Actuellement en **stub**, nécessite implémentation complète

---

### 7. 🗺️ **API Cadastre data.gouv.fr** (Partiellement intégré)
**Statut** : ⚠️ **Stub implémenté, API non connectée**

**Service** :
- API Cadastre Etalab
- Documentation : https://geo.api.gouv.fr/cadastre

**Fichiers** :
- `src/lib/services/localisation/cadastre.ts`
- `src/components/localisation/hypotheses/CadastreParcelleView.tsx` (utilise `apicarto.ign.fr`)

**Utilisation actuelle** :
- `CadastreParcelleView` utilise `apicarto.ign.fr` (fonctionnel)
- `cadastre.ts` contient un stub pour l'API data.gouv.fr

**Note** : Deux APIs différentes :
- ✅ `apicarto.ign.fr` : **Fonctionnel** (utilisé dans l'UI)
- ⚠️ `geo.api.gouv.fr` : **Stub** (non implémenté)

---

### 8. 🔍 **ZenRows** (Optionnel - Scraping)
**Statut** : ✅ **Intégré mais non utilisé en production**

**Service** :
- Proxy de scraping avec rendu JavaScript
- Utilisé pour LeBonCoin (fallback)

**Fichiers** :
- `src/app/api/debug-express/route.ts`
- `src/lib/scrapers/leboncoin-zenrows.ts`

**Utilisation** :
- Scraping d'annonces LeBonCoin (mode fallback)
- En production, utilise **Melo.io** à la place

**Variable d'environnement** :
- `ZENROWS_API_KEY` (optionnel)

---

### 9. 🏠 **Melo.io** (Obligatoire - Scraping)
**Statut** : ✅ **Intégré et utilisé en production**

**Service** :
- API de scraping d'annonces immobilières
- Multi-sources (LeBonCoin, SeLoger, PAP, etc.)

**Fichiers** :
- `src/lib/services/melo.ts`
- `src/lib/services/smart-scraper.ts`

**Utilisation** :
- Récupération d'annonces immobilières
- Extraction d'images et métadonnées
- Source principale en production

**Variable d'environnement** :
- `MELO_API_KEY`
- `MELO_ENV` (preprod/production)

---

## 📦 BIBLIOTHÈQUES ET OUTILS

### Frontend
- **@react-google-maps/api** : Intégration Google Maps React
- **maplibre-gl** : Cartes MapLibre (pour IGN orthophotos)
- **framer-motion** : Animations UI
- **exifr** : Lecture des métadonnées EXIF (GPS dans images)

### Backend
- **openai** : SDK OpenAI officiel
- **axios** : Requêtes HTTP
- **node-fetch** : Fetch API côté serveur

---

## 🔑 VARIABLES D'ENVIRONNEMENT REQUISES

### Obligatoires
```bash
# Google Maps
GOOGLE_MAPS_API_KEY=your-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key

# Google Cloud Vision
GOOGLE_CLOUD_VISION_API_KEY=your-key

# OpenAI
OPENAI_API_KEY=sk-your-key

# Melo.io
MELO_API_KEY=your-key
MELO_ENV=production
```

### Optionnelles
```bash
# MapTiler (fallback satellite)
NEXT_PUBLIC_MAPTILER_API_KEY=your-key

# ZenRows (scraping fallback)
ZENROWS_API_KEY=your-key
```

---

## 📊 STATUT PAR SERVICE

| Service | Statut | Clé API | Coût | Utilisation |
|---------|--------|---------|------|-------------|
| Google Maps | ✅ Actif | Oui | Payant* | Géocodage, cartes, Street View |
| Google Vision | ✅ Actif | Oui | Payant* | OCR, détection landmarks |
| OpenAI | ✅ Actif | Oui | Payant | Analyse images, LLM |
| IGN WMTS | ✅ Actif | Non | Gratuit | Images satellites |
| IGN Cadastre | ✅ Actif | Non | Gratuit | Parcelles cadastrales |
| MapTiler | ✅ Fallback | Oui | Payant | Satellite (fallback) |
| DVF | ⚠️ Stub | Non | Gratuit | Données ventes (non implémenté) |
| Cadastre data.gouv | ⚠️ Stub | Non | Gratuit | Parcelles (non implémenté) |
| ZenRows | ✅ Intégré | Oui | Payant | Scraping (non utilisé prod) |
| Melo.io | ✅ Actif | Oui | Payant | Scraping annonces |

*Google offre $300 de crédit gratuit + quotas gratuits généreux

---

## 🎯 PIPELINE DE LOCALISATION

### Flux actuel :
1. **Input** : Image / URL / Texte
2. **Extraction** :
   - Google Vision (OCR, landmarks)
   - OpenAI (extraction texte/URL)
   - EXIF (GPS si disponible)
3. **Géocodage** : Google Geocoding API
4. **Enrichissement** :
   - IGN Cadastre (parcelles)
   - IGN Orthophotos (satellite)
   - Street View (vérification + images)
5. **Scoring** :
   - Comparaison images (OpenAI Vision)
   - DVF (stub, non fonctionnel)
   - Hints utilisateur
6. **Résultat** : Liste de candidats avec scores

---

## 📝 NOTES IMPORTANTES

### Services à compléter :
- ⚠️ **DVF** : Implémentation complète nécessaire
- ⚠️ **Cadastre data.gouv.fr** : Alternative à `apicarto.ign.fr` (optionnel)

### Services fonctionnels mais non utilisés :
- **ZenRows** : Intégré mais remplacé par Melo.io en production

### Coûts estimés :
- **Google Maps** : ~$0.005-0.01 par requête (gratuit jusqu'à 28k/mois)
- **Google Vision** : ~$0.0015-0.002 par image (gratuit jusqu'à 1k/mois)
- **OpenAI** : ~$0.0001-0.001 par requête (selon modèle)
- **IGN** : Gratuit
- **Melo.io** : Selon abonnement

---

## 🔗 DOCUMENTATION

- **Google Maps** : https://developers.google.com/maps
- **Google Vision** : https://cloud.google.com/vision/docs
- **OpenAI** : https://platform.openai.com/docs
- **IGN Geoportail** : https://geoservices.ign.fr/documentation/services
- **Cadastre API** : https://geo.api.gouv.fr/cadastre
- **Melo.io** : https://melo.io/docs

---

**Dernière mise à jour** : Janvier 2025

