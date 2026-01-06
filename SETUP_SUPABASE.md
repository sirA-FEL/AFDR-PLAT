# Guide de Configuration Supabase - Démarrage Rapide

## 🚀 Configuration en 5 minutes

### Étape 1 : Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com) et créez un compte
2. Cliquez sur **"New Project"**
3. Remplissez :
   - **Name** : `afdr-platform` (ou le nom de votre choix)
   - **Database Password** : Choisissez un mot de passe fort (⚠️ notez-le !)
   - **Region** : Choisissez la région la plus proche
4. Cliquez sur **"Create new project"** et attendez 2-3 minutes

### Étape 2 : Récupérer les credentials

Dans le dashboard Supabase :

1. Allez dans **Settings** (⚙️) > **API**
2. Copiez les valeurs suivantes :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public** key : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Étape 3 : Créer le fichier .env.local

Dans le dossier racine du projet, créez un fichier `.env.local` avec ce contenu :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Remplacez** `xxxxx` et la clé par vos vraies valeurs.

### Étape 4 : Exécuter les migrations SQL

1. Dans Supabase Dashboard, allez dans **SQL Editor**
2. Cliquez sur **"New query"**
3. Ouvrez et copiez le contenu de chaque fichier de migration dans l'ordre :
   - `supabase/migrations/001_schema_initial.sql`
   - `supabase/migrations/002_ordres_mission.sql`
   - `supabase/migrations/003_meal.sql`
   - `supabase/migrations/004_finance.sql`
   - `supabase/migrations/005_logistique.sql`
   - `supabase/migrations/006_tdr_grh_rapportage.sql`
   - `supabase/migrations/007_notifications.sql`
   - `supabase/migrations/008_policies_storage.sql`
   - `supabase/migrations/009_policies_rls.sql`
   - `supabase/migrations/010_fonctions.sql`
4. Collez chaque fichier dans l'éditeur SQL et cliquez sur **"Run"**

### Étape 5 : Créer les buckets Storage

1. Allez dans **Storage** dans le menu de gauche
2. Cliquez sur **"Create bucket"** pour chaque bucket suivant :
   - `documents-ordre-mission` → **Private**
   - `documents-projets` → **Private**
   - `justificatifs-depenses` → **Private**
   - `tdrs` → **Private**
   - `documents-grh` → **Private**
   - `rapports` → **Private**

### Étape 6 : Tester la connexion

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) - vous devriez voir la page de login.

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. ✅ Le serveur démarre sans erreur
2. ✅ La page de login s'affiche
3. ✅ Pas d'erreurs dans la console du navigateur
4. ✅ Pas d'erreurs dans le terminal

## 🔐 Variables d'environnement complètes

Si vous voulez utiliser les Edge Functions (alertes, relances), ajoutez aussi :

```env
# Clé de service (pour les Edge Functions)
# Trouvable dans: Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Clé Resend (optionnel, pour l'envoi d'emails)
RESEND_API_KEY=votre_cle_resend
```

## 📝 Notes importantes

- ⚠️ **Ne commitez JAMAIS** le fichier `.env.local` dans Git
- ⚠️ **Ne partagez JAMAIS** votre `SUPABASE_SERVICE_ROLE_KEY` publiquement
- Le fichier `.env.local` est déjà dans `.gitignore` pour votre sécurité

## 🆘 Problèmes courants

### Erreur : "Invalid API key"
- Vérifiez que vous avez copié la bonne clé (anon public, pas service_role)
- Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs

### Erreur : "Failed to fetch"
- Vérifiez que votre URL Supabase est correcte
- Vérifiez votre connexion internet
- Vérifiez que le projet Supabase est actif

### Les migrations échouent
- Exécutez-les dans l'ordre (001, 002, 003, etc.)
- Vérifiez qu'il n'y a pas d'erreurs de syntaxe SQL
- Si une table existe déjà, utilisez `DROP TABLE IF EXISTS` avant de la recréer

## 📚 Documentation complète

Pour plus de détails, consultez `README_ENV.md`


