# 📋 Structure complète du projet SACIMO

## 1. 📊 Schéma Prisma - Modèles pour les annonces

### Modèle principal : `AnnonceScrape`
```prisma
model AnnonceScrape {
  id            String   @id @default(cuid())
  title         String
  price         Int
  surface       Int?
  rooms         Int?
  postalCode    String?
  city          String
  url           String   @unique
  publishedAt   DateTime
  images        String[]
  description   String?
  source        String   @default("LEBONCOIN")  // Peut être "MELO" ou "LEBONCOIN"
  isNew         Boolean  @default(true)
  lastScrapedAt DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("annonce_scrapes")
}
```

### Modèle secondaire : `Listing` (pour les annonces structurées)
```prisma
model Listing {
  id              String        @id @default(cuid())
  source          ListingSource  // LEBONCOIN, SELOGER, PAP, etc.
  isPrivateSeller Boolean
  title           String
  price           Int
  type            ListingType   // APARTMENT, HOUSE, STUDIO, etc.
  surface         Int?
  rooms           Int?
  photos          String[]      @default([])
  city            String
  postalCode      String
  geo             Json?
  publishedAt     DateTime
  url             String
  description     String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  competitorId    String?
  competitor      Competitor?   @relation(fields: [competitorId], references: [id])
  tags            Tag[]         @relation("ListingToTag")

  @@map("listings")
}
```

### Enums associés
```prisma
enum ListingType {
  APARTMENT
  HOUSE
  STUDIO
  LOFT
  PENTHOUSE
  VILLA
  TOWNHOUSE
  OTHER
}

enum ListingSource {
  LEBONCOIN
  SELOGER
  PAP
  ORPI
  CENTURY21
  GUY_HOQUET
  IMMONOT
  OTHER
}
```

---

## 2. 📁 Structure des dossiers

### `src/app/` - Pages et routes

```
src/app/
├── api/                          # Routes API Next.js
│   ├── annonces/
│   │   ├── route.ts             # GET /api/annonces (recherche Melo.io)
│   │   ├── all/
│   │   │   └── route.ts         # GET /api/annonces/all (toutes les annonces)
│   │   └── list/
│   │       └── route.ts         # GET /api/annonces/list (depuis DB)
│   ├── scraper/
│   │   └── melo/
│   │       └── route.ts         # POST /api/scraper/melo (scraping + sauvegarde)
│   ├── melo/
│   │   └── test/
│   │       └── route.ts         # GET /api/melo/test (test configuration)
│   ├── health/
│   │   └── route.ts             # GET /api/health
│   └── auth/                    # Authentification NextAuth
│
├── app/                          # Application principale (protégée)
│   ├── dashboard/
│   │   └── page.tsx             # Dashboard principal
│   ├── annonces/
│   │   └── page.tsx             # Page "Nouvelles Annonces" ⭐
│   ├── listings/
│   │   └── page.tsx             # Liste des annonces
│   ├── recherches/
│   │   └── page.tsx             # Gestion des recherches
│   ├── rapports/
│   │   └── page.tsx             # Rapports quotidiens
│   └── settings/
│       └── page.tsx             # Paramètres
│
└── auth/                         # Pages d'authentification
    ├── signin/
    └── signup/
```

### `src/lib/` - Services et utilitaires

```
src/lib/
├── services/
│   ├── melo.ts                  # Service Melo.io (recherche d'annonces)
│   ├── smart-scraper.ts        # Scraper intelligent
│   └── pdf-generator.ts        # Génération de PDF
│
├── scrapers/                    # Scrapers pour différents sites
│   ├── leboncoin.ts
│   ├── leboncoin-zenrows.ts
│   └── leboncoin-optimized.ts
│
├── source-connectors/           # Connecteurs de sources
│   ├── leboncoin-connector.ts
│   ├── scraping-service.ts
│   └── types.ts
│
├── prisma.ts                    # Client Prisma
├── auth.ts                      # Configuration NextAuth
└── utils.ts                     # Utilitaires généraux
```

### `src/components/` - Composants React

```
src/components/
├── ListingCard.tsx              # Carte d'annonce (grid/list) ⭐
├── ModernDashboard.tsx          # Dashboard moderne
├── DashboardSidebar.tsx         # Sidebar du dashboard
├── filters/
│   └── AdvancedFilters.tsx     # Filtres avancés
└── ui/                          # Composants shadcn/ui
    ├── card.tsx
    ├── button.tsx
    └── ...
```

---

## 3. 🎨 Composant "Nouvelles Annonces"

### Fichier : `src/app/app/annonces/page.tsx`

**Fonctionnalités principales :**

1. **Chargement des données**
   - Depuis `/api/annonces/list` (base de données)
   - Filtres avancés (ville, prix, surface, pièces, etc.)
   - Tri et pagination

2. **Affichage**
   - Mode grille (`grid`) ou liste (`list`)
   - Utilise le composant `ListingCard` pour chaque annonce
   - Statistiques (prix moyen, min, max, par ville)

3. **Filtres**
   - Recherche texte
   - Filtres avancés (prix, surface, pièces, type de vendeur)
   - Tri par prix ou date de publication

4. **Actions**
   - Sauvegarder une annonce
   - Analyser une annonce
   - Estimer le prix
   - Localiser sur une carte

### Interface `Listing` utilisée :

```typescript
interface Listing {
  title: string;
  price: number;
  surface?: number;
  rooms?: number;
  city: string;
  postalCode: string;
  type: string;
  source: string;
  url: string;
  publishedAt: string;
  isPrivateSeller: boolean;
  description?: string;
  photos: string[];
}
```

### Composant `ListingCard`

**Fichier :** `src/components/ListingCard.tsx`

**Fonctionnalités :**
- Affichage en mode **grid** (carte) ou **list** (liste)
- Photo principale (avec fallback vers placeholder)
- Badge d'estimation (Opportunité, Bon prix, Surévalué)
- Score de localisation (étoiles)
- Actions : Localiser, Estimer, Analyser, Coordonnées, Sauvegarder
- Dialog pour afficher les coordonnées du vendeur

---

## 4. 🔌 Endpoints API existants

### Endpoints Melo.io

#### 1. `GET /api/annonces`
**Description :** Recherche d'annonces via l'API Melo.io

**Paramètres :**
- `ville` : Ville de recherche
- `type` : Type de bien (`appartement`, `maison`, etc.)
- `budget` : Budget maximum
- `surface` : Surface minimale
- `chambres` : Nombre de chambres
- `pieces` : Nombre de pièces
- `transactionType` : `vente` ou `location`
- `itemsPerPage` : Nombre de résultats (défaut: 50)

**Réponse :**
```json
{
  "success": true,
  "total": 5,
  "annonces": [
    {
      "id": "...",
      "titre": "...",
      "prix": 500000,
      "ville": "Paris",
      "codePostal": "75015",
      "surface": 75,
      "pieces": 3,
      "type": "Appartement",
      "url": "...",
      "datePublication": "..."
    }
  ]
}
```

#### 2. `GET /api/annonces/all`
**Description :** Récupère toutes les annonces sans filtre (debug)

**Paramètres :**
- `itemsPerPage` : Nombre de résultats (défaut: 100)

**Réponse :**
```json
{
  "status": "success",
  "total": 30,
  "annonces": [...],
  "stats": {
    "villes": [...],
    "types": [...],
    "prix": {...},
    "surface": {...}
  }
}
```

#### 3. `GET /api/annonces/list`
**Description :** Récupère les annonces depuis la base de données avec filtres

**Paramètres :**
- `search` : Recherche texte
- `cities[]` : Array de villes
- `types[]` : Array de types
- `minPrice` / `maxPrice` : Prix min/max
- `minSurface` / `maxSurface` : Surface min/max
- `rooms` : Nombre de pièces
- `sellerType` : `private` ou `professional`
- `dateFrom` : Date ISO
- `sortBy` : `price` ou `publishedAt`
- `sortOrder` : `asc` ou `desc`
- `page` : Numéro de page
- `limit` : Nombre de résultats par page

**Réponse :**
```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 100,
    "pages": 1
  },
  "stats": {
    "total": 100,
    "avgPrice": 365784,
    "minPrice": 127479,
    "maxPrice": 667000,
    "cities": [...],
    "sellers": {
      "private": 100,
      "professional": 0
    }
  }
}
```

#### 4. `POST /api/scraper/melo`
**Description :** Scrape les annonces via Melo.io et les sauvegarde en base

**Body :**
```json
{
  "ville": "Paris",
  "typeBien": "appartement",
  "minPrix": 200000,
  "maxPrix": 500000,
  "pieces": 2,
  "transactionType": "vente",
  "itemsPerPage": 50
}
```

**Réponse :**
```json
{
  "status": "success",
  "count": 45,
  "saved": 30,
  "updated": 10,
  "skipped": 5,
  "source": "melo.io"
}
```

#### 5. `GET /api/melo/test`
**Description :** Test de configuration et connexion à l'API Melo.io

**Réponse :**
```json
{
  "timestamp": "...",
  "config": {
    "hasApiKey": true,
    "environment": "production",
    "baseUrl": "https://api.notif.immo"
  },
  "tests": [
    {
      "name": "Configuration API Key",
      "status": "success",
      "message": "MELO_API_KEY configurée"
    },
    {
      "name": "Configuration Environment",
      "status": "success",
      "message": "Environnement: production"
    },
    {
      "name": "Test de connexion API",
      "status": "success",
      "message": "Connexion réussie - 5 annonces récupérées"
    }
  ],
  "summary": {
    "total": 3,
    "success": 3,
    "errors": 0,
    "overall": "success"
  }
}
```

#### 6. `GET /api/health`
**Description :** État de l'API et configuration

**Réponse :**
```json
{
  "status": "success",
  "message": "SACIMO API is working!",
  "hasMeloApiKey": true,
  "meloEnvironment": "production",
  "endpoints": {
    "health": "/api/health",
    "meloTest": "/api/melo/test",
    "annonces": "/api/annonces",
    "annoncesAll": "/api/annonces/all",
    "scraperMelo": "/api/scraper/melo"
  }
}
```

---

## 5. 🔄 Flux de données

### Scraping et sauvegarde

```
1. Utilisateur lance le scraping
   ↓
2. POST /api/scraper/melo
   ↓
3. meloService.searchAnnonces() → API Melo.io
   ↓
4. Conversion format Melo → Format interne
   ↓
5. Sauvegarde en base (AnnonceScrape)
   - Si URL existe → UPDATE
   - Sinon → CREATE
   ↓
6. Retour : { saved, updated, skipped }
```

### Affichage des annonces

```
1. Page /app/annonces charge
   ↓
2. GET /api/annonces/list?filters...
   ↓
3. Prisma query sur AnnonceScrape
   ↓
4. Filtres appliqués (prix, surface, ville, etc.)
   ↓
5. Tri et pagination
   ↓
6. Retour JSON avec data + stats
   ↓
7. Affichage avec ListingCard
```

---

## 6. 📝 Notes importantes

### Différence entre `Listing` et `AnnonceScrape`

- **`Listing`** : Modèle structuré avec relations (competitor, tags) - pour les annonces analysées
- **`AnnonceScrape`** : Modèle simple pour le scraping brut - utilisé actuellement pour Melo.io

### Source des données

- **Melo.io** : Via `/api/annonces` → API externe
- **Base de données** : Via `/api/annonces/list` → Table `AnnonceScrape`
- **Scraping** : Via `/api/scraper/melo` → API Melo.io + sauvegarde DB

### Mapping des types

Le service Melo.io convertit automatiquement :
- `appartement` → PropertyType 0
- `maison` → PropertyType 1
- etc.

Mais le modèle `AnnonceScrape` ne stocke pas le type (à ajouter si nécessaire).

---

**📌 Cette structure est prête pour l'intégration complète de l'API Melo.io !**

