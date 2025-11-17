# 🚀 Déploiement Vercel - SACIMO

## ✅ Étape 1 : Vérifier que le code est poussé sur GitHub

```bash
git status  # Vérifier qu'il n'y a pas de changements non commités
git push origin main  # Pousser les changements
```

## 🔧 Étape 2 : Configurer les variables d'environnement sur Vercel

### Variables OBLIGATOIRES :

1. **DATABASE_URL**
   - Format : `postgresql://user:password@host:port/database?schema=public`
   - Exemple Vercel Postgres : `postgres://default:xxx@xxx.aws.neon.tech:5432/verceldb?sslmode=require`

2. **NEXTAUTH_SECRET**
   - Générer avec : `openssl rand -base64 32`
   - Ou utiliser un générateur en ligne

3. **NEXTAUTH_URL**
   - URL de production : `https://votre-projet.vercel.app`
   - Exemple : `https://sacimo.vercel.app`

4. **MELO_API_KEY** ⚠️ CRITIQUE
   - Clé API Melo.io de production
   - Valeur : `dacf502a15836868441924412554da01` (ou votre clé de production)

5. **MELO_ENV**
   - Valeur : `production` (pour l'API de production)

### Variables OPTIONNELLES :

- `GOOGLE_CLIENT_ID` (si OAuth Google activé)
- `GOOGLE_CLIENT_SECRET` (si OAuth Google activé)
- `EMAIL_*` (si envoi d'emails activé)

## 📋 Comment ajouter les variables sur Vercel :

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet SACIMO
3. Aller dans **Settings** → **Environment Variables**
4. Ajouter chaque variable :
   - **Name** : `DATABASE_URL`
   - **Value** : votre URL de base de données
   - **Environment** : Production, Preview, Development (cocher selon besoin)
5. Répéter pour toutes les variables

## 🔄 Étape 3 : Déclencher le déploiement

### Option A : Déploiement automatique (recommandé)
- Vercel déploie automatiquement à chaque push sur `main`
- Vérifier les déploiements dans l'onglet **Deployments**

### Option B : Déploiement manuel
1. Aller dans **Deployments**
2. Cliquer sur **Redeploy** sur le dernier déploiement
3. Ou utiliser la CLI : `vercel --prod`

## ✅ Étape 4 : Vérifier le déploiement

1. **Build** : Vérifier que le build passe sans erreur
2. **Variables d'environnement** : Vérifier qu'elles sont bien chargées
3. **Base de données** : Vérifier la connexion Prisma
4. **API Melo.io** : Tester l'endpoint `/api/melo/test`

## 🧪 Tests post-déploiement

### Test 1 : API Melo.io
```bash
curl https://votre-projet.vercel.app/api/melo/test
```

### Test 2 : Synchronisation
```bash
curl -X POST https://votre-projet.vercel.app/api/melo/sync \
  -H "Content-Type: application/json" \
  -d '{"filters": {"ville": "Paris (75016)", "typeBien": "appartement"}, "limit": 10}'
```

### Test 3 : Page Piges
- Ouvrir : `https://votre-projet.vercel.app/app/annonces`
- Configurer les filtres : "75016" + "Appartement"
- Cliquer sur "🔄 Actualiser"
- Vérifier que la synchronisation fonctionne

## ⚠️ Problèmes courants

### Erreur : "MELO_API_KEY non définie"
- Vérifier que la variable `MELO_API_KEY` est bien configurée sur Vercel
- Vérifier que `MELO_ENV=production` est configuré

### Erreur : "Database connection failed"
- Vérifier `DATABASE_URL` sur Vercel
- Vérifier que la base de données est accessible depuis Internet
- Pour Vercel Postgres, vérifier les paramètres SSL

### Erreur : "Build failed"
- Vérifier les logs de build dans Vercel
- Vérifier que `prisma generate` s'exécute correctement (script `postinstall`)

## 📊 Monitoring

- **Logs** : Voir les logs en temps réel dans Vercel Dashboard → Deployments → [Dernier déploiement] → Logs
- **Analytics** : Vercel Analytics (si activé)
- **Performance** : Vercel Speed Insights

## 🔐 Sécurité

- ✅ Ne jamais commiter `.env.local` (déjà dans `.gitignore`)
- ✅ Utiliser uniquement les variables d'environnement Vercel pour les secrets
- ✅ Régénérer `NEXTAUTH_SECRET` pour la production
- ✅ Utiliser la clé API Melo.io de **production** uniquement







