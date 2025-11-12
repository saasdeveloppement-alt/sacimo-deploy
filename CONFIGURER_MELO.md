# 🔑 Configuration de la clé API Melo.io

## Méthode 1 : Script automatique (Recommandé)

### Étape 1 : Exécuter le script

```bash
npm run setup:melo [VOTRE_CLE_API] [production|preprod]
```

**Exemple avec clé de production :**
```bash
npm run setup:melo votre-cle-api-ici production
```

**Exemple avec clé de preprod (sandbox) :**
```bash
npm run setup:melo votre-cle-api-ici preprod
```

Le script va :
- ✅ Créer ou mettre à jour `.env.local`
- ✅ Configurer `MELO_API_KEY`
- ✅ Configurer `MELO_ENV` (production ou preprod)

### Étape 2 : Vérifier la configuration

```bash
npm run check:melo
```

### Étape 3 : Tester localement

```bash
npm run dev
# Ouvrir : http://localhost:3000/api/melo/test
```

## Méthode 2 : Configuration manuelle

### Étape 1 : Créer le fichier .env.local

```bash
cp env.example .env.local
```

### Étape 2 : Éditer .env.local

Ouvrez `.env.local` et modifiez :

```bash
# Clé API Melo.io (production)
MELO_API_KEY="votre-cle-api-ici"

# Environnement : 'preprod' (sandbox) ou 'production'
MELO_ENV="production"
```

## 🔐 Configuration Vercel (Production)

Une fois la clé configurée localement, vous devez aussi la configurer dans Vercel :

### Étape 1 : Accéder aux variables d'environnement

1. Allez sur [Vercel Dashboard](https://vercel.com)
2. Sélectionnez votre projet
3. **Settings** → **Environment Variables**

### Étape 2 : Ajouter les variables

Cliquez sur **"Add New"** et ajoutez :

**Variable 1 :**
- **Key** : `MELO_API_KEY`
- **Value** : `votre-cle-api-ici`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

**Variable 2 :**
- **Key** : `MELO_ENV`
- **Value** : `production`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

### Étape 3 : Redéployer

Après avoir ajouté les variables, Vercel redéploiera automatiquement, ou vous pouvez :

1. Allez dans **Deployments**
2. Cliquez sur **"Redeploy"** sur le dernier déploiement

## ✅ Vérification finale

### Test local
```bash
curl http://localhost:3000/api/melo/test
```

### Test en production
```bash
curl https://votre-projet.vercel.app/api/melo/test
```

## 🔒 Sécurité

- ✅ `.env.local` est dans `.gitignore` (ne sera pas commité)
- ✅ Ne partagez jamais votre clé API publiquement
- ✅ Utilisez des clés différentes pour preprod et production
- ✅ Régénérez la clé si elle est compromise

## 🆘 Dépannage

### ❌ "MELO_API_KEY non configurée"
→ Vérifiez que `.env.local` existe et contient `MELO_API_KEY`

### ❌ "Erreur 401"
→ Vérifiez que votre clé API est correcte et valide

### ❌ Les variables ne sont pas prises en compte
→ Redémarrez le serveur de développement (`npm run dev`)

---

**💡 Astuce** : Utilisez `npm run setup:melo` pour une configuration automatique !

