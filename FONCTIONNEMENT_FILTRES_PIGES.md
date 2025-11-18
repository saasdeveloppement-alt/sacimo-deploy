# 🔍 Fonctionnement des Filtres - Page "Piges"

## 📁 Fichiers concernés

1. **Page principale** : `src/app/app/annonces/page.tsx` (c'est la page "Piges")
2. **Composant de filtres** : `src/components/filters/AdvancedFilters.tsx`
3. **Hook de gestion** : `src/hooks/useAdvancedFilters.ts`
4. **Endpoint API** : `src/app/api/annonces/list/route.ts`

---

## 1. 🎯 Structure de la page Piges

### Fichier : `src/app/app/annonces/page.tsx`

**État des filtres :**
```typescript
const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersType>(initialFilters)
```

**Fonction de chargement des données :**
```typescript
const loadScrapingData = async () => {
  // Construit les paramètres depuis advancedFilters
  const params = new URLSearchParams()
  
  // Filtres avancés
  if (advancedFilters.cities.length > 0) {
    advancedFilters.cities.forEach(city => params.append('cities', city))
  }
  if (advancedFilters.types.length > 0) {
    advancedFilters.types.forEach(type => params.append('types', type))
  }
  if (advancedFilters.minPrice) params.append('minPrice', advancedFilters.minPrice)
  if (advancedFilters.maxPrice) params.append('maxPrice', advancedFilters.maxPrice)
  // ... etc
  
  // Appelle l'endpoint
  const response = await fetch(`/api/annonces/list?${params.toString()}`)
  // ...
}
```

**Rechargement automatique :**
```typescript
useEffect(() => {
  loadScrapingData()
}, [advancedFilters, sortBy, sortOrder, searchTerm, agencyFromUrl])
```

⚠️ **Important** : Les filtres se rechargent automatiquement quand `advancedFilters` change !

---

## 2. 🎨 Composant de filtres avancés

### Fichier : `src/components/filters/AdvancedFilters.tsx`

**Gestion de l'état :**
```typescript
const [filters, setFilters] = useState<AdvancedFilters>(
  propsInitialFilters || initialFilters
)
```

**Fonction "Appliquer" :**
```typescript
const handleApply = () => {
  onFilterChange(filters)  // ← Appelle la fonction passée en prop
}
```

**Bouton "Appliquer" :**
```tsx
<Button
  size="sm"
  onClick={handleApply}  // ← Ligne 574
  className="bg-gradient-to-r from-purple-600 to-blue-600..."
>
  <Check className="h-4 w-4 mr-2" />
  Appliquer les filtres
</Button>
```

**Fonction "Réinitialiser" :**
```typescript
const handleReset = () => {
  const resetFilters = initialFilters
  setFilters(resetFilters)
  onFilterChange(resetFilters)  // ← Applique immédiatement
}
```

---

## 3. 🔄 Flux de données

### Quand on clique sur "Appliquer les filtres" :

```
1. Utilisateur clique sur "Appliquer"
   ↓
2. handleApply() est appelé
   ↓
3. onFilterChange(filters) est appelé
   ↓
4. setAdvancedFilters(filters) dans page.tsx
   ↓
5. useEffect détecte le changement de advancedFilters
   ↓
6. loadScrapingData() est appelé automatiquement
   ↓
7. GET /api/annonces/list?cities=75016&types=APARTMENT&...
   ↓
8. Les annonces filtrées s'affichent
```

### Champs de filtres disponibles :

| Champ | Type | Exemple | Paramètre API |
|-------|------|---------|---------------|
| **Villes** | `string[]` | `["Paris", "75016"]` | `cities[]` |
| **Types** | `string[]` | `["APARTMENT", "HOUSE"]` | `types[]` |
| **Prix min** | `string` | `"200000"` | `minPrice` |
| **Prix max** | `string` | `"500000"` | `maxPrice` |
| **Surface min** | `string` | `"50"` | `minSurface` |
| **Surface max** | `string` | `"100"` | `maxSurface` |
| **Pièces** | `string` | `"3"` | `rooms` |
| **Type vendeur** | `string` | `"private"` | `sellerType` |
| **Date** | `string` | `"2025-01-01"` | `dateFrom` |

---

## 4. 🌐 Endpoint API appelé

### Endpoint : `GET /api/annonces/list`

**Fichier** : `src/app/api/annonces/list/route.ts`

**Paramètres supportés :**
- `cities[]` : Array de villes ou codes postaux
- `types[]` : Array de types de biens
- `minPrice` / `maxPrice` : Prix min/max
- `minSurface` / `maxSurface` : Surface min/max
- `rooms` : Nombre de pièces
- `sellerType` : `private` | `professional`
- `dateFrom` : Date ISO
- `sortBy` : `price` | `publishedAt`
- `sortOrder` : `asc` | `desc`
- `page` : Numéro de page
- `limit` : Nombre de résultats

**Exemple d'appel :**
```
GET /api/annonces/list?cities=75016&types=APARTMENT&minPrice=200000&maxPrice=500000&limit=100
```

**Réponse :**
```json
{
  "status": "success",
  "data": [...],
  "pagination": {...},
  "stats": {...}
}
```

---

## 5. 🐛 Problème actuel

### Pourquoi les filtres ne retournent rien ?

**Problème identifié :**
- Les annonces en base ont `city: ""` (vide)
- Le filtre `cities=75016` cherche dans le champ `city` ou `postalCode`
- Mais les données synchronisées n'ont pas ces champs remplis

**Solution :**
1. ✅ Correction de la conversion Melo.io (extraction de `property.city.name` et `property.city.zipcode`)
2. ✅ Ajout du filtrage par code postal dans l'endpoint
3. ⏳ **Nécessite une resynchronisation** pour avoir les vraies données

---

## 6. 🔧 Comment ça fonctionne actuellement

### Dans `AdvancedFilters.tsx` :

```typescript
// Quand on change un filtre
const handleFilterChange = (key: keyof AdvancedFilters, value: any) => {
  const newFilters = { ...filters, [key]: value }
  setFilters(newFilters)  // Met à jour l'état local
  // ⚠️ Ne déclenche PAS automatiquement la recherche
}

// Quand on clique sur "Appliquer"
const handleApply = () => {
  onFilterChange(filters)  // ← C'est ici que ça se passe !
}
```

### Dans `page.tsx` :

```typescript
// Le composant reçoit la fonction de callback
<AdvancedFilters
  onFilterChange={setAdvancedFilters}  // ← Passe setAdvancedFilters
  initialFilters={advancedFilters}
/>

// Quand setAdvancedFilters est appelé, useEffect se déclenche
useEffect(() => {
  loadScrapingData()  // ← Recharge automatiquement
}, [advancedFilters, ...])
```

---

## 7. 📝 Structure des filtres

### Interface `AdvancedFilters` :

```typescript
interface AdvancedFilters {
  cities: string[];        // ["Paris", "75016", "Lyon"]
  types: string[];         // ["APARTMENT", "HOUSE"]
  minPrice: string;        // "200000"
  maxPrice: string;        // "500000"
  minSurface: string;      // "50"
  maxSurface: string;      // "100"
  rooms: string;           // "3" ou ""
  sellerType: string;      // "all" | "private" | "professional"
  dateFrom: string;         // "2025-01-01" ou ""
}
```

### Valeurs initiales :

```typescript
const initialFilters: AdvancedFilters = {
  cities: [],
  types: [],
  minPrice: '',
  maxPrice: '',
  minSurface: '',
  maxSurface: '',
  rooms: '',
  sellerType: 'all',
  dateFrom: '',
}
```

---

## 8. 🎯 Points importants

### ✅ Ce qui fonctionne :
- Les filtres sont bien gérés avec `useState`
- Le bouton "Appliquer" appelle bien `onFilterChange`
- L'endpoint `/api/annonces/list` est bien appelé
- Les paramètres sont bien passés à l'API

### ❌ Ce qui ne fonctionne pas :
- Les données en base ont `city: ""` → pas de résultats
- Il faut resynchroniser avec la conversion corrigée

### 🔄 Pour tester :
1. Cliquer sur "Synchroniser Melo.io" avec des filtres Paris
2. Attendre la synchronisation
3. Cliquer sur "Actualiser" pour recharger
4. Les annonces avec ville/code postal devraient apparaître

---

## 9. 🚀 Améliorations possibles

### Option 1 : Recherche en temps réel
Actuellement, il faut cliquer sur "Appliquer". On pourrait :
- Déclencher `loadScrapingData()` directement dans `handleFilterChange`
- Ajouter un debounce pour éviter trop de requêtes

### Option 2 : Filtrage côté client
Pour les données déjà chargées :
- Filtrer côté client avant d'appeler l'API
- Appeler l'API seulement pour les nouveaux filtres

### Option 3 : Indicateur de chargement
- Afficher un spinner pendant le chargement
- Désactiver le bouton "Appliquer" pendant le chargement

---

**📌 Résumé : Le système de filtres fonctionne correctement, mais les données en base n'ont pas les villes/codes postaux. Il faut resynchroniser !**








