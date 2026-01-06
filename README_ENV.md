# Configuration des Variables d'Environnement

## Étapes pour configurer Supabase

### 1. Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Remplissez les informations :
   - Nom du projet
   - Mot de passe de la base de données
   - Région (choisissez la plus proche)
5. Attendez que le projet soit créé (2-3 minutes)

### 2. Récupérer les credentials

Une fois le projet créé :

1. Allez dans **Settings** > **API**
2. Vous trouverez :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public key** : Une longue chaîne de caractères commençant par `eyJ...`

### 3. Configurer le fichier .env.local

1. Copiez le fichier `.env.local.example` vers `.env.local` :
   ```bash
   cp .env.local.example .env.local
   ```

2. Ouvrez `.env.local` et remplissez les valeurs :

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 4. Exécuter les migrations

1. Dans le dashboard Supabase, allez dans **SQL Editor**
2. Exécutez les migrations dans l'ordre :
   - `001_schema_initial.sql`
   - `002_ordres_mission.sql`
   - `003_meal.sql`
   - `004_finance.sql`
   - `005_logistique.sql`
   - `006_tdr_grh_rapportage.sql`
   - `007_notifications.sql`
   - `008_policies_storage.sql`
   - `009_policies_rls.sql`
   - `010_fonctions.sql`

### 5. Configurer Storage

1. Allez dans **Storage** dans le dashboard Supabase
2. Créez les buckets suivants (tous en **Private** sauf indication) :
   - `documents-ordre-mission` (Private)
   - `documents-projets` (Private)
   - `justificatifs-depenses` (Private)
   - `tdrs` (Private)
   - `documents-grh` (Private)
   - `rapports` (Private)

3. Pour chaque bucket, configurez les policies RLS selon vos besoins de sécurité

### 6. Déployer les Edge Functions (optionnel)

Si vous voulez utiliser les Edge Functions pour les alertes et relances :

1. Installez Supabase CLI :
   ```bash
   npm install -g supabase
   ```

2. Connectez-vous :
   ```bash
   supabase login
   ```

3. Liez votre projet :
   ```bash
   supabase link --project-ref votre-project-ref
   ```

4. Déployez les fonctions :
   ```bash
   supabase functions deploy alertes-meal
   supabase functions deploy relances-rapports
   supabase functions deploy envoi-email
   ```

### 7. Variables d'environnement pour Edge Functions

Dans le dashboard Supabase, allez dans **Settings** > **Edge Functions** et ajoutez les secrets nécessaires :

- `SUPABASE_URL` : Votre Project URL
- `SUPABASE_SERVICE_ROLE_KEY` : Votre service_role key (trouvable dans Settings > API)
- `RESEND_API_KEY` : Si vous utilisez Resend pour les emails (optionnel)

## Vérification

Une fois configuré, vous pouvez tester la connexion en lançant :

```bash
npm run dev
```

Si tout est correct, vous devriez pouvoir accéder à l'application sans erreurs de connexion Supabase.

## Sécurité

⚠️ **IMPORTANT** :
- Ne commitez JAMAIS le fichier `.env.local` dans Git
- Ne partagez JAMAIS votre `SUPABASE_SERVICE_ROLE_KEY` publiquement
- Utilisez toujours les variables d'environnement pour les secrets


