# 💰 Comment le système calcule le prix d'estimation

## 📊 Vue d'ensemble

Le système d'estimation utilise une **approche par comparables** avec **ajustements dynamiques** basés sur les caractéristiques du bien.

## 🔍 Étape 1 : Recherche des comparables

### Critères de recherche (par ordre de priorité)

Le système essaie plusieurs **stratégies de recherche** jusqu'à trouver assez de comparables :

1. **Stratégie stricte** (priorité 1) :
   - Code postal exact (ex: 75008)
   - Surface : ±10% (ex: 65m² → recherche 58-72m²)
   - Pièces : ±1 (ex: 3 pièces → recherche 2-4 pièces)
   - Type strict : Appartement ≠ Maison (filtrage strict)
   - Derniers 90 jours

2. **Stratégie modérée** (si < 8 comparables) :
   - Code postal exact
   - Surface : ±20%
   - Pièces : ±2
   - Derniers 180 jours

3. **Stratégie large** (si < 5 comparables) :
   - Département (ex: 75xxx)
   - Surface : ±30%
   - Pièces : ±3
   - Derniers 365 jours

### Filtres supplémentaires

- **Filtrage géographique** : Si `latitude`/`longitude`/`radiusKm` fournis
- **Filtrage textuel** : Équipements (balcon, parking, piscine, etc.) dans `title`/`description`
- **État du bien** : Recherche de mots-clés (neuf, rénové, à rénover, etc.)
- **Étage** : Pour les appartements, recherche du numéro d'étage dans la description

## 📈 Étape 2 : Calcul des statistiques

### 1. Prix au m² pour chaque comparable

```typescript
prixAuM2 = prix / surface
```

### 2. Suppression des outliers (valeurs aberrantes)

- Supprime les **10% les plus bas** et **10% les plus hauts**
- Garde les **80% centraux** pour éviter les erreurs

### 3. Calcul des statistiques

Sur les prix au m² restants :

- **Médiane** (Q2) : Valeur centrale → **Prix de référence**
- **Q1** (quartile inférieur) : 25% des valeurs en dessous → **Fourchette basse**
- **Q3** (quartile supérieur) : 75% des valeurs en dessous → **Fourchette haute**
- **Moyenne** : Moyenne arithmétique

### 4. Prix de base (AVANT ajustements)

```typescript
prixMedianBase = médiane × surface
prixLowBase = Q1 × surface
prixHighBase = Q3 × surface
```

**Exemple** :
- Médiane : 8 000 €/m²
- Surface : 65 m²
- **Prix médian de base** : 8 000 × 65 = **520 000 €**

## 🔧 Étape 3 : Ajustements dynamiques

Le système applique des **multiplicateurs** au prix de base selon les caractéristiques :

### Ajustements par type de bien

| Type | Ajustement | Raison |
|------|------------|--------|
| **Maison** vs Appartements comparables | **+15%** | Les maisons coûtent généralement plus cher au m² |
| **Maison** vs Maisons comparables | **+5%** | Ajustement modéré si comparables similaires |
| **Appartement** vs Maisons comparables | **-15%** | Correction si comparables inadaptés |
| **Appartement** vs Appartements comparables | **0%** | Pas d'ajustement (référence) |

### Ajustements par état du bien

| État | Ajustement | Raison |
|------|------------|--------|
| **Neuf** | **+10%** | Bien neuf = premium |
| **Rénové** | **+5%** | Rénovation récente = valeur ajoutée |
| **Bon état** | **0%** | État standard = pas d'ajustement |
| **À rafraîchir** | **-5%** | Travaux légers nécessaires |
| **À rénover** | **-15%** | Travaux importants = décote |

### Ajustements par équipements

| Équipement | Ajustement | Maximum |
|------------|------------|---------|
| **Piscine** | **+7%** | |
| **Jardin** | **+5%** | |
| **Parking/Garage** | **+3%** | |
| **Terrasse** | **+3%** | |
| **Ascenseur** (appartement) | **+4%** | |
| **Vue** | **+3%** | |
| **Balcon** | **+2%** | |
| **Cheminée** | **+2%** | |
| **Double vitrage** | **+2%** | |
| **Cave/Cellier** | **+2%** | |
| **Grenier/Combles** | **+2%** | |

**Bonus équipements maximum** : +25% (plafonné)

### Ajustements par étage (appartements)

| Étage | Ajustement |
|-------|------------|
| **Rez-de-chaussée** | **-3%** |
| **Étage 1-5** | **+2% par étage** (max +10%) |
| **Étage 6+** | **+10%** (plafonné) |

### Ajustements par nombre de pièces

Si le bien a **plus de pièces** que la moyenne des comparables :
- **+2% par pièce supplémentaire** (max +10%)

Si le bien a **moins de pièces** :
- **-2% par pièce manquante** (max -10%)

### Ajustements par surface

Si la surface est **supérieure à la moyenne** :
- **+1% par 10m² supplémentaires** (max +5%)

Si la surface est **inférieure à la moyenne** :
- **-1% par 10m² manquants** (max -5%)

## 💰 Étape 4 : Calcul du prix final

### Formule

```typescript
facteurAjustement = 1.0 × (ajustementType) × (ajustementÉtat) × (1 + bonusÉquipements) × (ajustementÉtage) × (ajustementPièces) × (ajustementSurface)

prixMedianFinal = prixMedianBase × facteurAjustement
prixLowFinal = prixLowBase × facteurAjustement
prixHighFinal = prixHighBase × facteurAjustement
```

### Exemple complet

**Bien à estimer** :
- Type : Appartement
- Surface : 65 m²
- Pièces : 3
- État : Neuf
- Équipements : Parking, Balcon, Ascenseur
- Étage : 3ème

**Prix de base** : 520 000 € (8 000 €/m² × 65 m²)

**Ajustements** :
1. Type : 0% (appartement vs appartements)
2. État : +10% (neuf)
3. Équipements : +9% (Parking 3% + Balcon 2% + Ascenseur 4%)
4. Étage : +6% (3ème étage)
5. Pièces : 0% (moyenne)
6. Surface : 0% (moyenne)

**Facteur total** : 1.0 × 1.10 × 1.09 × 1.06 = **1.27**

**Prix final** : 520 000 × 1.27 = **660 400 €**

## 📊 Étape 5 : Score de confiance

Le score de confiance (60-90%) dépend de :

### Base selon le nombre de comparables

| Comparables | Confiance de base |
|-------------|-------------------|
| 20+ | 90% |
| 15-19 | 85% |
| 10-14 | 80% |
| 8-9 | 75% |
| 5-7 | 70% |
| 3-4 | 65% |
| 1-2 | 60% |
| 0 | 60% (fallback départemental) |

### Ajustements selon la dispersion

- **Dispersion < 15%** : +10% confiance
- **Dispersion < 25%** : +5% confiance
- **Dispersion > 50%** : -10% confiance
- **Dispersion > 40%** : -5% confiance

### Pénalité selon les ajustements

- **-1% par ajustement appliqué** (max -10%)
- **Minimum garanti** : 60%

## 🎯 Résultat final

Le système retourne :

```typescript
{
  priceMedian: 660400,      // Prix médian estimé
  priceLow: 580000,          // Fourchette basse (Q1)
  priceHigh: 740000,         // Fourchette haute (Q3)
  pricePerSqmMedian: 10160,  // Prix au m² médian
  pricePerSqmAverage: 10200, // Prix au m² moyen
  sampleSize: 15,            // Nombre de comparables utilisés
  confidence: 0.75,          // 75% de confiance
  strategy: "strict_postal", // Stratégie utilisée
  adjustments: [             // Liste des ajustements
    "État Neuf (+10%)",
    "Parking/Garage (+3%)",
    "Balcon (+2%)",
    "Ascenseur (+4%)",
    "Étage 3 (+6%)"
  ],
  comparables: [...]         // Liste des biens comparables
}
```

## 🔄 Fallback si pas assez de comparables

Si **< 1 comparable** trouvé :

1. Calculer la **moyenne départementale** (ex: 75xxx)
2. Utiliser le **prix au m² moyen du département**
3. Appliquer les ajustements de base (type, état, équipements)
4. Confiance : **60%** (minimum)

## 📝 Notes importantes

- ✅ Les ajustements sont **multiplicatifs** (s'accumulent)
- ✅ Les ajustements sont **plafonnés** pour éviter des écarts trop importants
- ✅ Le système **filtre strictement** par type (Appartement ≠ Maison)
- ✅ Le code postal est **strict** (33000 ≠ 33360)
- ✅ Les outliers sont **automatiquement supprimés** (10% haut/bas)
- ✅ La confiance **ne descend jamais en dessous de 60%**

---

**Le système est conçu pour être robuste et donner des estimations cohérentes même avec peu de comparables.**

