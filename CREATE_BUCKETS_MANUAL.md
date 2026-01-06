# Création Manuelle des Buckets Storage

## Méthode via Dashboard Supabase (Recommandée)

### Étapes :

1. **Connectez-vous à votre dashboard Supabase** :
   - Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionnez votre projet

2. **Accédez à Storage** :
   - Dans le menu de gauche, cliquez sur **"Storage"**

3. **Créez chaque bucket** :
   - Cliquez sur **"New bucket"**
   - Pour chaque bucket, remplissez :
     - **Name** : Le nom du bucket (voir liste ci-dessous)
     - **Public bucket** : **DÉCOCHEZ** (tous les buckets doivent être Private)
   - Cliquez sur **"Create bucket"**

### Liste des 6 buckets à créer :

1. ✅ **documents-ordre-mission** (Private)
2. ✅ **documents-projets** (Private)
3. ✅ **justificatifs-depenses** (Private)
4. ✅ **tdrs** (Private)
5. ✅ **documents-grh** (Private)
6. ✅ **rapports** (Private)

## Vérification

Après création, vous devriez voir les 6 buckets dans la liste Storage.

## Alternative : Via SQL

Si vous préférez utiliser SQL, exécutez cette commande dans le SQL Editor :

```sql
-- Note: La création de buckets via SQL n'est pas directement supportée
-- Utilisez le dashboard ou l'API REST
```

## Alternative : Via API REST

Vous pouvez aussi utiliser l'API REST directement. Consultez la documentation Supabase Storage API.

## Problème de connexion ?

Si vous avez des erreurs de connexion :
1. Vérifiez que votre URL Supabase est correcte dans `.env.local`
2. Vérifiez votre connexion internet
3. Vérifiez que votre projet Supabase est actif


