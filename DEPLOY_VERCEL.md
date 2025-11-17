# 🚀 Déploiement Vercel - Guide Rapide

## ✅ Checklist avant déploiement

### 1. Variables d'environnement requises

Assurez-vous d'avoir ces variables dans Vercel :

#### 🔴 OBLIGATOIRES
```bash
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
NEXTAUTH_SECRET=votre-secret-jwt-fort
NEXTAUTH_URL=https://votre-projet.vercel.app
MELO_API_KEY=votre-cle-api-melo
MELO_ENV=production
MELO_BASE_URL=https://api.notif.immo
```

#### 🟡 OPTIONNELLES
```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
EMAIL_SERVER_HOST=...
EMAIL_SERVER_PASSWORD=...
```

### 2. Commandes de déploiement

#### Option A : Via Vercel Dashboard (Recommandé)

1. **Connectez-vous à [Vercel](https://vercel.com)**
2. **Cliquez sur "Add New Project"**
3. **Importez votre repo GitHub/GitLab**
4. **Configuration automatique** :
   - Framework: Next.js (détecté automatiquement)
   - Root Directory: `sacimo` (si votre repo est à la racine)
   - Build Command: `npm run build` (défini dans vercel.json)
   - Output Directory: `.next`

5. **Ajoutez les variables d'environnement** (voir section 1)

6. **Cliquez sur "Deploy"**

#### Option B : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer (première fois)
cd sacimo
vercel

# Déployer en production
vercel --prod
```

### 3. Après le déploiement

#### Exécuter les migrations Prisma

```bash
# Via Vercel CLI
vercel link
npx prisma migrate deploy

# OU via votre machine locale (avec DATABASE_URL de production)
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
```

#### Vérifier le déploiement

1. **Page d'accueil** : `https://votre-projet.vercel.app`
2. **API Health** : `https://votre-projet.vercel.app/api/health`
3. **API Estimation** : `https://votre-projet.vercel.app/api/estimation` (POST)

### 4. Configuration importante

#### vercel.json
✅ Déjà configuré avec :
- Build command: `npm run build`
- Max duration API: 30s
- Region: `cdg1` (Paris)

#### package.json
✅ Script `postinstall` : `prisma generate` (exécuté automatiquement)

### 5. Erreurs courantes

#### ❌ "Prisma Client not generated"
**Solution** : Le script `postinstall` génère automatiquement le client Prisma

#### ❌ "DATABASE_URL is not set"
**Solution** : Vérifiez que la variable est bien dans Vercel → Settings → Environment Variables

#### ❌ "MELO_API_KEY is not configured"
**Solution** : Ajoutez `MELO_API_KEY` et `MELO_ENV=production` dans Vercel

#### ❌ "Function timeout"
**Solution** : Les fonctions ont un timeout de 30s (configuré dans vercel.json)

### 6. Monitoring

- **Logs** : Vercel Dashboard → Deployments → [Votre déploiement] → Logs
- **Analytics** : Vercel Dashboard → Analytics
- **Functions** : Vercel Dashboard → Functions

---

## 🎯 Déploiement rapide (1 commande)

Si vous avez déjà configuré Vercel :

```bash
cd sacimo
vercel --prod
```

---

## 📝 Notes

- Les variables d'environnement sont injectées au **build time**
- Redéployez après avoir modifié les variables d'environnement
- Le déploiement est automatique à chaque push sur `main`/`master`

---

**🎉 Prêt à déployer !**

