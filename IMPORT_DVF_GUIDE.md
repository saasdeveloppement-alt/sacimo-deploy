# 📥 Guide d'import des données DVF réelles

## 🎯 Objectif

Ce script importe les **vraies données DVF** (Demandes de Valeurs Foncières) pour Paris depuis data.gouv.fr dans votre base Supabase.

## 📋 Prérequis

1. ✅ Variables d'environnement configurées dans `.env.local` :
   ```env
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

2. ✅ Table `dvf_transactions` créée dans Supabase (via `prisma/migrations/dvf_schema.sql`)

3. ✅ Dépendances installées :
   ```bash
   npm install
   ```

## 🚀 Utilisation

### Commande simple

```bash
cd sacimo
npm run import:dvf
```

### Ce que fait le script

1. **Télécharge** le fichier CSV gzippé de Paris (75.csv.gz) depuis data.gouv.fr
   - URL : `https://files.data.gouv.fr/geo-dvf/latest/csv/departements/75.csv.gz`
   - Taille : ~50-100 MB (compressé)

2. **Décompresse** le fichier .gz en CSV

3. **Parse et filtre** les données :
   - ✅ Type : Appartement ou Maison uniquement
   - ✅ Prix : Entre 100k€ et 3M€
   - ✅ Surface : Entre 15m² et 200m²
   - ✅ Date : Années 2022-2024 uniquement
   - ✅ Code postal : Valide (5 chiffres)

4. **Insère par batch de 500** dans Supabase avec upsert (évite les doublons)

5. **Affiche les statistiques** :
   - Nombre de lignes traitées
   - Nombre de lignes valides
   - Nombre de lignes insérées
   - Top 10 codes postaux
   - Répartition par type

## 📊 Filtres appliqués

Le script filtre automatiquement :

| Critère | Valeur |
|---------|--------|
| Type local | Appartement ou Maison uniquement |
| Valeur foncière | 100 000€ - 3 000 000€ |
| Surface | 15m² - 200m² |
| Période | 2022-2024 |
| Code postal | Format valide (5 chiffres) |

## ⏱️ Temps d'exécution

- **Téléchargement** : 1-3 minutes (selon la connexion)
- **Décompression** : 10-30 secondes
- **Parsing et import** : 5-15 minutes (selon le nombre de transactions)
- **Total** : ~10-20 minutes pour Paris complet

## 📈 Résultat attendu

Après l'import, vous devriez avoir :
- **Plusieurs milliers** de transactions DVF réelles pour Paris
- Données utilisables immédiatement pour l'estimation
- Statistiques par code postal disponibles

## 🔍 Vérification

### Dans Supabase SQL Editor

```sql
-- Compter les transactions
SELECT COUNT(*) as total 
FROM dvf_transactions 
WHERE code_postal LIKE '75%';

-- Voir les statistiques par code postal
SELECT 
  code_postal,
  COUNT(*) as nb_transactions,
  AVG(valeur_fonciere) as prix_moyen,
  AVG(prix_au_m2) as prix_m2_moyen
FROM dvf_transactions 
WHERE code_postal LIKE '75%'
GROUP BY code_postal
ORDER BY nb_transactions DESC
LIMIT 10;
```

### Via le script de test

```bash
npm run test:estimation
```

Vous devriez voir :
- `✅ [DVF Supabase] X transaction(s) trouvée(s)`
- `strategy: "supabase_dvf"` dans le résultat

## 🐛 Dépannage

### "Erreur HTTP: 404"
→ L'URL du fichier DVF a peut-être changé. Vérifiez sur [data.gouv.fr](https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/)

### "Erreur batch X: duplicate key"
→ Normal, le script utilise `upsert` pour éviter les doublons. Les erreurs sont comptabilisées mais n'empêchent pas l'import.

### "Aucune ligne valide"
→ Vérifiez que les colonnes du CSV correspondent aux noms attendus. Le script gère plusieurs formats.

### Fichier trop volumineux
→ Le script télécharge et traite le fichier en streaming, donc la mémoire n'est pas un problème.

## 📝 Notes importantes

- ⚠️ Le fichier CSV peut faire **plusieurs centaines de MB** une fois décompressé
- ✅ Les fichiers temporaires sont **automatiquement supprimés** à la fin
- ✅ L'import utilise **upsert** pour éviter les doublons (peut être relancé sans problème)
- ✅ Les données sont **filtrées** pour ne garder que les transactions pertinentes

## 🎉 Après l'import

Une fois l'import terminé :

1. ✅ Vérifiez les statistiques affichées
2. ✅ Testez l'estimation : `npm run test:estimation`
3. ✅ Utilisez votre dashboard d'estimation avec les vraies données !

---

**Le script est prêt à être utilisé !** 🚀

