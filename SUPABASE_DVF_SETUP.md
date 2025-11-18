# 🚀 Guide d'installation Supabase DVF pour SACIMO

Ce guide vous explique comment configurer Supabase pour utiliser les données DVF réelles dans votre outil d'estimation immobilière.

## 📋 Prérequis

1. Un compte Supabase (gratuit) : [https://supabase.com](https://supabase.com)
2. Un projet Supabase créé
3. Les fichiers SQL fournis dans `prisma/migrations/`

## 🔧 Étapes d'installation

### 1. Créer le schéma dans Supabase

1. Ouvrez votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu de `prisma/migrations/dvf_schema.sql`
4. Cliquez sur **Run** pour exécuter le script
5. Vérifiez que les tables sont créées :
   - `dvf_transactions`
   - `dvf_import_logs`
   - Les vues `dvf_statistics` et `dvf_by_department`

### 2. Créer la fonction PostGIS (optionnel, pour recherche par rayon)

Si vous voulez utiliser la recherche géographique par rayon :

1. Dans le **SQL Editor**, exécutez la fonction SQL fournie dans `src/lib/services/dvf-supabase.ts` :
   ```sql
   -- Copier POSTGIS_FUNCTION_SQL depuis dvf-supabase.ts
   ```

2. Ou utilisez directement cette fonction :
   ```sql
   CREATE OR REPLACE FUNCTION find_dvf_within_radius(...)
   ```

### 3. Installer le package Supabase (si pas déjà installé)

```bash
cd sacimo
npm install @supabase/supabase-js
```

### 4. Configurer les variables d'environnement

1. Copiez `env.example` vers `.env.local` :
   ```bash
   cp env.example .env.local
   ```

2. Ajoutez vos credentials Supabase dans `.env.local` :
   ```env
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

3. **Où trouver ces valeurs ?**
   - `SUPABASE_URL` : Dans votre dashboard Supabase → Settings → API → Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` : Dans Settings → API → service_role key (⚠️ gardez-la secrète !)

### 5. Importer les données DVF

Vous avez plusieurs options pour importer les données :

#### Option A : Import CSV via Supabase Dashboard

1. Téléchargez les fichiers DVF depuis [data.gouv.fr](https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/)
2. Dans Supabase → Table Editor → `dvf_transactions`
3. Cliquez sur **Import** et sélectionnez votre fichier CSV
4. Mappez les colonnes du CSV vers les colonnes de la table

#### Option B : Script d'import automatisé (à créer)

Créez un endpoint API dans Next.js qui :
- Télécharge les fichiers DVF depuis data.gouv.fr
- Parse les données CSV
- Insère dans Supabase via le client

Exemple de structure :
```typescript
// src/app/api/dvf/import/route.ts
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Logique d'import...
}
```

#### Option C : Import via SQL direct

Si vous avez déjà les données en format SQL :
1. Exécutez-les dans le SQL Editor de Supabase

## ✅ Vérification

### Tester la connexion

1. Créez un endpoint de test :
   ```typescript
   // src/app/api/test-dvf/route.ts
   import { fetchDVFTransactions } from '@/lib/services/dvf-supabase'
   
   export async function GET() {
     const data = await fetchDVFTransactions(
       '33000', // Bordeaux
       'Appartement',
       50, // surface min
       80, // surface max
       2, // rooms min
       4, // rooms max
     )
     return Response.json({ count: data.length, data })
   }
   ```

2. Appelez l'endpoint : `GET /api/test-dvf`
3. Vérifiez que des données sont retournées

### Vérifier les statistiques

Dans Supabase SQL Editor :
```sql
SELECT * FROM dvf_statistics;
SELECT * FROM dvf_by_department LIMIT 10;
```

## 🎯 Utilisation dans l'estimation

Une fois configuré, le service d'estimation utilisera automatiquement Supabase :

1. **Priorité 1** : Données DVF réelles depuis Supabase
2. **Priorité 2** : API DVF Etalab (si disponible)
3. **Priorité 3** : Données agrégées statiques (fallback)

Le système détecte automatiquement si Supabase est configuré et l'utilise en priorité.

## 📊 Structure des données DVF

Les données DVF contiennent :
- **id_mutation** : Identifiant unique de la transaction
- **date_mutation** : Date de la vente
- **valeur_fonciere** : Prix de vente en euros
- **code_postal**, **code_commune**, **nom_commune** : Localisation
- **latitude**, **longitude** : Coordonnées GPS
- **surface_reelle_bati** : Surface habitable en m²
- **nombre_pieces_principales** : Nombre de pièces
- **type_local** : Type de bien (Appartement, Maison, etc.)
- **prix_au_m2** : Prix au m² (calculé automatiquement)

## 🔒 Sécurité

- ⚠️ **Ne commitez JAMAIS** votre `SUPABASE_SERVICE_ROLE_KEY` dans Git
- Utilisez les variables d'environnement Vercel pour la production
- Le service role key a tous les droits, gardez-la privée

## 🐛 Dépannage

### "Supabase non configuré"
→ Vérifiez que `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont bien définis dans `.env.local`

### "Aucune transaction trouvée"
→ Vérifiez que les données DVF ont bien été importées dans `dvf_transactions`

### "Erreur PostGIS"
→ Vérifiez que l'extension PostGIS est activée dans Supabase (déjà inclus par défaut)

### Requêtes lentes
→ Vérifiez que les index sont bien créés : `\d+ dvf_transactions` dans psql

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Données DVF sur data.gouv.fr](https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/)
- [Exemples de requêtes SQL](prisma/migrations/dvf_example_queries.sql)

## 🎉 C'est prêt !

Une fois configuré, votre outil d'estimation utilisera automatiquement les données DVF réelles en production via Supabase, avec un fallback gracieux si Supabase n'est pas disponible.

