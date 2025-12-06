# 🎯 Améliorations du Module de Visualisation des Hypothèses

## Vue d'ensemble

Améliorations majeures du module de visualisation pour ajouter des fonctionnalités réelles et fonctionnelles :
- Street View réel avec vérification de disponibilité
- Images satellites IGN avec fallback MapTiler
- Chargement automatique d'images IGN dans la comparaison visuelle

## Nouvelles fonctionnalités

### 1. Street View Réel ✅

**Composant** : `StreetViewReal.tsx`

**Fonctionnalités** :
- Utilise `google.maps.StreetViewPanorama` pour un affichage réel
- Vérifie la disponibilité via `checkStreetViewAvailability()`
- Affiche un message clair si Street View n'est pas disponible
- Logs détaillés pour le debugging

**Utilisation** :
```tsx
<StreetViewReal
  latitude={48.8566}
  longitude={2.3522}
  height="400px"
  address="12 rue de la Paix"
/>
```

**Logs** :
- `✅ [StreetView] Disponible pour lat, lng` si disponible
- `⚠️ [StreetView] Non disponible pour lat, lng (status: ...)` si indisponible

### 2. Service IGN ✅

**Fichier** : `src/lib/services/ign.ts`

**Fonctions principales** :

#### `getIgnOrthophotoTile(lat, lng, options)`
- Récupère une tuile satellite IGN centrée sur lat/lng
- Utilise WMTS Geoportail : `https://wxs.ign.fr/choisirgeoportail/geoportail/wmts`
- Layer : `ORTHOIMAGERY.ORTHOPHOTOS`
- Zoom par défaut : 19
- Retourne une image base64

#### `checkStreetViewAvailability(lat, lng)`
- Vérifie si Street View est disponible pour une position
- Utilise `google.maps.StreetViewService`
- Retourne `true` si disponible, `false` sinon

**Fallback MapTiler** :
- Si IGN échoue, utilise automatiquement MapTiler
- URL : `https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg`
- Nécessite `NEXT_PUBLIC_MAPTILER_API_KEY` (optionnel)

**Logs détaillés** :
- `🛰️ [IGN] Récupération orthophoto pour lat, lng (zoom X)`
- `🛰️ [IGN] Récupération tuile: z=X, x=Y, y=Z`
- `✅ [IGN] Tuile récupérée: X bytes`
- `⚠️ [IGN] IGN indisponible, fallback MapTiler...`
- `✅ [MapTiler] Image générée: X caractères`

### 3. SatelliteView ✅

**Composant** : `SatelliteView.tsx`

**Fonctionnalités** :
- Charge automatiquement une image satellite IGN
- Fallback MapTiler si IGN échoue
- États de chargement avec spinner
- Gestion d'erreurs avec messages clairs
- Callback `onImageLoaded` pour récupérer l'URL

**Utilisation** :
```tsx
<SatelliteView
  latitude={48.8566}
  longitude={2.3522}
  height="400px"
  address="12 rue de la Paix"
  onImageLoaded={(imageUrl) => {
    console.log("Image chargée:", imageUrl)
  }}
/>
```

### 4. ImageComparison amélioré ✅

**Modifications** :
- Charge automatiquement l'image IGN si `latitude` et `longitude` sont fournis
- Affiche l'image IGN à droite si aucune `satelliteImageUrl` n'est fournie
- Indicateur "(IGN)" pour distinguer les sources
- État de chargement pendant le téléchargement IGN

**Utilisation** :
```tsx
<ImageComparison
  annonceImageUrl="https://..."
  latitude={48.8566}
  longitude={2.3522}
  address="12 rue de la Paix"
/>
```

### 5. UnifiedMapView mis à jour ✅

**Modifications** :
- Utilise `StreetViewReal` au lieu du placeholder
- Utilise `SatelliteView` pour la vue satellite (IGN)
- Vue Plan reste sur Google Maps classique

## Fichiers créés/modifiés

### Nouveaux fichiers

```
src/lib/services/
└── ign.ts                          ✅ NOUVEAU

src/components/localisation/hypotheses/
├── StreetViewReal.tsx              ✅ NOUVEAU
└── SatelliteView.tsx               ✅ NOUVEAU
```

### Fichiers modifiés

```
src/components/localisation/hypotheses/
├── UnifiedMapView.tsx              ✅ MODIFIÉ
├── ImageComparison.tsx             ✅ MODIFIÉ
├── HypothesisMapView.tsx           ✅ MODIFIÉ
└── index.ts                        ✅ MODIFIÉ (exports)
```

## Configuration

### Variables d'environnement

**Requis** :
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

**Optionnel** (pour fallback MapTiler) :
```env
NEXT_PUBLIC_MAPTILER_API_KEY=your_key_here
```

### APIs utilisées

1. **IGN Géoportail WMTS**
   - URL : `https://wxs.ign.fr/choisirgeoportail/geoportail/wmts`
   - Layer : `ORTHOIMAGERY.ORTHOPHOTOS`
   - Format : JPEG
   - Gratuit, pas d'API key requise

2. **MapTiler Satellite** (fallback)
   - URL : `https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg`
   - Nécessite une API key (gratuite disponible)
   - Utilisé uniquement si IGN échoue

3. **Google Maps Street View**
   - Service : `google.maps.StreetViewService`
   - Panorama : `google.maps.StreetViewPanorama`
   - Nécessite `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Logs et debugging

### Logs IGN
- `🛰️ [IGN] Récupération orthophoto pour lat, lng (zoom X)`
- `🛰️ [IGN] Récupération tuile: z=X, x=Y, y=Z`
- `✅ [IGN] Tuile récupérée: X bytes`
- `✅ [IGN] Image générée: X caractères`
- `⚠️ [IGN] Erreur HTTP X pour tuile z/x/y`
- `❌ [IGN] Erreur récupération tuile`

### Logs MapTiler
- `🛰️ [MapTiler] Récupération tuile: z=X, x=Y, y=Z`
- `✅ [MapTiler] Tuile récupérée: X bytes`
- `✅ [MapTiler] Image générée: X caractères`
- `⚠️ [MapTiler] API key non configurée`

### Logs Street View
- `✅ [StreetView] Disponible pour lat, lng`
- `⚠️ [StreetView] Non disponible pour lat, lng (status: ...)`
- `⚠️ [StreetView] Google Maps API non chargée`

### Logs SatelliteView
- `🛰️ [SatelliteView] Chargement image pour lat, lng`
- `✅ [SatelliteView] Image chargée`
- `⚠️ [SatelliteView] Aucune image disponible`

### Logs ImageComparison
- `✅ [ImageComparison] Image IGN chargée`
- `❌ [ImageComparison] Erreur chargement IGN: ...`

## Gestion des erreurs

### Street View
- **Non disponible** : Affiche un message orange avec icône d'alerte
- **API non chargée** : Message d'erreur rouge
- **Erreur de chargement** : Message d'erreur avec détails

### Images satellites
- **IGN indisponible** : Fallback automatique sur MapTiler
- **MapTiler indisponible** : Message d'erreur avec placeholder
- **Erreur de conversion** : Message d'erreur explicite

### ImageComparison
- **Pas d'image annonce** : Affiche uniquement la vue satellite
- **Pas d'image satellite** : Charge automatiquement IGN si lat/lng fournis
- **Erreur de chargement** : Placeholder avec message

## Performance

- **Lazy loading** : Images chargées uniquement quand nécessaires
- **Cache** : Les images base64 sont mises en cache par le navigateur
- **Fallback rapide** : Si IGN échoue, MapTiler est appelé immédiatement
- **Vérification Street View** : Asynchrone, ne bloque pas l'UI

## TypeScript

- ✅ Tous les types sont définis
- ✅ Aucun `any` (sauf pour `window.google` qui nécessite un cast)
- ✅ Interfaces claires pour tous les props
- ✅ Types de retour explicites
- ✅ Gestion des erreurs typée

## Tests recommandés

1. **Street View disponible** : Tester avec une adresse connue (ex: Paris)
2. **Street View indisponible** : Tester avec une zone rurale
3. **IGN fonctionnel** : Vérifier que les images se chargent
4. **Fallback MapTiler** : Désactiver temporairement IGN pour tester
5. **ImageComparison** : Vérifier le chargement automatique IGN

## Prochaines améliorations possibles

1. **Cache IGN** : Mettre en cache les images IGN par coordonnées
2. **Composition multi-tuiles** : Charger plusieurs tuiles pour une vue plus large
3. **Préchargement** : Précharger les images pendant le chargement
4. **Compression** : Optimiser la taille des images base64
5. **Service Worker** : Mettre en cache les tuiles pour usage offline

