# 🧪 Tests API Melo.io

## ✅ Tests réussis

L'API Melo.io est maintenant fonctionnelle ! Voici comment tester les différents endpoints :

## 1. Test de configuration
```bash
curl http://localhost:3000/api/melo/test
```

## 2. Recherche d'annonces avec filtres
```bash
# Recherche d'appartements à Paris, budget max 500k
curl "http://localhost:3000/api/annonces?ville=Paris&type=appartement&budget=500000"

# Recherche de maisons à Lyon, 4 pièces minimum
curl "http://localhost:3000/api/annonces?ville=Lyon&type=maison&pieces=4"

# Recherche avec plusieurs critères
curl "http://localhost:3000/api/annonces?ville=Paris&type=appartement&budget=300000&surface=50&pieces=2&transactionType=vente"
```

## 3. Toutes les annonces (debug)
```bash
curl http://localhost:3000/api/annonces/all
```

## 4. Scraping et sauvegarde en base
```bash
curl -X POST http://localhost:3000/api/scraper/melo \
  -H "Content-Type: application/json" \
  -d '{
    "ville": "Paris",
    "typeBien": "appartement",
    "minPrix": 200000,
    "maxPrix": 500000,
    "pieces": 2,
    "transactionType": "vente",
    "itemsPerPage": 50
  }'
```

## 📊 Paramètres disponibles

### Paramètres de recherche (`/api/annonces`)

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `ville` | string | Ville de recherche | `Paris`, `Lyon`, `Marseille` |
| `type` | string | Type de bien | `appartement`, `maison`, `immeuble`, `parking`, `bureau`, `terrain`, `commerce` |
| `budget` | number | Budget maximum | `500000` |
| `surface` | number | Surface minimale (m²) | `50` |
| `chambres` | number | Nombre de chambres minimum | `2` |
| `pieces` | number | Nombre de pièces minimum | `3` |
| `transactionType` | string | Type de transaction | `vente` ou `location` |
| `itemsPerPage` | number | Nombre de résultats | `50` (défaut) |

### Villes supportées

Le mapping automatique fonctionne pour :
- Paris (75)
- Lyon (69)
- Marseille (13)
- Bordeaux (33)
- Toulouse (31)
- Nice (06)
- Nantes (44)
- Lille (59)
- Strasbourg (67)
- Montpellier (34)
- Rennes (35)
- Reims (51)
- Saint-Étienne (42)
- Toulon (83)
- Le Havre (76)
- Grenoble (38)
- Dijon (21)
- Angers (49)
- Villeurbanne (69)
- Saint-Denis (93)
- Nîmes (30)
- Aix-en-Provence (13)

## 🚀 Tests en production (après déploiement Vercel)

Remplacez `localhost:3000` par votre URL Vercel :

```bash
# Test de configuration
curl https://votre-projet.vercel.app/api/melo/test

# Recherche d'annonces
curl "https://votre-projet.vercel.app/api/annonces?ville=Paris&type=appartement&budget=500000"
```

## ✅ Checklist de test

- [x] Test de configuration (`/api/melo/test`)
- [ ] Recherche simple (ville seule)
- [ ] Recherche avec filtres (prix, surface, pièces)
- [ ] Recherche par type de bien
- [ ] Scraping et sauvegarde en base
- [ ] Test avec différentes villes
- [ ] Test en production (Vercel)

---

**🎉 L'API Melo.io est opérationnelle !**

