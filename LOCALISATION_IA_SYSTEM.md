# 🏠 Système de Localisation Immobilière IA

## 📋 Vue d'ensemble

Système complet de géolocalisation immobilière assistée par IA qui transforme une photo ou URL d'annonce en analyse exhaustive avec jusqu'à 10 hypothèses d'adresses.

## 🏗️ Architecture

### Structure des fichiers

```
src/
├── types/
│   └── localisation-advanced.ts          # Types TypeScript complets
├── services/
│   ├── ai/
│   │   └── imageAnalysis.ts              # Analyse IA (OpenAI + Google Vision)
│   ├── scraping/
│   │   └── urlExtractor.ts               # Extraction depuis URLs
│   ├── geo/
│   │   └── zoneReduction.ts              # Réduction de zone de recherche
│   ├── matching/
│   │   ├── candidateFinder.ts            # Recherche de candidats
│   │   └── scoringEngine.ts              # Moteur de scoring
│   └── visuals/
│       └── assetGenerator.ts              # Génération d'assets visuels
├── app/
│   └── api/
│       └── localization/
│           └── analyze/
│               └── route.ts               # API route principale
└── components/
    └── localisation/
        └── ResultsDisplay.tsx              # Composant d'affichage des résultats
```

## 🔄 Pipeline d'analyse

### Phase 1 : Extraction & Analyse Visuelle (0-30s)

1. **Analyse IA de l'image**
   - OpenAI Vision : Analyse architecturale détaillée
   - Google Vision : Détection de labels et landmarks
   - Fusion intelligente des résultats

2. **Extraction depuis URL**
   - Détection automatique de la source (LeBonCoin, SeLoger, etc.)
   - Extraction des données structurées
   - Récupération des images supplémentaires

### Phase 2 : Réduction de Zone (30-60s)

- Priorité 1 : Coordonnées GPS dans l'image → zone 500m
- Priorité 2 : Code postal → zone communale (3km)
- Priorité 3 : Ville → zone large (10km)
- Priorité 4 : Indices climatiques → région (50km)

### Phase 3 : Recherche & Scoring (60-120s)

1. Récupération des parcelles cadastrales dans la zone
2. Analyse satellite de chaque parcelle candidate
3. Calcul du score de matching (piscine, végétation, surface, etc.)
4. Tri et sélection des 10 meilleurs candidats

### Phase 4 : Génération d'Assets (120-180s)

- Vue satellite Google Maps
- Street View (si disponible)
- Plan cadastral IGN
- Orthophoto IGN
- Carte interactive

## 🔌 APIs Intégrées

### Google Maps Platform
- **Static Maps API** : Vues satellites
- **Street View Static API** : Panoramas
- **Geocoding API** : Conversion adresse ↔ coordonnées

### OpenAI
- **GPT-4 Vision** : Analyse architecturale détaillée

### Google Vision
- **Label Detection** : Détection d'éléments visuels
- **Landmark Detection** : Repères géographiques

### IGN (Institut Géographique National)
- **WFS Cadastre** : Parcelles cadastrales
- **WMTS Orthophotos** : Images satellites haute résolution

## 📊 Scoring

Le système calcule un score de matching global (0-100) basé sur :

- **Piscine** (poids x3) : Présence et forme
- **Architecture** (poids x1.5) : Style et matériaux
- **Végétation** (poids x1.2) : Correspondance environnementale
- **Surface** (poids x1.0) : Cohérence avec l'annonce
- **Orientation** (poids x1.0) : Direction du bâtiment
- **Contexte** (poids x0.8) : Prix DVF, quartier

## 🚀 Utilisation

### API Route

```typescript
POST /api/localization/analyze

Body:
{
  imageUrl?: string;
  imageFile?: File;
  url?: string;
  description?: string;
  hints?: {
    codePostal?: string;
    ville?: string;
    typeBien?: string;
    surfaceMin?: number;
    surfaceMax?: number;
    prixMin?: number;
    prixMax?: number;
  };
}

Response:
{
  success: boolean;
  analysis: {
    imageAnalysis: ImageAnalysisResult;
    searchZone: SearchZone;
    candidatesCount: number;
  };
  candidates: PropertyCandidate[];
}
```

### Composant React

```tsx
import { ResultsDisplay } from '@/components/localisation/ResultsDisplay';

<ResultsDisplay candidates={candidates} />
```

## ⚙️ Configuration

### Variables d'environnement

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
OPENAI_API_KEY=your_key
GOOGLE_VISION_API_KEY=your_key
```

### Configuration Vercel

```json
{
  "functions": {
    "api/localization/analyze": {
      "maxDuration": 300,
      "memory": 3008
    }
  }
}
```

## 📈 Optimisations

- **Cache** : Analyses d'images mises en cache (7 jours)
- **Parallélisation** : Appels API en parallèle
- **Lazy loading** : Visuels générés à la demande
- **Limite** : Maximum 50 parcelles analysées par requête

## 🧪 Tests

```typescript
// Tests unitaires à créer
describe('Scoring Engine', () => {
  it('should give 0 score if pool is missing', () => {
    // ...
  });
});
```

## 📝 TODO / Améliorations futures

- [ ] Implémenter l'analyse réelle des images satellites
- [ ] Intégrer l'API DVF pour validation prix
- [ ] Améliorer le scraping SeLoger, PAP, etc.
- [ ] Ajouter le cache Redis/KV
- [ ] Implémenter l'upload réel vers Vercel Blob
- [ ] Créer les tests unitaires
- [ ] Optimiser les performances (parallélisation avancée)
- [ ] Ajouter la gestion d'erreurs robuste
- [ ] Implémenter le modal de visualisation des images

## 🎯 Résultat attendu

Un système qui :
- ✅ Analyse automatiquement les caractéristiques visuelles
- ✅ Réduit intelligemment la zone de recherche
- ✅ Trouve 10 maisons candidates avec scores de confiance
- ✅ Affiche pour chacune : vue satellite, street view, cadastre, orthophoto
- ✅ Explique en détail pourquoi chaque adresse est proposée
- ✅ Le tout en moins de 3 minutes

