# 🎯 Module d'Enrichissement par Hints Utilisateur

## Vue d'ensemble

Le module d'enrichissement permet aux utilisateurs de fournir des indices structurés pour améliorer significativement la précision de la localisation. Ces hints sont exploités systématiquement dans le pipeline de localisation.

## Architecture

### 1. Modèle de données

**Type TypeScript** : `LocalizationUserHints` (défini dans `src/types/localisation.ts`)

**Modèle Prisma** : Le champ `userHints` (JSON) a été ajouté à `LocalisationRequest`

```typescript
model LocalisationRequest {
  id          String   @id @default(cuid())
  userId      String?
  rawInput    Json     // URL, texte, images
  userHints   Json?    // <-- NOUVEAU : indices structurés
  status      LocalisationStatus
  // ...
}
```

### 2. Structure des Hints

Les hints sont organisés en 4 catégories :

#### A. Infos de base
- `city`, `postalCode` : Localisation géographique
- `propertyType` : Type de bien (maison, appartement, etc.)
- `roomsApprox` : Nombre de pièces (T1, T2, T3, etc.)
- `priceRange` : Fourchette de prix (min/max en €)
- `surfaceHabitableRange` : Surface habitable (min/max en m²)

#### B. Gabarit
- `housingTypeDetails` :
  - `maisonMitoyennete` : 0 (isolée), 1 (1 côté), 2 (2 côtés)
  - `terrainSurfaceRange` : Surface du terrain
  - `appartEtage` : Étage approximatif
  - `balconOuTerrasse` : Présence d'un balcon/terrasse
- `constructionPeriod` : Période de construction

#### C. Environnement
- `quartierType` : Type de quartier (centre-bourg, lotissement, campagne, etc.)
- `piscine` : Présence et type de piscine
- `vue` : Type de vue (village, vignes, forêt, etc.)
- `repereProche` : Repère à proximité (école, mairie, supermarché) avec distance

#### D. Divers
- `notesLibres` : Texte libre supplémentaire

## Interface utilisateur

### Wizard en 3 étapes

**Composant** : `LocalisationWizard` (`src/components/localisation/LocalisationWizard.tsx`)

#### Étape 1 — Entrée principale
- Ville, code postal
- Type de bien

#### Étape 2 — Contexte rapide
- Nombre de pièces (T1, T2, T3, T4, T5+)
- Surface habitable approximative (<40, 40-60, 60-80, 80-120, 120+ m²)
- Fourchette de prix (<150k, 150-250k, 250-400k, 400-600k, 600k+ €)

#### Étape 3 — Boost précision (optionnel)
- Type de quartier
- Détails selon le type de bien :
  - **Maison** : Mitoyenneté, surface terrain
  - **Appartement** : Étage, balcon/terrasse
- Période de construction
- Piscine
- Vue
- Repère proche (type, nom, distance)
- Notes libres

**Fonctionnalités** :
- Barre de progression "Précision estimée" qui augmente avec les hints renseignés
- Indication visuelle : "Plus vous ajoutez d'informations, plus la localisation pourra être précise"
- Intégration dans `LocalisationAdvanced` avec bouton "Enrichir avec plus d'informations"

## Exploitation dans le pipeline

### Fichiers modifiés

1. **`engine.ts`** : Pipeline principal adapté pour accepter et utiliser les hints
2. **`hints-scoring.ts`** : Nouvelles fonctions de scoring basées sur les hints

### Utilisations concrètes

#### 1. Réduction de zone géographique

**Fonction** : `reduceZoneWithHints()`

- Si `quartierType = "campagne_isolee"` : Exclure les centres denses
- Si `quartierType = "lotissement_recent" + constructionPeriod = "apres2015"` : Privilégier les lotissements récents

#### 2. Filtrage DVF / cohérence prix-surface

**Fonction** : `scorePrixSurfaceDVF()`

- Compare les fourchettes `priceRange` et `surfaceHabitableRange` avec les données DVF
- Augmente le score si cohérent, pénalise si éloigné
- Score : 0-10 points

#### 3. Match typologie bâti

**Fonction** : `scoreTypologie()`

- Vérifie la cohérence du type de bien
- Match mitoyenneté (isolée vs mitoyenne)
- Match période de construction
- Score : 0-10 points

#### 4. Score quartier

**Fonction** : `scoreQuartier()`

- Vérifie la cohérence du type de quartier
- Score : 0-3 points

#### 5. Score piscine

**Fonction** : `scorePiscine()`

- Vérifie la présence/absence de piscine
- Score : 0-2 points

#### 6. Score repère proche

**Fonction** : `scoreRepere()`

- Géocode le repère (école, mairie, supermarché)
- Calcule la distance réelle vs distance indiquée
- Score basé sur la proximité de la distance cible
- Score : 0-10 points

### Nouveau scoring global

Le scoring a été réorganisé pour intégrer les hints :

- **text_match** : 0-30 points (réduit de 40)
- **image_match** : 0-25 points
- **dvf_density** : 0-10 points
- **streetview_similarity** : 0-10 points
- **scoreTypologie** : 0-10 points (nouveau, basé sur hints)
- **scorePrixSurfaceDVF** : 0-10 points (nouveau, basé sur hints)
- **scoreQuartier** : 0-3 points (nouveau, basé sur hints)
- **scorePiscine** : 0-2 points (nouveau, basé sur hints)
- **scoreRepere** : 0-10 points (nouveau, basé sur hints)

**Total** : 0-100 points

## Génération d'explications

**Fonction** : `generateDetailedExplanation()`

Utilise OpenAI GPT-4o-mini pour générer une explication naturelle et rassurante basée sur :
- L'adresse proposée
- Le niveau de confiance
- Les hints utilisés
- Le breakdown de confiance détaillé

**Exemple** :
> "Nous estimons avec 82% de confiance que le bien se situe ici, car il s'agit d'une maison récente en lotissement, sans mitoyenneté, dans le secteur de Camblanes-et-Meynac, correspondant à la surface et au prix indiqués, à 5 minutes à pied de l'école X, comme indiqué."

## API

### POST `/api/localisation`

**Nouveau champ** : `userHints` (optionnel)

```json
{
  "url": "https://...",
  "text": "...",
  "images": [...],
  "userHints": {
    "city": "Paris",
    "postalCode": "75001",
    "propertyType": "maison",
    "roomsApprox": "T4",
    "priceRange": { "min": 400000, "max": 600000 },
    "surfaceHabitableRange": { "min": 80, "max": 120 },
    "housingTypeDetails": {
      "maisonMitoyennete": 0,
      "terrainSurfaceRange": { "min": 500, "max": 800 }
    },
    "constructionPeriod": "apres2015",
    "quartierType": "lotissement_recent",
    "piscine": "oui_rectangulaire",
    "repereProche": {
      "type": "ecole",
      "nom": "École Jules Ferry",
      "distanceMinutes": 5
    }
  }
}
```

### GET `/api/localisation?requestId=xxx`

**Nouveau champ dans la réponse** : `explanations` (string généré avec OpenAI)

## Utilisation

### Dans l'interface

1. L'utilisateur entre les informations de base (URL, texte, ou images)
2. Optionnel : Clique sur "Enrichir avec plus d'informations"
3. Remplit le wizard en 3 étapes
4. Soumet la localisation avec les hints
5. Reçoit une explication détaillée générée par IA

### Impact sur la précision

- **Sans hints** : Score de base (text_match + image_match + dvf_density + streetview)
- **Avec hints** : Score enrichi avec jusqu'à +35 points supplémentaires (typologie, prix/surface, quartier, piscine, repère)

## Prochaines améliorations

1. **Enrichissement automatique** : Détecter automatiquement certains hints depuis le texte/URL
2. **Validation hints** : Vérifier la cohérence des hints entre eux
3. **Apprentissage** : Utiliser les validations utilisateur pour améliorer les poids de scoring
4. **Intégration données réelles** : Utiliser les données cadastrales et DVF réelles pour valider les hints


