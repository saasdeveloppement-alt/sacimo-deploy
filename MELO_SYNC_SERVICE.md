# 🔄 Service de Synchronisation Melo.io

## 📋 Vue d'ensemble

Le service `MeloSyncService` gère la synchronisation complète des annonces depuis l'API Melo.io vers votre base de données.

## 🎯 Fonctionnalités

### 1. Synchronisation des annonces
- ✅ Récupération depuis l'API Melo.io
- ✅ Détection automatique des doublons
- ✅ Sauvegarde en base (`AnnonceScrape`)
- ✅ Transformation optionnelle en `Listing` structuré
- ✅ Calcul des statistiques

### 2. Statistiques globales
- Total d'annonces
- Annonces ajoutées aujourd'hui
- Prix moyen
- Surface moyenne
- Top 5 des villes

### 3. Nettoyage
- Suppression des annonces anciennes (> X jours)

## 📁 Fichiers créés

- ✅ `src/lib/services/melo-sync.ts` - Service de synchronisation
- ✅ `src/app/api/melo/sync/route.ts` - Endpoint de synchronisation
- ✅ `src/app/api/melo/sync/clean/route.ts` - Endpoint de nettoyage

## 🔌 Endpoints API

### 1. Synchronisation

**POST** `/api/melo/sync`

**Body :**
```json
{
  "filters": {
    "ville": "Paris",
    "minPrix": 200000,
    "maxPrix": 500000,
    "typeBien": "appartement",
    "pieces": 2,
    "chambres": 2,
    "transactionType": "vente"
  },
  "limit": 50,
  "transformToListing": false
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Synchronisation réussie: 30 nouvelles annonces, 5 doublons",
  "result": {
    "newAnnonces": 30,
    "duplicates": 5,
    "errors": 0,
    "totalProcessed": 35,
    "stats": {
      "prixMoyen": 365784,
      "surfaceMoyenne": 79,
      "nouvellesVilles": ["Paris", "Lyon", "Marseille"]
    }
  }
}
```

### 2. Statistiques globales

**GET** `/api/melo/sync`

**Réponse :**
```json
{
  "success": true,
  "stats": {
    "totalAnnonces": 150,
    "annoncesAujourdhui": 12,
    "prixMoyen": 365784,
    "surfaceMoyenne": 79,
    "topVilles": [
      { "ville": "Paris", "count": 45 },
      { "ville": "Lyon", "count": 23 },
      { "ville": "Marseille", "count": 18 }
    ]
  }
}
```

### 3. Nettoyage

**POST** `/api/melo/sync/clean`

**Body (optionnel) :**
```json
{
  "daysToKeep": 30
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "25 annonces supprimées",
  "deletedCount": 25,
  "daysToKeep": 30
}
```

## 💻 Utilisation

### Dans le code TypeScript

```typescript
import { meloSyncService } from '@/lib/services/melo-sync';

// Synchronisation simple
const result = await meloSyncService.syncAnnonces({
  filters: {
    ville: 'Paris',
    minPrix: 200000,
    maxPrix: 500000,
    typeBien: 'appartement',
  },
  limit: 50,
});

// Synchronisation avec transformation en Listing
const result = await meloSyncService.syncAnnonces({
  filters: {
    ville: 'Lyon',
    typeBien: 'maison',
  },
  transformToListing: true, // Transforme en Listing structuré
});

// Statistiques globales
const stats = await meloSyncService.getGlobalStats();

// Nettoyage
const deleted = await meloSyncService.cleanOldAnnonces(30);
```

### Via API (curl)

```bash
# Synchronisation
curl -X POST http://localhost:3001/api/melo/sync \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "ville": "Paris",
      "minPrix": 200000,
      "maxPrix": 500000,
      "typeBien": "appartement"
    },
    "limit": 50
  }'

# Statistiques
curl http://localhost:3001/api/melo/sync

# Nettoyage
curl -X POST http://localhost:3001/api/melo/sync/clean \
  -H "Content-Type: application/json" \
  -d '{"daysToKeep": 30}'
```

## 🔄 Flux de synchronisation

```
1. Récupération depuis Melo.io
   ↓
2. Filtrage des doublons (par URL)
   ↓
3. Sauvegarde en AnnonceScrape
   ↓
4. (Optionnel) Transformation en Listing
   ↓
5. Calcul des statistiques
   ↓
6. Retour du résultat
```

## 📊 Détection des doublons

Le service détecte les doublons en vérifiant :
- **URL unique** : Si l'URL existe déjà dans `AnnonceScrape`, c'est un doublon

## 🔀 Transformation en Listing

Si `transformToListing: true`, le service :
1. Vérifie si le `Listing` existe déjà (par URL)
2. Crée un nouveau `Listing` avec :
   - Type déterminé automatiquement depuis le titre
   - Source : `LEBONCOIN` (car Melo.io récupère depuis LeBonCoin)
   - Toutes les données de l'annonce

## 🧹 Nettoyage

Le nettoyage supprime les annonces de plus de X jours (défaut: 30 jours) basé sur `createdAt`.

## ⚙️ Options de synchronisation

```typescript
interface SyncOptions {
  filters?: {
    ville?: string;
    minPrix?: number;
    maxPrix?: number;
    typeBien?: 'appartement' | 'maison' | 'immeuble' | 'parking' | 'bureau' | 'terrain' | 'commerce';
    pieces?: number;
    chambres?: number;
    transactionType?: 'vente' | 'location';
  };
  limit?: number; // Nombre max d'annonces (défaut: 100)
  transformToListing?: boolean; // Transformer en Listing (défaut: false)
}
```

## 📈 Statistiques calculées

### Par synchronisation
- Prix moyen des nouvelles annonces
- Surface moyenne des nouvelles annonces
- Liste des nouvelles villes

### Globales
- Total d'annonces en base
- Annonces ajoutées aujourd'hui
- Prix moyen global
- Surface moyenne globale
- Top 5 des villes

## 🔐 Sécurité

- ✅ Utilise le client Prisma singleton (pas de nouvelle instance)
- ✅ Gestion des erreurs robuste
- ✅ Logs détaillés pour le debugging
- ✅ Validation des données avant sauvegarde

## 🚀 Prochaines étapes

### Améliorations possibles

1. **Synchronisation programmée**
   - Cron job pour synchroniser automatiquement
   - Webhook Melo.io (si disponible)

2. **Détection intelligente**
   - Détection de changements de prix
   - Alertes sur nouvelles annonces intéressantes

3. **Enrichissement**
   - Géocodage automatique (lat/lng)
   - Extraction d'informations supplémentaires

4. **Performance**
   - Traitement par batch
   - Cache des résultats

---

**✅ Le service de synchronisation est prêt à être utilisé !**

