# 🧪 Guide de test des endpoints API Melo.io

## Serveur de développement

Le serveur est lancé avec :
```bash
npm run dev
```

Le serveur démarre sur : `http://localhost:3000`

## 📋 Endpoints à tester

### 1. ✅ Health Check
```bash
curl http://localhost:3000/api/health
```

**Résultat attendu :**
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

### 2. ✅ Test de configuration Melo.io
```bash
curl http://localhost:3000/api/melo/test
```

**Résultat attendu :**
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
      "message": "Connexion réussie - X annonces récupérées"
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

### 3. ✅ Recherche d'annonces avec filtres
```bash
# Recherche simple - Paris, appartement, budget 500k
curl "http://localhost:3000/api/annonces?ville=Paris&type=appartement&budget=500000"

# Recherche avec plusieurs critères
curl "http://localhost:3000/api/annonces?ville=Paris&type=appartement&budget=500000&pieces=2&surface=50&transactionType=vente"

# Recherche de maisons à Lyon
curl "http://localhost:3000/api/annonces?ville=Lyon&type=maison&budget=800000&pieces=4"
```

**Résultat attendu :**
```json
{
  "success": true,
  "total": 5,
  "annonces": [
    {
      "id": "...",
      "titre": "...",
      "prix": 450000,
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

### 4. ✅ Toutes les annonces (debug)
```bash
curl "http://localhost:3000/api/annonces/all?itemsPerPage=10"
```

**Résultat attendu :**
```json
{
  "status": "success",
  "total": 10,
  "annonces": [...],
  "stats": {
    "villes": [...],
    "types": [...],
    "prix": {...},
    "surface": {...},
    "pieces": {...}
  }
}
```

### 5. ✅ Scraping et sauvegarde en base
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
    "itemsPerPage": 10
  }'
```

**Résultat attendu :**
```json
{
  "status": "success",
  "count": 10,
  "saved": 8,
  "updated": 2,
  "skipped": 0,
  "source": "melo.io"
}
```

## 🔍 Tests dans le navigateur

Vous pouvez aussi tester directement dans votre navigateur :

1. **Health Check** : http://localhost:3000/api/health
2. **Test Melo.io** : http://localhost:3000/api/melo/test
3. **Recherche** : http://localhost:3000/api/annonces?ville=Paris&type=appartement&budget=500000

## 📊 Paramètres de recherche disponibles

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

## ✅ Checklist de test

- [ ] Health check fonctionne
- [ ] Test de configuration Melo.io réussi
- [ ] Recherche simple fonctionne
- [ ] Recherche avec filtres fonctionne
- [ ] Récupération de toutes les annonces fonctionne
- [ ] Scraping et sauvegarde fonctionne
- [ ] Gestion des erreurs fonctionne (test avec clé invalide)

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Nettoyer le cache
rm -rf .next

# Redémarrer
npm run dev
```

### Erreur "MELO_API_KEY non configurée"
```bash
# Vérifier que .env.local existe
cat .env.local | grep MELO_API_KEY

# Si absent, recréer
npm run setup:melo VOTRE_CLE production
```

### Erreur "Access Denied"
- Vérifiez que votre clé API est valide
- Vérifiez que MELO_ENV correspond à votre clé (production/preprod)

---

**🎉 Bon test !**

