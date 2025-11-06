# 🚀 Guide de déploiement SACIMO sur Vercel

Ce guide vous explique comment déployer l'application SACIMO sur Vercel.

## 📋 Prérequis

- Un compte [Vercel](https://vercel.com) (gratuit)
- Un compte [Melo.io](https://melo.io) avec une clé API (sandbox ou production)
- Une base de données PostgreSQL (Vercel Postgres, Supabase, Neon, etc.)
- Un compte GitHub/GitLab/Bitbucket (pour le déploiement automatique)

## 🔧 Étape 1 : Préparation du code

### 1.1 Vérifier les fichiers

Assurez-vous que ces fichiers sont présents :
- ✅ `vercel.json` - Configuration Vercel
- ✅ `.env.example` - Template des variables d'environnement
- ✅ `package.json` - Scripts de build configurés
- ✅ `prisma/schema.prisma` - Schéma de base de données

### 1.2 Commiter et pousser le code

```bash
# Vérifier que tous les fichiers sont commités
git status

# Ajouter les nouveaux fichiers
git add vercel.json .env.example DEPLOYMENT.md
git add .gitignore package.json

# Commiter
git commit -m "feat: préparation déploiement Vercel"

# Pousser vers votre dépôt
git push origin main
```

## 🌐 Étape 2 : Configuration Vercel

### 2.1 Créer un nouveau projet

1. Connectez-vous à [Vercel](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Importez votre dépôt GitHub/GitLab/Bitbucket
4. Sélectionnez le dépôt contenant SACIMO

### 2.2 Configuration du projet

Vercel détectera automatiquement Next.js. Vérifiez que :
- **Framework Preset**: Next.js
- **Root Directory**: `sacimo` (si votre repo contient plusieurs projets)
- **Build Command**: `npm run build` (défini dans `vercel.json`)
- **Output Directory**: `.next` (par défaut pour Next.js)
- **Install Command**: `npm install` (défini dans `vercel.json`)

### 2.3 Variables d'environnement

Cliquez sur **"Environment Variables"** et ajoutez les variables suivantes :

#### 🔴 OBLIGATOIRES

```bash
# Base de données PostgreSQL
DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# NextAuth
NEXTAUTH_SECRET=votre-secret-jwt-generate-avec-openssl-rand-base64-32
NEXTAUTH_URL=https://votre-projet.vercel.app

# Melo.io API
MELO_API_KEY=votre-cle-api-melo-io
MELO_ENV=preprod
```

#### 🟡 OPTIONNELLES (selon vos besoins)

```bash
# Google OAuth (si vous utilisez la connexion Google)
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret

# Email (si vous utilisez l'envoi d'emails)
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=votre-sendgrid-api-key
EMAIL_FROM=noreply@votre-domaine.com
```

**⚠️ IMPORTANT** :
- Pour `NEXTAUTH_URL`, utilisez l'URL de production fournie par Vercel
- Pour `NEXTAUTH_SECRET`, générez un secret sécurisé avec :
  ```bash
  openssl rand -base64 32
  ```
- Cochez **"Production"**, **"Preview"**, et **"Development"** pour chaque variable

### 2.4 Base de données

#### Option A : Vercel Postgres (Recommandé)

1. Dans votre projet Vercel, allez dans l'onglet **"Storage"**
2. Cliquez sur **"Create Database"** → **"Postgres"**
3. Créez une nouvelle base de données
4. Vercel créera automatiquement la variable `DATABASE_URL`
5. Copiez cette variable dans les **Environment Variables**

#### Option B : Base externe (Supabase, Neon, etc.)

1. Créez une base de données PostgreSQL sur votre fournisseur
2. Récupérez l'URL de connexion (format: `postgresql://user:password@host:port/database`)
3. Ajoutez-la comme variable `DATABASE_URL` dans Vercel

### 2.5 Déployer

1. Cliquez sur **"Deploy"**
2. Vercel va :
   - Installer les dépendances (`npm install`)
   - Générer le client Prisma (`prisma generate` via `postinstall`)
   - Builder l'application (`npm run build`)
   - Déployer l'application

## 🗄️ Étape 3 : Configuration de la base de données

### 3.1 Migrations Prisma

Une fois le déploiement réussi, vous devez exécuter les migrations :

#### Option A : Via Vercel CLI (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link

# Exécuter les migrations
npx prisma migrate deploy
```

#### Option B : Via script de migration

Créez un script de migration dans Vercel :

1. Allez dans **"Settings"** → **"Functions"**
2. Créez une fonction de migration ou utilisez un endpoint API

#### Option C : Via votre machine locale

```bash
# Configurer DATABASE_URL pour pointer vers la base de production
export DATABASE_URL="postgresql://user:password@host:port/database"

# Exécuter les migrations
npx prisma migrate deploy

# (Optionnel) Seed la base de données
npm run db:seed
```

### 3.2 Vérifier la connexion

Une fois les migrations exécutées, vérifiez que la base de données fonctionne :

1. Visitez `https://votre-projet.vercel.app/api/health`
2. Vérifiez les logs Vercel pour d'éventuelles erreurs

## ✅ Étape 4 : Vérification du déploiement

### 4.1 Tests de base

1. **Page d'accueil** : `https://votre-projet.vercel.app`
2. **API Health** : `https://votre-projet.vercel.app/api/health`
3. **API Annonces** : `https://votre-projet.vercel.app/api/annonces/all`

### 4.2 Vérifier les logs

1. Dans Vercel, allez dans l'onglet **"Deployments"**
2. Cliquez sur le dernier déploiement
3. Vérifiez les **"Build Logs"** et **"Function Logs"**

### 4.3 Erreurs courantes

#### ❌ Erreur : "Prisma Client not generated"

**Solution** : Vérifiez que le script `postinstall` est présent dans `package.json` :
```json
"postinstall": "prisma generate"
```

#### ❌ Erreur : "DATABASE_URL is not set"

**Solution** : Vérifiez que la variable `DATABASE_URL` est bien configurée dans Vercel avec les bons environnements (Production, Preview, Development).

#### ❌ Erreur : "MELO_API_KEY is not configured"

**Solution** : Vérifiez que `MELO_API_KEY` et `MELO_ENV` sont bien configurées dans Vercel.

#### ❌ Erreur : "NEXTAUTH_URL mismatch"

**Solution** : Assurez-vous que `NEXTAUTH_URL` correspond exactement à l'URL de votre déploiement Vercel (avec `https://`).

## 🔄 Étape 5 : Déploiement continu

Vercel déploie automatiquement à chaque push sur votre branche principale :

1. **Production** : Déploiement automatique sur `main`/`master`
2. **Preview** : Déploiement automatique sur les autres branches et PRs

### 5.1 Domaine personnalisé (Optionnel)

1. Allez dans **"Settings"** → **"Domains"**
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions pour configurer les DNS

## 📊 Étape 6 : Monitoring et optimisation

### 6.1 Analytics Vercel

Vercel fournit des analytics intégrés :
- **"Analytics"** : Métriques de performance
- **"Speed Insights"** : Core Web Vitals
- **"Logs"** : Logs en temps réel

### 6.2 Optimisations

- ✅ **Edge Functions** : Pour les API routes rapides
- ✅ **Image Optimization** : Next.js optimise automatiquement les images
- ✅ **Caching** : Vercel gère automatiquement le cache

## 🔐 Sécurité

### Checklist de sécurité

- ✅ Toutes les variables sensibles sont dans Vercel (pas dans le code)
- ✅ `NEXTAUTH_SECRET` est un secret fort et unique
- ✅ `DATABASE_URL` utilise SSL (`?sslmode=require`)
- ✅ Les secrets ne sont pas commités dans Git
- ✅ `.env.local` est dans `.gitignore`

## 🆘 Support

### Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Melo.io](https://docs.melo.io)

### En cas de problème

1. Vérifiez les logs Vercel
2. Vérifiez les variables d'environnement
3. Testez localement avec les mêmes variables
4. Consultez la documentation Vercel

## 📝 Notes importantes

- **Build Timeout** : Vercel a un timeout de 45 minutes pour les builds
- **Function Timeout** : Les fonctions serverless ont un timeout de 10s (hobby) ou 60s (pro)
- **Database Connections** : Utilisez un pool de connexions pour Prisma en production
- **Environment Variables** : Les variables sont injectées au build time, redéployez après modification

---

**🎉 Félicitations ! Votre application SACIMO est maintenant déployée sur Vercel !**

