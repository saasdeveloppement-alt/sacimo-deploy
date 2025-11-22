# 🔧 Fix : Timeout du pool de connexions Prisma sur Vercel

## Problème
Erreur : `Timed out fetching a new connection from the connection pool` (timeout: 10s, limite: 17 connexions)

## Solution

### 1. Optimiser la DATABASE_URL dans Vercel

Dans les **Environment Variables** de Vercel, modifiez votre `DATABASE_URL` pour ajouter des paramètres de pool optimisés :

**Format recommandé pour Vercel :**
```
postgresql://user:password@host:port/database?schema=public&connection_limit=5&pool_timeout=20&connect_timeout=10
```

**Paramètres importants :**
- `connection_limit=5` : Limite le nombre de connexions par instance (recommandé pour serverless)
- `pool_timeout=20` : Augmente le timeout du pool à 20 secondes
- `connect_timeout=10` : Timeout de connexion initial

### 2. Pour Vercel Postgres

Si vous utilisez Vercel Postgres, la `DATABASE_URL` est générée automatiquement. Vous pouvez l'optimiser en ajoutant les paramètres :

1. Allez dans **Vercel Dashboard** → **Storage** → Votre base de données
2. Cliquez sur **.env.local** pour voir la `DATABASE_URL`
3. Copiez-la et ajoutez les paramètres de pool :
   ```
   DATABASE_URL="votre-url-vercel-postgres?connection_limit=5&pool_timeout=20&connect_timeout=10"
   ```
4. Mettez à jour la variable dans **Settings** → **Environment Variables**

### 3. Pour Supabase / Neon / Autres

Ajoutez les mêmes paramètres à votre URL de connexion existante.

### 4. Redéployer

Après avoir modifié la `DATABASE_URL`, redéployez l'application :
```bash
npx vercel --prod
```

## Modifications apportées au code

1. ✅ Optimisation de `src/lib/prisma.ts` pour Vercel
2. ✅ Utilisation de `upsert` au lieu de `findUnique + create/update` pour réduire les requêtes
3. ✅ Augmentation du `maxDuration` à 60s dans `vercel.json`

## Vérification

Après le redéploiement, testez la localisation d'image. L'erreur de timeout ne devrait plus apparaître.




