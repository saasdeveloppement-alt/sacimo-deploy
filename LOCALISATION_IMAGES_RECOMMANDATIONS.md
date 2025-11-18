# 🗺️ Recommandations pour la Localisation par Images

## 🎯 Objectif
Permettre à l'utilisateur de localiser un bien immobilier de manière précise en utilisant une ou plusieurs images (photos de la façade, panneaux de rue, plaques d'adresse, etc.).

---

## 🏗️ Architecture Recommandée

### 1. **Upload d'Images Multiples**
- **Zone de drag & drop** pour uploader plusieurs images
- **Prévisualisation** des images avant traitement
- **Compression automatique** pour optimiser les performances
- **Formats supportés** : JPG, PNG, WebP
- **Taille max** : 10MB par image, 50MB total

### 2. **Traitement des Images (Backend)**

#### A. **OCR (Optical Character Recognition)**
- **Service recommandé** : Google Cloud Vision API ou Tesseract.js
- **Extraction** :
  - Adresses complètes (numéro + rue + ville + code postal)
  - Noms de rues
  - Codes postaux
  - Numéros de bâtiment
  - Panneaux indicateurs

#### B. **Géocoding**
- **Service recommandé** : Google Maps Geocoding API ou API Adresse (data.gouv.fr)
- **Conversion** : Adresse textuelle → Coordonnées GPS (lat/lng)
- **Validation** : Vérification de l'existence de l'adresse

#### C. **Reconnaissance Visuelle (Optionnel)**
- **Google Vision API** : Détection de bâtiments, panneaux, éléments urbains
- **Comparaison avec Street View** : Vérification de la cohérence

### 3. **Interface Utilisateur**

#### A. **Zone d'Upload**
```
┌─────────────────────────────────────┐
│  📸 Glissez vos images ici          │
│  ou cliquez pour sélectionner       │
│                                      │
│  [Image 1] [Image 2] [Image 3]     │
│  ✓      ✓      ⏳                    │
└─────────────────────────────────────┘
```

#### B. **Résultats de l'Analyse**
- **Adresses détectées** avec score de confiance
- **Coordonnées GPS** extraites
- **Carte interactive** (Google Maps / Mapbox) avec marqueur
- **Possibilité de corriger** manuellement

#### C. **Validation Manuelle**
- **Édition** de l'adresse détectée
- **Déplacement du marqueur** sur la carte
- **Confirmation** de la localisation

---

## 🛠️ Technologies Recommandées

### Frontend
- **React Dropzone** : Upload d'images avec drag & drop
- **Google Maps React** : Carte interactive
- **react-image-crop** : Annotation/cropping des images
- **Tesseract.js** : OCR côté client (optionnel, pour preview)

### Backend
- **Google Cloud Vision API** : OCR et reconnaissance visuelle
- **Google Maps Geocoding API** : Conversion adresse → GPS
- **API Adresse (data.gouv.fr)** : Alternative gratuite pour la France
- **Sharp** : Traitement et compression d'images
- **Multer** : Gestion des uploads de fichiers

### Base de Données
- **Stockage des images** : 
  - Option 1 : Vercel Blob Storage
  - Option 2 : AWS S3
  - Option 3 : Supabase Storage
- **Métadonnées** : Prisma (latitude, longitude, adresse, images URLs)

---

## 📋 Fonctionnalités Détaillées

### 1. **Workflow Utilisateur**

```
1. Upload d'images
   ↓
2. Analyse automatique (OCR + Géocoding)
   ↓
3. Affichage des résultats avec carte
   ↓
4. Validation/Correction manuelle
   ↓
5. Sauvegarde de la localisation
```

### 2. **Détection Intelligente**

#### Scénarios d'Images :
- **Plaque d'adresse** : "15 Rue de la Paix, 75001 Paris"
- **Panneau de rue** : "Rue de la Paix"
- **Façade avec numéro** : "15" visible sur la porte
- **Vue de la rue** : Reconnaissance visuelle du quartier
- **Document** : Fiche technique, facture, etc.

#### Stratégie de Détection :
1. **OCR sur toutes les images** → Extraction de texte
2. **Filtrage** : Recherche de patterns d'adresses françaises
3. **Géocoding** : Conversion en coordonnées
4. **Validation croisée** : Si plusieurs images → vérifier cohérence
5. **Score de confiance** : Basé sur la précision de l'OCR et la validation

### 3. **Carte Interactive**

- **Marqueur principal** : Position détectée
- **Rayon d'incertitude** : Si confiance < 90%
- **Street View intégré** : Vérification visuelle
- **Mode satellite** : Vérification aérienne
- **Déplacement manuel** : Drag & drop du marqueur

---

## 💡 Implémentation Progressive

### Phase 1 : MVP (Minimum Viable Product)
✅ Upload d'images multiples
✅ OCR basique (Tesseract.js ou Google Vision)
✅ Géocoding simple (API Adresse)
✅ Carte avec marqueur
✅ Correction manuelle

### Phase 2 : Amélioration
✅ Validation croisée (plusieurs images)
✅ Score de confiance
✅ Street View intégré
✅ Historique des localisations

### Phase 3 : Avancé
✅ Reconnaissance visuelle (Google Vision)
✅ Comparaison avec Street View
✅ Suggestions automatiques
✅ Export des coordonnées

---

## 🔐 Sécurité & Performance

### Sécurité
- **Validation des fichiers** : Type, taille, contenu
- **Sanitization** : Nettoyage des données OCR
- **Rate limiting** : Limite d'uploads par utilisateur
- **Stockage sécurisé** : Images privées, non accessibles publiquement

### Performance
- **Compression** : Réduction de la taille des images
- **Traitement asynchrone** : Queue pour les analyses longues
- **Cache** : Mise en cache des résultats de géocoding
- **CDN** : Distribution des images via CDN

---

## 📊 Métriques de Succès

- **Taux de détection** : % d'images avec adresse détectée
- **Précision** : Distance moyenne entre position détectée et réelle
- **Temps de traitement** : < 5 secondes par image
- **Taux de validation manuelle** : % nécessitant correction

---

## 🎨 Design UI/UX Recommandé

### Layout
```
┌─────────────────────────────────────────────────┐
│  [Upload Zone]          [Carte Interactive]     │
│  [Images Preview]      [Résultats OCR]         │
│  [Adresses détectées]  [Validation]            │
└─────────────────────────────────────────────────┘
```

### États Visuels
- **⏳ En traitement** : Spinner + progression
- **✅ Détecté** : Badge vert + carte avec marqueur
- **⚠️ Incertain** : Badge orange + demande de validation
- **❌ Non détecté** : Badge rouge + saisie manuelle

---

## 💰 Coûts Estimés

### Google Cloud Vision API
- **OCR** : ~$1.50 pour 1000 images
- **Géocoding** : ~$5 pour 1000 requêtes
- **Total estimé** : ~$0.01-0.02 par localisation

### Alternative Gratuite (France)
- **API Adresse** : Gratuit (data.gouv.fr)
- **Tesseract.js** : Gratuit (open source)
- **Total** : Gratuit mais moins précis

---

## 🚀 Prochaines Étapes

1. **Créer l'API d'upload d'images**
2. **Intégrer Google Vision API ou Tesseract**
3. **Créer l'API de géocoding**
4. **Développer l'interface d'upload**
5. **Intégrer la carte interactive**
6. **Ajouter la validation manuelle**

---

## 📝 Exemple de Code Structure

```
src/
├── app/
│   └── app/
│       └── localisation/
│           └── page.tsx (Page principale)
├── components/
│   └── localisation/
│       ├── ImageUpload.tsx (Zone d'upload)
│       ├── ImagePreview.tsx (Prévisualisation)
│       ├── OCRResults.tsx (Résultats OCR)
│       ├── MapView.tsx (Carte interactive)
│       └── LocationValidator.tsx (Validation)
├── lib/
│   └── services/
│       ├── image-ocr.ts (Service OCR)
│       ├── geocoding.ts (Service Géocoding)
│       └── image-storage.ts (Stockage images)
└── app/
    └── api/
        ├── localisation/
        │   ├── upload/route.ts (Upload images)
        │   ├── analyze/route.ts (Analyse OCR)
        │   └── geocode/route.ts (Géocoding)
```

---

## ✅ Recommandation Finale

**Approche recommandée** :
1. **Commencer simple** : Upload + OCR basique + Géocoding API Adresse
2. **Améliorer progressivement** : Ajouter Google Vision si besoin
3. **Focus UX** : Interface intuitive avec validation manuelle facile
4. **Performance** : Traitement asynchrone pour ne pas bloquer l'UI

**Stack technique recommandée** :
- **OCR** : Google Cloud Vision API (meilleure précision)
- **Géocoding** : API Adresse (gratuit) + Google Maps (fallback)
- **Carte** : Google Maps React ou Mapbox
- **Upload** : React Dropzone + Vercel Blob Storage

