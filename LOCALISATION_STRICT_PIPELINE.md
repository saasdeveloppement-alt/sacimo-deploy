# 🎯 Pipeline de Localisation STRICT - Machine de Guerre

## Vue d'ensemble

Ce pipeline transforme le moteur de localisation IA en une **machine de guerre focalisée** sur :

1. **L'image** (maison + piscine) avec signature visuelle précise
2. **Une zone géographique STRICTEMENT bornée** (code postal + rayon optionnel)
3. **Un système d'hypothèses multiples** (jusqu'à 10 maisons candidates) avec scoring détaillé

## ⚠️ Contrainte ABSOLUE

**Si l'utilisateur fournit un code postal (ex : 33360), AUCUNE hypothèse ne doit sortir de ce code postal.**

Si aucune hypothèse crédible n'est trouvée dans ce code postal, le système renvoie un message explicite plutôt que d'élargir automatiquement.

---

## Architecture du Pipeline

### PHASE 1 : Analyse Image → VisualSignature

**Fichier** : `src/services/ai/imageAnalysis.ts`

**Fonction** : `extractVisualSignature(imageUrl: string): Promise<VisualSignature>`

Extrait une signature visuelle focalisée sur la **piscine** :
- Présence de piscine (booléen + confiance)
- Forme exacte (rectangulaire, haricot, L, ronde)
- Orientation approximative
- Taille relative
- Style (couleur, bordure, position)
- Maison (étages, toiture, façade)
- Végétation

**Utilise** : OpenAI Vision (gpt-4o) avec prompt ultra-précis

---

### PHASE 2 : Détermination Zone STRICTE

**Fichier** : `src/services/geo/zoneReduction.ts`

**Fonction** : `determineStrictPostalZone(postalCode: string, radiusKm?: number): Promise<StrictSearchZone>`

Construit une zone de recherche **strictement bornée** par le code postal :
- Centre géographique du CP (via Google Geocoding)
- Bounding box du CP
- Rayon optionnel (appliqué MAIS reste dans le CP)
- Mode `STRICT_POSTAL_ZONE` activé

**Aucune extension automatique** : Si la zone est vide, erreur métier `NO_COVERAGE_FOR_POSTAL_CODE`

---

### PHASE 3 : Détection Piscines sur Satellite

**Fichier** : `src/services/pool-detection/poolDetector.ts`

**Fonctions** :
- `getSearchTilesForZone(zone): Promise<GeoTile[]>` : Génère les tuiles à scanner
- `detectPoolsInZone(zone, visualSignature): Promise<CandidateLocation[]>` : Détecte les piscines

**Processus** :
1. Génère une grille de points dans le bounding box
2. Pour chaque point, génère une vue satellite
3. Utilise OpenAI Vision mini pour détecter les piscines
4. Reverse geocode pour obtenir l'adresse
5. **Filtre strict** : Ne garde QUE les candidats dans le code postal demandé

**Limites** :
- Maximum 30 candidats pour performance
- Batch de 10 tuiles en parallèle

**Erreurs métier** :
- `NO_POOL_FOUND_IN_ZONE` : Aucune piscine trouvée
- `NO_COVERAGE_FOR_POSTAL_CODE` : Pas de couverture satellite

---

### PHASE 4 : Scoring Détaillé

**Fichier** : `src/services/matching/strictScoringEngine.ts`

**Fonction** : `scoreCandidate(candidateLocation, visualSignature, userImageUrl): Promise<ScoredCandidate>`

Compare la photo utilisateur avec chaque vue satellite candidate via **OpenAI Vision** :

**ScoreBreakdown** (0-100 pour chaque critère) :
- `poolShapeMatch` (coefficient x3) : Forme de piscine
- `poolOrientationMatch` (coefficient x2) : Orientation
- `poolSizeMatch` (coefficient x2) : Taille
- `houseStyleMatch` (coefficient x1.5) : Style architectural
- `roofMatch` (coefficient x1.5) : Toiture
- `vegetationMatch` (coefficient x1) : Végétation
- `cadastreMatch` (coefficient x1) : Cadastre
- `streetViewMatch` (coefficient x1) : Street View

**Score global** : Moyenne pondérée des sous-scores

**Explication** : Génère automatiquement une explication textuelle du matching

---

### PHASE 5 : Génération Assets Visuels

**Fichier** : `src/services/visuals/assetGenerator.ts`

**Fonction** : `generateCandidateVisuals(lat, lng): Promise<CandidateVisuals>`

Génère pour chaque candidat :
- `satelliteUrl` : Vue satellite Google Maps
- `cadastreOverlayUrl` : Plan cadastral IGN
- `streetViewUrl` : Street View (si disponible)
- `streetViewAvailable` : Flag de disponibilité

---

## API Route

**Endpoint** : `POST /api/localization/analyze-strict`

**Body** :
```json
{
  "imageUrl": "https://...", // OU
  "imageFile": File,
  "postalCode": "33360",      // OBLIGATOIRE
  "radiusKm": 5               // Optionnel (0 = commune stricte)
}
```

**Réponse OK** :
```json
{
  "status": "ok",
  "postalCode": "33360",
  "candidates": [
    {
      "id": "...",
      "lat": 44.123,
      "lng": -0.456,
      "score": 87,
      "breakdown": {
        "poolShapeMatch": 95,
        "poolOrientationMatch": 80,
        ...
      },
      "explanation": "...",
      "adresse": "...",
      "codePostal": "33360",
      "ville": "...",
      "visuals": {
        "satelliteUrl": "...",
        "cadastreOverlayUrl": "...",
        "streetViewUrl": "...",
        "streetViewAvailable": true
      }
    }
  ],
  "meta": {
    "totalCandidates": 8,
    "bestScore": 87,
    "worstScore": 45
  }
}
```

**Réponse Erreur** :
```json
{
  "status": "no_pool_found_in_zone" | "no_candidates_in_postal_code" | "no_coverage_for_postal_code",
  "postalCode": "33360",
  "candidates": [],
  "message": "Message explicatif..."
}
```

---

## Types TypeScript

Tous les types sont définis dans `src/types/localisation-advanced.ts` :

- `VisualSignature` : Signature visuelle extraite de l'image
- `StrictSearchZone` : Zone strictement bornée par code postal
- `CandidateLocation` : Candidat détecté par scan satellite
- `ScoredCandidate` : Candidat avec score détaillé
- `ScoreBreakdown` : Breakdown détaillé du score
- `CandidateVisuals` : Assets visuels
- `StrictLocalizationResponse` : Réponse API

---

## Utilisation

### Frontend

```typescript
const response = await fetch('/api/localization/analyze-strict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageUrl: 'https://...',
    postalCode: '33360',
    radiusKm: 5, // Optionnel
  }),
});

const data: StrictLocalizationResponse = await response.json();

if (data.status === 'ok') {
  // Afficher les candidats
  data.candidates.forEach(candidate => {
    console.log(`${candidate.adresse}: ${candidate.score}/100`);
    console.log('Breakdown:', candidate.breakdown);
  });
} else {
  // Afficher le message d'erreur
  console.error(data.message);
}
```

---

## Logs & Debug

Le pipeline génère des logs structurés à chaque étape :

```
[StrictLocalizationAPI] Starting strict analysis...
[StrictLocalizationAPI] PHASE 1: Extracting visual signature...
[ImageAnalysis] Visual signature extracted: { hasPool: true, poolShape: 'rectangular', ... }
[StrictLocalizationAPI] PHASE 2: Determining strict postal zone...
[ZoneReduction] Strict zone determined: { postalCode: '33360', ... }
[StrictLocalizationAPI] PHASE 3: Detecting pools in zone...
[PoolDetector] Generated 400 tiles to scan
[PoolDetector] Found 12 pool candidates in postal code 33360
[StrictLocalizationAPI] PHASE 4: Scoring candidates...
[StrictScoring] Candidate candidate-1 scored: 87/100
[StrictLocalizationAPI] PHASE 5: Generating visuals...
[StrictLocalizationAPI] Analysis complete: { candidatesCount: 8, bestScore: 87 }
```

---

## Performance

- **Timeout** : 5 minutes (300s) configuré dans la route
- **Limites** :
  - Maximum 30 candidats détectés (pour performance)
  - Maximum 10 candidats retournés (top 10)
  - Batch de 10 tuiles en parallèle pour la détection

---

## Prochaines Étapes

1. **Frontend** : Mettre à jour `ResultsDisplay.tsx` pour afficher les nouveaux résultats
2. **Optimisation** : Cache des vues satellite pour éviter les appels répétés
3. **Amélioration** : Vérification polygon stricte pour le code postal (au lieu de simple string match)
4. **Tests** : Tests unitaires pour chaque phase du pipeline

---

## Fichiers Modifiés/Créés

### Nouveaux fichiers
- `src/services/pool-detection/poolDetector.ts`
- `src/services/matching/strictScoringEngine.ts`
- `src/app/api/localization/analyze-strict/route.ts`

### Fichiers modifiés
- `src/types/localisation-advanced.ts` : Nouveaux types
- `src/services/ai/imageAnalysis.ts` : Fonction `extractVisualSignature`
- `src/services/geo/zoneReduction.ts` : Fonction `determineStrictPostalZone`
- `src/services/visuals/assetGenerator.ts` : Fonction `generateCandidateVisuals`

---

## Notes Importantes

1. **Code postal obligatoire** : Le pipeline strict nécessite un code postal valide
2. **Pas d'extension automatique** : Si aucun candidat trouvé, on renvoie une erreur explicite
3. **Piscine prioritaire** : Le système est optimisé pour détecter les piscines
4. **Scoring détaillé** : Chaque candidat a un breakdown complet pour transparence
5. **Assets visuels** : Tous les candidats ont des vues satellite/cadastre/street view

---

## Support

Pour toute question ou problème, vérifier les logs dans la console serveur et les réponses API.

