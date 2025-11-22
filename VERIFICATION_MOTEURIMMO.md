# ✅ Vérification de la connexion MoteurImmo

## 🔗 Chaîne complète de connexion

### 1. **Page Frontend** → `/app/annonces/page.tsx`
```typescript
// Ligne 70-78
const response = await fetch("/api/piges/fetch", {
  method: "POST",
  body: JSON.stringify({
    filters: cleanFilters, // { city, postalCode, type, minPrice, maxPrice, etc. }
  }),
})
```
✅ **Appelle bien** : `POST /api/piges/fetch`

---

### 2. **Route API** → `/app/api/piges/fetch/route.ts`
```typescript
// Ligne 9-10
import { runPigeSearch } from "@/services/piges/pigesService";
import type { PigeSearchFilters } from "@/services/piges/pigesService";

// Ligne 45
const result = await runPigeSearch(filters, session.user.id);
```
✅ **Appelle bien** : `runPigeSearch()` du service Piges
❌ **Aucune référence Melo** : Vérifié (0 occurrence)

---

### 3. **Service Piges** → `/services/piges/pigesService.ts`
```typescript
// Ligne 6
import { moteurImmoSearch } from "@/lib/providers/moteurimmoClient";

// Ligne 93
const response = await moteurImmoSearch({
  ...filters,
  page,
  pageSize: 50,
});
```
✅ **Appelle bien** : `moteurImmoSearch()` du client MoteurImmo
❌ **Aucune référence Melo** : Vérifié (0 occurrence)

---

### 4. **Client MoteurImmo** → `/lib/providers/moteurimmoClient.ts`
```typescript
// Ligne 6
const MOTEURIMMO_API_KEY = process.env.MOTEURIMMO_API_KEY;
const BASE_URL = "https://moteurimmo.fr/api";

// Ligne 86-95
const response = await fetch(
  `${BASE_URL}/search?${queryParams.toString()}`,
  {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${MOTEURIMMO_API_KEY}`,
      "Content-Type": "application/json",
    },
  }
);
```
✅ **Appelle bien** : `https://moteurimmo.fr/api/search`
✅ **Clé API configurée** : `MOTEURIMMO_API_KEY` présente dans `.env.local`

---

## 📊 Schéma de flux

```
┌─────────────────────────────────────┐
│  /app/annonces/page.tsx            │
│  (Frontend React)                  │
│                                     │
│  handleSearch()                    │
│    ↓                                │
│  fetch("/api/piges/fetch", {...})  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  /api/piges/fetch/route.ts          │
│  (Next.js API Route)                │
│                                     │
│  POST handler                       │
│    ↓                                │
│  runPigeSearch(filters, userId)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  /services/piges/pigesService.ts   │
│  (Service d'orchestration)          │
│                                     │
│  runPigeSearch()                   │
│    ↓                                │
│  moteurImmoSearch({...})            │
│    ↓                                │
│  normalizeMoteurImmoListings()      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  /lib/providers/moteurimmoClient.ts │
│  (Client API MoteurImmo)             │
│                                     │
│  moteurImmoSearch()                 │
│    ↓                                │
│  fetch("https://moteurimmo.fr/api/  │
│        search?city=Paris&...")      │
│    Headers:                         │
│      Authorization: Bearer {KEY}   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  API MoteurImmo (Externe)           │
│  https://moteurimmo.fr/api/search   │
│                                     │
│  Retourne:                          │
│  {                                  │
│    results: [...],                  │
│    total: 150,                      │
│    hasMore: true                    │
│  }                                  │
└─────────────────────────────────────┘
```

---

## ✅ Vérifications effectuées

### 1. **Chaîne de connexion**
- ✅ Page frontend → Route API `/api/piges/fetch`
- ✅ Route API → Service `runPigeSearch()`
- ✅ Service → Client `moteurImmoSearch()`
- ✅ Client → API externe `https://moteurimmo.fr/api/search`

### 2. **Aucune référence Melo.io**
- ✅ `/app/annonces/page.tsx` : 0 référence Melo
- ✅ `/api/piges/fetch/route.ts` : 0 référence Melo
- ✅ `/services/piges/pigesService.ts` : 0 référence Melo
- ✅ `/lib/providers/moteurimmoClient.ts` : 0 référence Melo

### 3. **Configuration**
- ✅ `MOTEURIMMO_API_KEY` présente dans `.env.local`
- ✅ Base URL : `https://moteurimmo.fr/api`
- ✅ Endpoint : `/search`

### 4. **Sécurités actives**
- ✅ Validation ville OU code postal obligatoire
- ✅ Throttling 10 scans/heure par utilisateur
- ✅ Max 150 résultats
- ✅ Max 3 pages
- ✅ Max 50 résultats par page

---

## 🧪 Test de connexion

Pour tester que l'API MoteurImmo est bien connectée :

1. **Ouvrir** `/app/annonces`
2. **Remplir les filtres** :
   - Ville : "Paris"
   - Type : "Vente"
3. **Cliquer** sur "Lancer la recherche"
4. **Vérifier dans la console navigateur** (F12 → Network) :
   - Requête `POST /api/piges/fetch` doit apparaître
   - Réponse doit contenir `status: "ok"` et `data: [...]`
5. **Vérifier dans les logs serveur** :
   - `🔍 [Piges] Démarrage recherche MoteurImmo pour utilisateur...`
   - `📄 [Piges] Récupération page 1...`
   - `✅ [Piges] Page 1: X résultats`

---

## ⚠️ Si l'API ne répond pas

### Erreur : "MOTEURIMMO_API_KEY non configurée"
**Solution** : Ajouter dans `.env.local` :
```bash
MOTEURIMMO_API_KEY=votre_clé_api_moteurimmo
```

### Erreur : "Erreur MoteurImmo API (401)"
**Solution** : Vérifier que la clé API est valide et active

### Erreur : "Erreur MoteurImmo API (404)"
**Solution** : Vérifier que l'URL de base est correcte :
- Actuelle : `https://moteurimmo.fr/api`
- Endpoint : `/search`

---

## 📝 Résumé

✅ **La page `/app/annonces` est bien connectée à l'API MoteurImmo**

**Flux complet** :
1. Utilisateur remplit les filtres → Clic "Lancer la recherche"
2. Frontend → `POST /api/piges/fetch` avec filtres
3. Route API → `runPigeSearch()` avec validation + throttling
4. Service → `moteurImmoSearch()` avec pagination
5. Client → `GET https://moteurimmo.fr/api/search` avec Bearer token
6. API MoteurImmo → Retourne les résultats
7. Normalisation → Conversion en format `NormalizedListing`
8. Frontend → Affichage des résultats dans les cards

**Aucun appel Melo.io** dans cette chaîne ✅



