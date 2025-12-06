# 🎯 Module de Localisation Ultra Puissant - Documentation

## Vue d'ensemble

Le module de localisation est le cœur du produit SACIMO (≈80% de la valeur). Il permet de localiser un bien immobilier à partir de multiples sources d'information.

## Architecture

### Modèles de données (Prisma)

- **`LocalisationRequest`** : Requête de localisation avec statut (PENDING, RUNNING, DONE, FAILED)
- **`LocationCandidate`** : Candidat de localisation avec score de confiance et breakdown détaillé

### Pipeline de localisation

Le pipeline se déroule en 6 phases :

1. **Normalisation & extraction** : Extraction des infos depuis URL, texte ou images
2. **Génération de candidates "coarse"** : Google Geocoding + Places API
3. **Enrichissement cadastral & DVF** : Parcelles IGN + Données de Valeurs Foncières
4. **Analyse Street View & imagerie** : Comparaison avec OpenAI Vision
5. **Scoring global** : Calcul de confiance (0-100) avec breakdown détaillé
6. **Persistance & retour** : Sauvegarde en DB et retour au client

## API Endpoints

### POST `/api/localisation`

Lance une nouvelle requête de localisation.

**Body :**
```json
{
  "url": "https://www.leboncoin.fr/...", // Optionnel
  "text": "Description de l'annonce...", // Optionnel
  "images": ["data:image/jpeg;base64,..."], // Optionnel (max 6)
  "hintPostalCode": "75001", // Optionnel
  "hintCity": "Paris" // Optionnel
}
```

**Réponse :**
```json
{
  "success": true,
  "requestId": "clx...",
  "status": "PENDING",
  "message": "Localisation en cours de traitement"
}
```

### GET `/api/localisation?requestId=xxx`

Récupère le résultat d'une requête de localisation.

**Réponse :**
```json
{
  "success": true,
  "request": {
    "id": "clx...",
    "status": "DONE",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "bestCandidate": {
    "address": "12 rue de la Paix, 75001 Paris",
    "latitude": 48.8688,
    "longitude": 2.3314,
    "confidence": 85,
    "confidenceBreakdown": {
      "text_match": 40,
      "image_match": 25,
      "dvf_density": 15,
      "streetview_similarity": 5
    },
    "sources": {
      "google_geocode": true,
      "cadastre": true,
      "dvf": true,
      "streetview": true
    }
  },
  "candidates": [...],
  "explanation": "Probable à 85% : ..."
}
```

## Interface utilisateur

### Composant `LocalisationAdvanced`

Nouveau composant avec 3 modes d'entrée :
- **URL** : Coller une URL d'annonce
- **Texte** : Coller une description/notes
- **Images** : Uploader jusqu'à 6 images (façade, jardin, piscine, rue, etc.)

### Page `/app/localisation`

Page principale avec onglets :
- **Localisation Avancée (Nouveau)** : Utilise le nouveau système
- **Par Image (Ancien)** : Système existant pour compatibilité

## Intégrations

### ✅ Implémenté

- Google Maps (Geocoding, Places, Street View)
- OpenAI (extraction texte, comparaison images avec GPT-4o Vision)
- Pipeline complet avec scoring

### 🔄 En cours / Stubs

- **Cadastre/IGN** : Stub créé, à connecter à l'API data.gouv.fr
- **DVF** : Stub créé, à charger le dataset CSV ou connecter à l'API

### 📝 TODO

1. **Cadastre** : Implémenter l'appel réel à `https://geo.api.gouv.fr/cadastre/parcelles`
2. **DVF** : Charger et indexer le dataset CSV DVF depuis data.gouv.fr
3. **Job Queue** : Remplacer le polling par un système de jobs (Bull/BullMQ)
4. **Cache** : Mettre en cache les résultats Geocoding et Street View
5. **Feedback Loop** : Enregistrer les validations utilisateur pour améliorer le scoring

## Variables d'environnement

```env
# Requis
OPENAI_API_KEY=sk-...
GOOGLE_MAPS_API_KEY=AIza...

# Optionnel (pour debug)
LOCALISATION_DEBUG=true
```

## Utilisation

### Exemple : Localisation depuis une URL

```typescript
const response = await fetch('/api/localisation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://www.leboncoin.fr/ventes_immobilieres/1234567890.htm',
    hintCity: 'Paris',
    hintPostalCode: '75001'
  })
})

const { requestId } = await response.json()

// Polling pour récupérer le résultat
const result = await fetch(`/api/localisation?requestId=${requestId}`)
```

### Exemple : Localisation depuis du texte

```typescript
const response = await fetch('/api/localisation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Belle maison avec jardin, située près de l\'église de Camblanes-et-Meynac, vue sur la Garonne...',
    hintPostalCode: '33360'
  })
})
```

### Exemple : Localisation depuis des images

```typescript
// Convertir les images en base64
const images = await Promise.all(
  files.map(file => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })
  })
)

const response = await fetch('/api/localisation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    images,
    hintCity: 'Bordeaux',
    hintPostalCode: '33000'
  })
})
```

## Scoring

Le score de confiance (0-100) est calculé à partir de :

- **text_match** (0-40 points) : Correspondance texte/adresse
- **image_match** (0-30 points) : Similarité visuelle avec images fournies
- **dvf_density** (0-20 points) : Densité de ventes DVF dans la zone
- **streetview_similarity** (0-10 points) : Correspondance avec Street View

Un candidat est considéré comme "meilleur" si son score ≥ 60.

## Performance

- Le pipeline s'exécute en arrière-plan (non bloquant)
- Polling recommandé toutes les 5 secondes
- Timeout recommandé : 5 minutes max
- Pour production : utiliser un job queue (Bull/BullMQ)

## Prochaines étapes

1. ✅ Modèles Prisma créés
2. ✅ Pipeline de base implémenté
3. ✅ API endpoints créés
4. ✅ Interface utilisateur créée
5. 🔄 Intégration Cadastre (stub → réel)
6. 🔄 Intégration DVF (stub → réel)
7. ⏳ Job queue pour traitement asynchrone
8. ⏳ Cache pour optimiser les performances
9. ⏳ Feedback loop pour amélioration continue


