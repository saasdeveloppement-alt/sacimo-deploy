# 🗺️ Module de Visualisation des Hypothèses de Localisation

## Vue d'ensemble

Module complet de visualisation multi-vues pour les hypothèses de localisation, permettant d'afficher chaque candidat sous différents angles cartographiques.

## Architecture

### Composants créés

```
src/components/localisation/hypotheses/
├── MapViewSwitcher.tsx          # Sélecteur d'onglets (5 vues)
├── UnifiedMapView.tsx            # Conteneur unifié qui change de vue
├── IGNOrthophotoView.tsx         # Vue orthophotos IGN (MapLibre)
├── CadastreParcelleView.tsx      # Vue parcelles cadastrales
├── ImageComparison.tsx           # Comparaison image annonce vs satellite
├── HypothesisMapView.tsx         # Composant principal combiné
└── index.ts                      # Exports centralisés
```

## Types de vues disponibles

### 1. **Plan** (Google Maps)
- Vue classique Google Maps
- Utilise `@react-google-maps/api`
- Contrôles de zoom, Street View, type de carte

### 2. **Satellite** (Google Maps)
- Vue satellite Google Maps
- Même API que Plan, avec `mapTypeId: "satellite"`
- Idéal pour voir les bâtiments et terrains

### 3. **Street View** (Google Maps)
- Intégration `StreetViewPanorama`
- Vue à 360° depuis la position
- Contrôles de navigation intégrés

### 4. **Parcelle** (IGN Cadastre)
- Affiche les parcelles cadastrales en overlay
- API : `https://apicarto.ign.fr/api/cadastre/parcelle`
- Polygones semi-transparents sur fond satellite
- Récupération automatique via code postal

### 5. **IGN** (Orthophotos)
- Vue orthophotos IGN via WMTS
- Utilise MapLibre GL JS
- Layer : `ORTHOIMAGERY.ORTHOPHOTOS`
- Haute résolution, mise à jour régulière

## Utilisation

### Composant principal

```tsx
import { HypothesisMapView } from "@/components/localisation/hypotheses"

<HypothesisMapView
  latitude={48.8566}
  longitude={2.3522}
  address="12 rue de la Paix, 75001 Paris"
  postalCode="75001"
  parcelId="parcel-123"
  annonceImageUrl="https://..."
  satelliteImageUrl="https://..."
  height="400px"
  zoom={18}
/>
```

### Composants individuels

#### MapViewSwitcher
```tsx
import { MapViewSwitcher, type MapViewType } from "@/components/localisation/hypotheses"

const [activeView, setActiveView] = useState<MapViewType>("plan")

<MapViewSwitcher
  activeView={activeView}
  onViewChange={setActiveView}
/>
```

#### UnifiedMapView
```tsx
import { UnifiedMapView } from "@/components/localisation/hypotheses"

<UnifiedMapView
  latitude={48.8566}
  longitude={2.3522}
  viewType="satellite"
  height="400px"
  zoom={18}
/>
```

#### ImageComparison
```tsx
import { ImageComparison } from "@/components/localisation/hypotheses"

<ImageComparison
  annonceImageUrl="https://..."
  satelliteImageUrl="https://..."
  address="12 rue de la Paix"
/>
```

## Intégration dans CandidateCarousel

Le composant `CandidateCarousel` utilise automatiquement `HypothesisMapView` pour afficher les cartes multi-vues :

```tsx
<CandidateCarousel
  candidates={[
    {
      id: "1",
      address: "12 rue de la Paix",
      latitude: 48.8566,
      longitude: 2.3522,
      confidence: 85,
      postalCode: "75001",
      parcelId: "parcel-123",
      annonceImageUrl: "https://...",
      satelliteImageUrl: "https://...",
      // ...
    }
  ]}
/>
```

## APIs utilisées

### Google Maps Platform
- **API Key** : `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **Bibliothèque** : `@react-google-maps/api`
- **Services** :
  - Maps JavaScript API (Plan, Satellite)
  - Street View Static API
  - Geocoding API (reverse)

### IGN Géoportail
- **API Cadastre** : `https://apicarto.ign.fr/api/cadastre/parcelle`
  - Paramètres : `geom=true&code_insee=<code>&format=json`
  - Retour : GeoJSON avec polygones de parcelles

- **WMTS Orthophotos** : `https://wxs.ign.fr/choisirgeoportail/geoportail/wmts`
  - Layer : `ORTHOIMAGERY.ORTHOPHOTOS`
  - Format : JPEG
  - TileMatrixSet : PM

### API Géo (data.gouv.fr)
- **Communes** : `https://geo.api.gouv.fr/communes`
  - Récupération du code INSEE depuis code postal

## Technologies

- **React** : Composants client-side
- **TypeScript** : Typage strict
- **@react-google-maps/api** : Intégration Google Maps
- **maplibre-gl** : Carte IGN (orthophotos)
- **Tailwind CSS** : Styling
- **shadcn/ui** : Composants UI (Button, Card, Dialog, etc.)

## Fonctionnalités

### MapViewSwitcher
- 5 onglets : Plan, Satellite, Street View, Parcelle, IGN
- Design cohérent avec le reste du SaaS
- Navigation fluide entre les vues
- Icônes Lucide React

### UnifiedMapView
- Détection automatique du type de vue
- Gestion des erreurs (API key manquante, etc.)
- Loading states
- Fallback si une vue échoue

### IGNOrthophotoView
- Carte MapLibre avec style IGN
- Marqueur sur la position
- Attribution IGN
- Zoom et pan interactifs

### CadastreParcelleView
- Récupération automatique des parcelles
- Affichage en overlay sur fond satellite
- Polygones colorés (violet, semi-transparent)
- Compteur de parcelles affichées

### ImageComparison
- Grid 2 colonnes (annonce vs satellite)
- Zoom synchronisé
- Plein écran pour chaque image
- Gestion des erreurs de chargement

## Configuration requise

### Variables d'environnement

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Dépendances

```json
{
  "@react-google-maps/api": "^2.20.7",
  "maplibre-gl": "^latest",
  "@types/maplibre-gl": "^latest"
}
```

## Gestion des erreurs

### Google Maps
- Vérification de l'API key
- Affichage d'un message si manquante
- Fallback gracieux

### IGN
- Try/catch sur les appels API
- Messages d'erreur explicites
- Fallback si API indisponible

### Images
- Gestion des erreurs de chargement
- Affichage d'un placeholder si image manquante
- Support base64 et URLs

## Performance

- **Lazy loading** : Les vues ne se chargent que quand sélectionnées
- **Memoization** : Calculs de centre/zoom mémorisés
- **Batch requests** : Parcelles récupérées en une seule requête
- **Cache** : Images proxy cache 1h

## Exemples d'utilisation

### Vue simple
```tsx
<HypothesisMapView
  latitude={48.8566}
  longitude={2.3522}
  address="Paris"
  viewType="satellite"
/>
```

### Vue complète avec comparaison
```tsx
<HypothesisMapView
  latitude={48.8566}
  longitude={2.3522}
  address="12 rue de la Paix, 75001 Paris"
  postalCode="75001"
  annonceImageUrl="data:image/jpeg;base64,..."
  satelliteImageUrl="https://maps.googleapis.com/..."
  height="500px"
  zoom={19}
/>
```

## Prochaines améliorations

1. **Cache parcelles** : Mettre en cache les données de parcelles par code INSEE
2. **Meilleure gestion Street View** : Vérifier disponibilité avant affichage
3. **Export images** : Permettre d'exporter les comparaisons
4. **Annotations** : Permettre d'annoter les images
5. **3D view** : Intégrer Google Maps 3D si disponible

## Fichiers modifiés

- `src/components/localisation/CandidateCarousel.tsx` : Intégration HypothesisMapView
- `src/components/localisation/LocalisationAdvanced.tsx` : Passage des données (postalCode, parcelId, etc.)
- `src/app/api/localisation/route.ts` : Retour des scores individuels et URLs

## Notes techniques

- **Street View** : Nécessite que la position soit accessible depuis la route
- **Parcelles** : Nécessite un code postal valide pour récupérer le code INSEE
- **IGN Orthophotos** : Nécessite une connexion internet pour charger les tuiles
- **MapLibre** : Nécessite l'import CSS `maplibre-gl/dist/maplibre-gl.css`

