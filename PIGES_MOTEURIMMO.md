# 🏠 Système de Piges MoteurImmo

## ✅ Implémentation Complète

Le système de Piges immobilières est maintenant entièrement fonctionnel avec **MoteurImmo** comme unique provider.

### 📁 Fichiers Créés

1. **Client MoteurImmo**
   - `src/lib/providers/moteurimmoClient.ts`
   - Client API pour MoteurImmo avec gestion d'erreurs

2. **Normalisation**
   - `src/lib/piges/normalize.ts`
   - Conversion des résultats MoteurImmo vers format standardisé

3. **Throttling**
   - `src/lib/piges/throttle.ts`
   - Limitation à 10 scans/heure par utilisateur

4. **Service Piges**
   - `src/services/piges/pigesService.ts`
   - Orchestrateur principal avec hardcaps de sécurité

5. **Routes API**
   - `src/app/api/piges/fetch/route.ts` - Recherche de Piges
   - `src/app/api/piges/history/route.ts` - Historique des scans

6. **Désactivation Melo**
   - `src/lib/melo-disabled.ts` - Configuration centralisée

### 🛡️ Hardcaps de Sécurité

- ✅ **Max pageSize**: 50 résultats par page
- ✅ **Max pages**: 3 pages maximum
- ✅ **Max résultats totaux**: 150 résultats
- ✅ **Max scans/heure**: 10 scans par utilisateur
- ✅ **Ville OU code postal**: Obligatoire

### 🔌 Utilisation API

#### Recherche de Piges

```typescript
POST /api/piges/fetch
{
  "filters": {
    "city": "Paris",           // OU "postalCode": "75001"
    "minPrice": 200000,
    "maxPrice": 500000,
    "minSurface": 50,
    "maxSurface": 100,
    "type": "vente"            // OU "location"
  }
}
```

#### Historique

```typescript
GET /api/piges/history
```

### ⚙️ Variables d'Environnement

Ajoutez dans `.env.local`:

```bash
MOTEURIMMO_API_KEY=votre_clé_api_moteurimmo
```

### 🚫 Melo.ai Désactivé

Tous les appels à Melo.ai sont protégés par `MELO_DISABLED = true`.

Les routes suivantes retournent une erreur 403:
- `/api/annonces/all`
- `/api/melo/*`
- Tous les appels à `meloService.*`

### 📊 Schéma Prisma

Le modèle `UserScan` a été ajouté pour le throttling:

```prisma
model UserScan {
  id        String   @id @default(cuid())
  userId    String
  count     Int      @default(1)
  hour      DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, hour])
  @@index([userId, hour])
  @@map("user_scans")
}
```

### 🔄 Migration Base de Données

Exécutez la migration:

```bash
npx prisma migrate dev --name add_user_scan
```

### 🧪 Tests à Effectuer

1. ✅ Pige avec ville = Paris
2. ✅ Pige avec code postal = 06000
3. ✅ Prix min/max
4. ✅ Limiteur scans (10/heure)
5. ✅ Protection sans ville/cp
6. ✅ 3 pages max
7. ✅ Historique correct
8. ✅ Aucun appel Melo.ai dans les logs

### 📝 Prochaines Étapes

1. Créer le composant React pour l'UI Piges
2. Connecter l'UI aux routes API
3. Afficher les résultats normalisés
4. Gérer les erreurs et le throttling



