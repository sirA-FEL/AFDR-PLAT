# Guide de Déploiement sur Vercel

## Configuration des Variables d'Environnement

Une fois le projet connecté à Vercel, vous devez configurer les variables d'environnement suivantes dans les paramètres du projet :

### Variables Requises

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Valeur : `https://foxxnqckwkdwgbfjfetm.supabase.co`
   - Description : URL de votre projet Supabase

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Valeur : Votre clé anonyme Supabase
   - Description : Clé publique pour l'authentification côté client

### Variables Optionnelles

3. **SUPABASE_SERVICE_ROLE_KEY** (si vous utilisez des Edge Functions)
   - Valeur : Votre clé service_role Supabase
   - Description : Clé privée pour les opérations serveur (⚠️ Ne jamais exposer côté client)

4. **RESEND_API_KEY** (si vous utilisez Resend pour les emails)
   - Valeur : Votre clé API Resend
   - Description : Pour l'envoi d'emails via les Edge Functions

## Comment Configurer dans Vercel

1. Allez sur votre projet Vercel
2. Cliquez sur **Settings** > **Environment Variables**
3. Ajoutez chaque variable :
   - **Key** : Le nom de la variable (ex: `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value** : La valeur correspondante
   - **Environment** : Sélectionnez `Production`, `Preview`, et `Development` selon vos besoins
4. Cliquez sur **Save**

## Redéploiement

Après avoir ajouté les variables d'environnement :
- Vercel redéploiera automatiquement votre projet
- Ou vous pouvez déclencher un nouveau déploiement manuellement depuis le dashboard

## Vérification

Une fois le déploiement terminé :
1. Vérifiez que l'application se charge correctement
2. Testez la connexion à Supabase (page de login)
3. Vérifiez les logs de déploiement pour d'éventuelles erreurs

## Notes Importantes

- ⚠️ Les variables commençant par `NEXT_PUBLIC_` sont exposées côté client
- ⚠️ Ne partagez jamais votre `SUPABASE_SERVICE_ROLE_KEY` publiquement
- Les variables d'environnement sont nécessaires pour que l'application fonctionne correctement
- Assurez-vous que votre projet Supabase autorise les requêtes depuis le domaine Vercel

