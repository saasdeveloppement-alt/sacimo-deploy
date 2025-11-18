# 🏠 Estimation en local - Guide de fonctionnement

## ✅ Oui, ça fonctionne en local !

Le système est conçu pour fonctionner **même sans Supabase configuré** grâce à des fallbacks intelligents.

## 🔄 Système de fallback

### Priorité 1 : Prix au m² réel DVF (Supabase)

Si `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont configurés :
- ✅ Récupère le prix au m² réel depuis Supabase DVF
- ✅ Utilise les transactions DVF des 12 derniers mois
- ✅ Calcule la moyenne et les percentiles

**Si Supabase n'est pas configuré** → Passe automatiquement au fallback suivant

### Priorité 2 : Comparables locaux (base de données)

Si Supabase n'est pas disponible :
- ✅ Utilise les annonces de votre base de données locale (`annonceScrape`)
- ✅ Recherche des comparables similaires (même code postal, surface, pièces)
- ✅ Calcule la médiane et les quartiles
- ✅ Applique les ajustements

**Si pas assez de comparables** → Passe au fallback suivant

### Priorité 3 : Estimation départementale

Si pas assez de comparables locaux :
- ✅ Utilise la moyenne départementale de votre base
- ✅ Calcule un prix au m² moyen du département
- ✅ Applique les ajustements
- ✅ Confiance minimale : 60%

## 🧪 Test en local

### Option 1 : Sans Supabase (fallback automatique)

```bash
# Pas besoin de configurer Supabase
npm run dev
```

Le système utilisera automatiquement :
- Les comparables de votre base de données locale
- Ou l'estimation départementale si pas assez de données

### Option 2 : Avec Supabase (données réelles)

```bash
# Ajouter dans .env.local
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-key"

npm run dev
```

Le système utilisera :
- Les transactions DVF réelles depuis Supabase
- Plus précis et fiable

## 📊 Ce qui s'affiche

### Avec Supabase configuré :
- Badge : **"SACIMO"**
- Source : **"SACIMO (DVF)"**
- Stratégie : **"dvf_market_price"**
- Description : "Estimation SACIMO basée sur les transactions DVF réelles"

### Sans Supabase (fallback) :
- Badge : **"Strict"** ou **"Code postal"** ou **"Département"**
- Source : **"Base DVF"**
- Stratégie : **"strict_postal"** ou autre
- Description : "Médiane : X €/m²"

## ✅ Vérification

Pour tester que tout fonctionne en local :

```bash
# Tester l'estimation
npm run test:estimation
```

Ou via l'interface :
1. Aller sur `/app/estimation`
2. Remplir le formulaire
3. Cliquer sur "Estimer"

Le système affichera dans les logs :
- `⚠️ Prix au m² réel non disponible, utilisation des comparables locaux...` (si pas de Supabase)
- `✅ Prix au m² réel du marché trouvé (estimation SACIMO):` (si Supabase configuré)

## 🎯 Conclusion

**Oui, ça fonctionne parfaitement en local !**

- ✅ Sans Supabase : Utilise les comparables locaux
- ✅ Avec Supabase : Utilise les données DVF réelles
- ✅ Fallback automatique et transparent
- ✅ Ajustements appliqués dans tous les cas

---

**Le système est prêt pour le développement local !** 🚀

