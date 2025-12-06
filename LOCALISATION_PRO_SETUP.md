# 🚀 Configuration Localisation PRO - Picarta AI

## 📋 Vue d'ensemble

La page `/app/localisation-pro` utilise l'API **Picarta AI** pour une géolocalisation ultra-précise des biens immobiliers à partir d'images.

Cette page est **totalement indépendante** de la page `/app/localisation` qui utilise notre solution maison (OpenAI + Google Maps).

---

## 🔧 Configuration

### 1. Obtenir une clé API Picarta

1. Visitez [https://picarta.ai](https://picarta.ai)
2. Créez un compte
3. Obtenez votre clé API dans le dashboard

### 2. Ajouter la clé dans `.env.local`

```bash
# Ajoutez cette ligne dans votre fichier .env.local
PICARTA_API_KEY=votre_cle_picarta_ici
```

### 3. Vérifier la documentation Picarta

⚠️ **IMPORTANT** : L'API route `/api/localisation/picarta/route.ts` contient un exemple de structure.

**Vous devez adapter** :
- L'URL de l'API (actuellement : `https://api.picarta.ai/v1/geolocate`)
- Le format de la requête (headers, body)
- Le format de la réponse (structure JSON)

Consultez la **documentation officielle Picarta** pour les détails exacts.

---

## 📁 Fichiers créés

### Frontend
- `/src/app/app/localisation-pro/page.tsx` - Page principale avec interface utilisateur

### Backend
- `/src/app/api/localisation/picarta/route.ts` - Route API pour appeler Picarta

### Navigation
- `/src/components/DashboardSidebar.tsx` - Lien ajouté dans la sidebar (section PILOTAGE)

---

## 🧪 Test

### 1. Mode Mock (sans clé API)

Si la clé API n'est pas configurée ou si l'API retourne une erreur 404/401, le système retourne automatiquement un **mock** pour tester l'interface.

### 2. Mode Production (avec clé API)

1. Ajoutez `PICARTA_API_KEY` dans `.env.local`
2. Redémarrez le serveur Next.js
3. Uploadez une image sur `/app/localisation-pro`
4. Cliquez sur "Analyser avec Picarta AI"
5. Vérifiez les résultats dans la console et l'interface

---

## 🔄 Comparaison avec la solution maison

### Page `/app/localisation` (Solution maison)
- ✅ OpenAI Vision pour l'analyse d'image
- ✅ Google Maps pour la géolocalisation
- ✅ Scoring personnalisé
- ✅ Filtres avancés (zone, piscine, jardin, etc.)

### Page `/app/localisation-pro` (Picarta AI)
- ✅ API Picarta pour tout le pipeline
- ✅ Interface simplifiée
- ✅ Résultats directs de Picarta

---

## 📊 Métriques à comparer

Lors des tests, comparez :

1. **Précision** : Les coordonnées sont-elles correctes ?
2. **Vitesse** : Temps de réponse de l'API
3. **Coût** : Coût par requête (Picarta vs OpenAI + Google Maps)
4. **Qualité** : Détection des caractéristiques (piscine, toiture, etc.)
5. **Fiabilité** : Taux de succès des analyses

---

## 🐛 Dépannage

### Erreur "PICARTA_API_KEY manquante"
- Vérifiez que la clé est bien dans `.env.local`
- Redémarrez le serveur après modification

### Erreur 404 ou 401
- Vérifiez que la clé API est valide
- Vérifiez l'URL de l'API dans `route.ts`
- Consultez la documentation Picarta pour les changements d'API

### Carte Google Maps ne s'affiche pas
- Vérifiez que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` est configurée
- La carte est optionnelle (affichage des résultats uniquement)

---

## 📝 Notes

- L'API route contient un **fallback mock** pour tester l'interface sans clé API
- La structure de réponse peut varier selon la version de l'API Picarta
- Adaptez le code dans `route.ts` selon la documentation officielle Picarta

---

## ✅ Checklist

- [ ] Clé API Picarta obtenue
- [ ] `PICARTA_API_KEY` ajoutée dans `.env.local`
- [ ] Serveur redémarré
- [ ] Test avec une image réelle
- [ ] Comparaison avec `/app/localisation`
- [ ] Documentation Picarta consultée et code adapté si nécessaire

---

🚀 **Prêt à tester !**

