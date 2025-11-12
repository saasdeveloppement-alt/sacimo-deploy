# 🚀 Guide de déploiement API Melo.io

Ce guide vous accompagne pour déployer et configurer l'intégration API Melo.io dans SACIMO.

## 📋 Vue d'ensemble

L'API Melo.io est déjà intégrée dans le projet avec :
- ✅ Service `MeloService` (`src/lib/services/melo.ts`)
- ✅ Endpoints API Next.js
- ✅ Sauvegarde automatique en base de données
- ✅ Gestion des erreurs et logs

## 🔍 Endpoints disponibles

### 1. `/api/annonces` (GET)
Recherche d'annonces avec filtres

**Paramètres de requête :**
- `ville` : Ville de recherche (ex: "Paris")
- `type` : Type de bien (`appartement`, `maison`, etc.)
- `budget` : Budget maximum
- `surface` : Surface minimale
- `chambres` : Nombre de chambres minimum
- `pieces` : Nombre de pièces minimum
- `transactionType` : `vente` ou `location`
- `itemsPerPage` : Nombre de résultats (défaut: 50)

**Exemple :**
```bash
GET /api/annonces?ville=Paris&type=appartement&budget=500000&pieces=2
```

### 2. `/api/annonces/all` (GET)
Récupère toutes les annonces sans filtre (mode debug)

**Exemple :**
```bash
GET /api/annonces/all
```

### 3. `/api/scraper/melo` (POST)
Scrape les annonces et les sauvegarde en base de données

**Body JSON :**
```json
{
  "ville": "Paris",
  "typeBien": "appartement",
  "minPrix": 200000,
  "maxPrix": 500000,
  "minSurface": 50,
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

## ⚙️ Configuration requise

### Variables d'environnement

#### 🔴 OBLIGATOIRES

```bash
# Clé API Melo.io (obtenue depuis https://melo.io)
MELO_API_KEY=votre-cle-api-melo-io

# Environnement : 'preprod' (sandbox) ou 'production'
MELO_ENV=preprod
```

#### 🟡 OPTIONNELLES (mais recommandées)

```bash
# Base de données PostgreSQL (pour sauvegarder les annonces)
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
```

## 🚀 Déploiement sur Vercel

### Étape 1 : Préparer les variables d'environnement

1. **Obtenir une clé API Melo.io**
   - Connectez-vous à [Melo.io](https://melo.io)
   - Accédez à votre dashboard
   - Créez ou récupérez votre clé API
   - Notez si c'est une clé sandbox (preprod) ou production

2. **Configurer dans Vercel**
   - Allez dans votre projet Vercel
   - **Settings** → **Environment Variables**
   - Ajoutez les variables suivantes :

```bash
MELO_API_KEY=votre-cle-api-melo-io
MELO_ENV=preprod  # ou 'production' en prod
```

⚠️ **Important** : Cochez **Production**, **Preview**, et **Development** pour chaque variable.

### Étape 2 : Vérifier la configuration

1. **Vérifier `vercel.json`**
   - Le fichier doit contenir la configuration des fonctions API
   - Timeout configuré à 30s (suffisant pour les requêtes Melo.io)

2. **Vérifier `package.json`**
   - Le script `postinstall` doit inclure `prisma generate`
   - Les dépendances sont à jour

### Étape 3 : Déployer

1. **Push vers GitHub**
   ```bash
   git add .
   git commit -m "feat: configuration API Melo.io"
   git push origin main
   ```

2. **Vercel déploie automatiquement**
   - Vercel détecte le push
   - Build automatique
   - Déploiement en production

### Étape 4 : Tester le déploiement

1. **Test de santé**
   ```bash
   curl https://votre-projet.vercel.app/api/health
   ```

2. **Test API Melo.io (sans filtre)**
   ```bash
   curl https://votre-projet.vercel.app/api/annonces/all
   ```

3. **Test API Melo.io (avec filtres)**
   ```bash
   curl "https://votre-projet.vercel.app/api/annonces?ville=Paris&type=appartement&budget=500000"
   ```

## 🧪 Tests locaux avant déploiement

### 1. Configurer `.env.local`

```bash
cp env.example .env.local
```

Éditez `.env.local` :
```bash
MELO_API_KEY=votre-cle-api-melo-io
MELO_ENV=preprod
DATABASE_URL=postgresql://user:password@localhost:5432/sacimo
```

### 2. Tester localement

```bash
# Démarrer le serveur
npm run dev

# Dans un autre terminal, tester l'API
curl http://localhost:3000/api/health
curl http://localhost:3000/api/annonces/all
```

### 3. Vérifier les logs

Les logs de l'API Melo.io sont détaillés :
- ✅ Configuration réussie
- 🔵 Requête API envoyée
- 📡 Réponse reçue
- ✅ Conversion des données
- ❌ Erreurs éventuelles

## 🔧 Configuration avancée

### Mapping des villes

Le service Melo.io inclut un mapping automatique villes → départements pour les villes principales :
- Paris → 75
- Lyon → 69
- Marseille → 13
- Bordeaux → 33
- Toulouse → 31
- Nice → 06
- etc.

Pour ajouter une ville, modifiez `src/lib/services/melo.ts` :
```typescript
private villesToDept: Record<string, string> = {
  'votre-ville': 'code-departement',
  // ...
}
```

### Types de biens supportés

- `appartement` → PropertyType 0
- `maison` → PropertyType 1
- `immeuble` → PropertyType 2
- `parking` → PropertyType 3
- `bureau` → PropertyType 4
- `terrain` → PropertyType 5
- `commerce` → PropertyType 6

### Transaction types

- `vente` → TransactionType 0
- `location` → TransactionType 1

## 🐛 Dépannage

### ❌ Erreur : "MELO_API_KEY non configurée"

**Solution :**
1. Vérifiez que `MELO_API_KEY` est bien définie dans Vercel
2. Vérifiez que la variable est cochée pour l'environnement (Production/Preview/Development)
3. Redéployez après avoir ajouté la variable

### ❌ Erreur : "Melo API error: 401"

**Solution :**
- Vérifiez que votre clé API est valide
- Vérifiez que vous utilisez la bonne clé (preprod vs production)
- Vérifiez que `MELO_ENV` correspond à votre clé

### ❌ Erreur : "Melo API error: 429"

**Solution :**
- Vous avez atteint la limite de requêtes
- Attendez quelques minutes avant de réessayer
- Vérifiez votre plan Melo.io et les limites

### ❌ Erreur : "Melo API error: 500"

**Solution :**
- Erreur côté serveur Melo.io
- Vérifiez le statut de l'API Melo.io
- Contactez le support Melo.io si le problème persiste

### ⚠️ Aucune annonce retournée

**Causes possibles :**
1. Aucune annonce ne correspond aux critères
2. Les paramètres sont trop restrictifs
3. Problème de mapping ville → département

**Solution :**
- Testez sans filtres : `/api/annonces/all`
- Vérifiez les logs pour voir la requête envoyée
- Essayez avec une ville connue (Paris, Lyon, etc.)

## 📊 Monitoring

### Logs Vercel

Les logs sont disponibles dans Vercel :
1. Allez dans votre projet
2. **Deployments** → Cliquez sur un déploiement
3. **Functions** → Cliquez sur une fonction API
4. Consultez les logs en temps réel

### Métriques à surveiller

- ✅ Taux de succès des requêtes
- ⏱️ Temps de réponse
- 📊 Nombre d'annonces récupérées
- 💾 Taux de sauvegarde en base

## 🔐 Sécurité

### Bonnes pratiques

- ✅ Ne jamais commiter `MELO_API_KEY` dans Git
- ✅ Utiliser des variables d'environnement
- ✅ Utiliser `preprod` pour les tests
- ✅ Limiter l'accès aux endpoints de scraping
- ✅ Implémenter un rate limiting si nécessaire

### Rate limiting (optionnel)

Pour limiter les appels API, vous pouvez ajouter un middleware :

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Implémenter votre logique de rate limiting
  // ...
}
```

## 📈 Prochaines étapes

### Améliorations possibles

1. **Cache des résultats**
   - Mettre en cache les résultats pour éviter les appels répétés
   - Utiliser Redis ou Vercel KV

2. **Pagination**
   - Implémenter la pagination pour les grandes listes
   - Utiliser les paramètres `page` et `itemsPerPage`

3. **Webhooks**
   - Configurer des webhooks Melo.io pour les nouvelles annonces
   - Mise à jour automatique sans polling

4. **Notifications**
   - Envoyer des notifications quand de nouvelles annonces sont trouvées
   - Intégration email/SMS

## 📚 Ressources

- [Documentation Melo.io](https://docs.melo.io)
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## ✅ Checklist de déploiement

- [ ] Clé API Melo.io obtenue
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Tests locaux réussis
- [ ] Code poussé sur GitHub
- [ ] Déploiement Vercel réussi
- [ ] Tests de production réussis
- [ ] Logs vérifiés
- [ ] Documentation à jour

---

**🎉 Félicitations ! Votre API Melo.io est maintenant déployée !**


