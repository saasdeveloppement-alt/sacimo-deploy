# 🎯 Guide d'utilisation de l'estimation DVF avec Supabase

## ✅ Vérifications effectuées

### 1. Services mis à jour
- ✅ `src/lib/services/dvf-supabase.ts` : Logs de debug ajoutés
- ✅ `src/lib/services/estimation-api.ts` : Utilise Supabase DVF en priorité
- ✅ Filtrage sur **12 derniers mois** (au lieu de 2 ans)
- ✅ Logs détaillés à chaque étape

### 2. Critères de recherche
L'estimation recherche des transactions avec :
- **Même code postal** (strict)
- **Surface ±20%** (ex: 65m² → recherche 52-78m²)
- **Même nombre de pièces ±1** (ex: 3 pièces → recherche 2-4 pièces)
- **12 derniers mois** uniquement
- **Même type** (Appartement ou Maison)

### 3. Calcul de l'estimation
1. Récupération des transactions DVF depuis Supabase
2. Calcul des statistiques (médiane, quartiles, moyenne)
3. Application des ajustements (état, équipements, etc.)
4. Calcul de la confiance (minimum 60%)

## 🧪 Test de l'estimation

### Commande pour tester

```bash
cd sacimo
npm run test:estimation
```

Cette commande va :
1. ✅ Vérifier la connexion Supabase
2. ✅ Tester la récupération de transactions pour 75008, 65m², 3 pièces
3. ✅ Calculer une estimation complète
4. ✅ Afficher les statistiques départementales

### Test manuel via l'API

1. Démarrer le serveur :
```bash
cd sacimo
npm run dev
```

2. Tester l'endpoint `/api/estimation` :
```bash
curl -X POST http://localhost:3000/api/estimation \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Paris",
    "postalCode": "75008",
    "surface": 65,
    "rooms": 3,
    "type": "Appartement"
  }'
```

3. Vérifier les logs dans la console du serveur :
   - `🔍 [DVF Supabase]` : Connexion et requêtes
   - `🌐 [ESTIMATION]` : Calculs d'estimation
   - `📊 [ESTIMATION]` : Statistiques

## 📊 Logs de debug

Les logs suivants apparaîtront dans la console :

### Connexion Supabase
```
🔍 [DVF Supabase] Vérification de la configuration...
✅ [DVF Supabase] Configuration OK
🔌 [DVF Supabase] Connexion à Supabase...
✅ [DVF Supabase] Connexion réussie
```

### Recherche de transactions
```
📊 [DVF Supabase] Paramètres de recherche: { postalCode, type, surfaceMin, surfaceMax, ... }
🔍 [DVF Supabase] Construction de la requête SQL...
🚀 [DVF Supabase] Exécution de la requête...
✅ [DVF Supabase] X transaction(s) trouvée(s)
```

### Calcul d'estimation
```
🌐 [ESTIMATION] Démarrage estimation via API publique
📋 Paramètres: { city, postalCode, surface, rooms, type }
📊 [ESTIMATION] X transaction(s) récupérée(s)
📈 [ESTIMATION] Étape 2: Calcul des statistiques...
💰 [ESTIMATION] Prix estimés (avant ajustements)
🔧 [ESTIMATION] Étape 3: Application des ajustements...
✅ [ESTIMATION] Estimation terminée avec succès
```

## 🔧 Configuration requise

### Variables d'environnement (.env.local)

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Vérification

Si les variables ne sont pas définies, vous verrez :
```
❌ [DVF Supabase] Supabase non configuré
   → Fallback activé vers données agrégées statiques
```

## 📈 Résultat de l'estimation

L'estimation retourne :
- **priceMedian** : Prix médian estimé
- **priceLow** : Fourchette basse (Q1)
- **priceHigh** : Fourchette haute (Q3)
- **pricePerSqmMedian** : Prix au m² médian
- **sampleSize** : Nombre de transactions utilisées
- **confidence** : Niveau de confiance (60-90%)
- **strategy** : "supabase_dvf" si données réelles utilisées
- **comparables** : Liste des transactions de référence
- **adjustments** : Ajustements appliqués (état, équipements, etc.)

## 🐛 Dépannage

### "Aucune transaction trouvée"
- Vérifiez que les données DVF sont bien importées dans Supabase
- Vérifiez les critères de recherche (code postal, surface, pièces)
- Vérifiez que les dates sont dans les 12 derniers mois

### "Supabase non configuré"
- Vérifiez `.env.local` contient `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`
- Redémarrez le serveur après modification de `.env.local`

### "Erreur lors de la requête"
- Vérifiez que la table `dvf_transactions` existe dans Supabase
- Vérifiez que les colonnes correspondent au schéma SQL
- Vérifiez les permissions du service role key

## ✅ Checklist de vérification

- [ ] Variables d'environnement configurées dans `.env.local`
- [ ] Table `dvf_transactions` créée dans Supabase
- [ ] Données DVF importées (au moins quelques transactions)
- [ ] Script de test exécuté avec succès : `npm run test:estimation`
- [ ] Logs de debug visibles dans la console
- [ ] Estimation retourne des résultats avec `strategy: "supabase_dvf"`

## 🎉 C'est prêt !

Votre système d'estimation utilise maintenant les **vraies données DVF** depuis Supabase en production, avec un fallback gracieux si Supabase n'est pas disponible.

