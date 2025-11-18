# ✅ Vérifier et Configurer la Clé API pour Cloud Vision

## 🔍 Étape 1 : Vérifier la Clé API

1. Dans la page "Identifiants", cliquez sur **"Clé API 1"** (le lien en violet)
2. Une fenêtre s'ouvre avec les détails de la clé

## 🔐 Étape 2 : Vérifier les Restrictions API

Dans la fenêtre de détails de la clé API, vérifiez la section **"Restrictions API"** :

### Si c'est "Aucune restriction" :
- ✅ La clé fonctionnera avec toutes les APIs (y compris Vision)
- ⚠️ Mais c'est moins sécurisé

### Si c'est "Restreindre la clé" :
- Vérifiez que **"Cloud Vision API"** est dans la liste des APIs autorisées
- Si ce n'est pas le cas, ajoutez-la

## 🛠️ Étape 3 : Configurer les Restrictions (Recommandé)

1. Dans la fenêtre de détails de la clé API
2. Dans **"Restrictions API"**, sélectionnez **"Restreindre la clé"**
3. Dans la liste déroulante, cochez :
   - ✅ **Cloud Vision API**
   - ✅ **Geocoding API** (si vous utilisez la même clé pour Maps)
   - ✅ **Street View Static API** (si vous utilisez la même clé pour Maps)
4. Cliquez sur **"Enregistrer"**

## 🧪 Étape 4 : Tester la Clé API

Pour tester si votre clé fonctionne avec Vision API, vous pouvez utiliser cette commande :

```bash
curl "https://vision.googleapis.com/v1/images:annotate?key=VOTRE_CLE_API" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [{
      "image": {
        "content": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      },
      "features": [{
        "type": "TEXT_DETECTION"
      }]
    }]
  }'
```

Si vous obtenez une réponse JSON (même avec une erreur de format d'image), c'est que la clé fonctionne !

## ⚠️ Erreurs Possibles

### "API key not valid"
- Vérifiez que vous avez bien copié toute la clé
- Vérifiez que Cloud Vision API est activée dans votre projet

### "API key not enabled for this API"
- La clé n'a pas accès à Vision API
- Ajoutez "Cloud Vision API" dans les restrictions de la clé

### "Billing account required"
- Activez la facturation dans Google Cloud Console
- Même avec le crédit gratuit, la facturation doit être activée

## 📝 Note Importante

Vous pouvez utiliser **la même clé API** pour :
- Cloud Vision API
- Geocoding API  
- Street View Static API

Ou créer **2 clés séparées** :
- 1 clé pour Vision API
- 1 clé pour Maps APIs (Geocoding + Street View)

Les deux méthodes fonctionnent ! 🚀

