# 🚀 Déploiement API Melo.io - Guide Rapide

## ✅ Ce qui a été préparé

1. ✅ **Service Melo.io** (`src/lib/services/melo.ts`)
   - Intégration complète avec l'API Melo.io
   - Gestion des erreurs améliorée
   - Mapping automatique villes → départements

2. ✅ **Endpoints API**
   - `/api/annonces` - Recherche avec filtres
   - `/api/annonces/all` - Récupération de toutes les annonces
   - `/api/scraper/melo` - Scraping et sauvegarde en base
   - `/api/melo/test` - **NOUVEAU** : Endpoint de test

3. ✅ **Outils de vérification**
   - Script `check-melo-deployment.ts`
   - Endpoint de test `/api/melo/test`

4. ✅ **Documentation**
   - Guide complet : `DEPLOYMENT_MELO.md`
   - Ce guide rapide

## 🎯 Déploiement en 5 étapes

### Étape 1 : Vérifier localement

```bash
# 1. Configurer les variables d'environnement
cp env.example .env.local
# Éditez .env.local et ajoutez :
# MELO_API_KEY=votre-cle-api
# MELO_ENV=preprod

# 2. Vérifier la configuration
npm run check:melo

# 3. Tester l'API localement
npm run dev
# Puis ouvrez : http://localhost:3000/api/melo/test
```

### Étape 2 : Obtenir votre clé API Melo.io

1. Connectez-vous à [Melo.io](https://melo.io)
2. Accédez à votre dashboard
3. Créez ou récupérez votre clé API
4. Notez si c'est une clé **preprod** (sandbox) ou **production**

### Étape 3 : Configurer Vercel

1. Allez dans votre projet Vercel
2. **Settings** → **Environment Variables**
3. Ajoutez :

```bash
MELO_API_KEY=votre-cle-api-melo-io
MELO_ENV=preprod  # ou 'production' en prod
```

⚠️ **Important** : Cochez **Production**, **Preview**, et **Development**

### Étape 4 : Déployer

```bash
# Commiter et pousser
git add .
git commit -m "feat: déploiement API Melo.io"
git push origin main
```

Vercel déploiera automatiquement !

### Étape 5 : Tester en production

```bash
# Test de santé
curl https://votre-projet.vercel.app/api/health

# Test API Melo.io
curl https://votre-projet.vercel.app/api/melo/test

# Test recherche d'annonces
curl "https://votre-projet.vercel.app/api/annonces?ville=Paris&type=appartement&budget=500000"
```

## 📊 Endpoints disponibles

### 1. Test de configuration
```
GET /api/melo/test
```
Vérifie la configuration et teste la connexion à l'API Melo.io

### 2. Recherche d'annonces
```
GET /api/annonces?ville=Paris&type=appartement&budget=500000
```
Paramètres :
- `ville` : Ville (ex: "Paris")
- `type` : Type de bien (`appartement`, `maison`, etc.)
- `budget` : Budget maximum
- `surface` : Surface minimale
- `chambres` : Nombre de chambres
- `pieces` : Nombre de pièces
- `transactionType` : `vente` ou `location`
- `itemsPerPage` : Nombre de résultats (défaut: 50)

### 3. Toutes les annonces (debug)
```
GET /api/annonces/all
```
Récupère toutes les annonces sans filtre

### 4. Scraping et sauvegarde
```
POST /api/scraper/melo
Content-Type: application/json

{
  "ville": "Paris",
  "typeBien": "appartement",
  "minPrix": 200000,
  "maxPrix": 500000,
  "pieces": 2
}
```

## 🔍 Vérification

### Avant le déploiement
```bash
npm run check:melo
```

### Après le déploiement
1. Visitez : `https://votre-projet.vercel.app/api/melo/test`
2. Vérifiez les logs Vercel
3. Testez une recherche réelle

## 🐛 Problèmes courants

### ❌ "MELO_API_KEY non configurée"
→ Vérifiez que la variable est bien dans Vercel et redéployez

### ❌ "Erreur 401"
→ Vérifiez que votre clé API est valide et que `MELO_ENV` correspond

### ❌ "Erreur 429"
→ Limite de requêtes atteinte, attendez quelques minutes

## 📚 Documentation complète

Pour plus de détails, consultez :
- `DEPLOYMENT_MELO.md` - Guide complet
- [Documentation Melo.io](https://docs.melo.io/introduction)

## ✅ Checklist finale

- [ ] Clé API Melo.io obtenue
- [ ] Variables d'environnement configurées localement
- [ ] Test local réussi (`npm run check:melo`)
- [ ] Variables configurées dans Vercel
- [ ] Code poussé sur GitHub
- [ ] Déploiement Vercel réussi
- [ ] Test en production réussi (`/api/melo/test`)

---

**🎉 Votre API Melo.io est prête à être déployée !**

