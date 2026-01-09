# Configuration Vercel pour AFDR Platform

## ✅ Configuration actuelle

- **Projet**: `afdr-platform`
- **Organisation**: `pragmatechs-projects`
- **Framework**: Next.js 16.1.1
- **Node Version**: 24.x
- **Région**: iad1 (Washington, D.C.)

## 📋 Étapes de configuration

### 1. Variables d'environnement requises

Vous devez configurer les variables d'environnement suivantes dans Vercel :

#### Variables publiques (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_SUPABASE_URL` - URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé anonyme Supabase

#### Variables privées (optionnelles pour certaines fonctionnalités)
- `SUPABASE_SERVICE_ROLE_KEY` - Clé service role Supabase (pour les opérations admin)

### 2. Configuration des variables d'environnement

#### Option 1 : Script automatique (Recommandé)

**Windows (PowerShell) :**
```powershell
.\scripts\setup-vercel-env.ps1
```

**Linux/Mac (Bash) :**
```bash
chmod +x scripts/setup-vercel-env.sh
./scripts/setup-vercel-env.sh
```

**TypeScript (Interactif) :**
```bash
npx tsx scripts/setup-vercel-env.ts
```

Les scripts lisent automatiquement les variables depuis `.env.local` et les configurent dans Vercel.

#### Option 2 : Via CLI Vercel manuellement
```bash
# Ajouter une variable pour tous les environnements
echo "votre-valeur" | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development

# Ajouter une variable pour la production uniquement
echo "votre-valeur" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

#### Option 3 : Via Dashboard Vercel :
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet `afdr-platform`
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez chaque variable pour les environnements appropriés :
   - **Production** : pour les déploiements en production
   - **Preview** : pour les pull requests
   - **Development** : pour les déploiements de développement

### 3. Connexion du repository GitHub

Pour activer les déploiements automatiques :

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet `afdr-platform`
3. Allez dans **Settings** → **Git**
4. Cliquez sur **Connect Git Repository**
5. Sélectionnez le repository `sirA-FEL/AFDR-PLAT`
6. Si le repository n'apparaît pas :
   - Vérifiez que votre compte GitHub est connecté à Vercel
   - Allez dans **Settings** → **Integrations** → **GitHub**
   - Autorisez l'accès à l'organisation `sirA-FEL` si nécessaire

### 4. Configuration de la branche de production

1. Dans **Settings** → **Git**
2. Définissez **Production Branch** sur `main`
3. Activez **Auto-deploy** pour la branche `main`

### 5. Vérification de la configuration

```bash
# Vérifier la configuration du projet
vercel project ls

# Vérifier les variables d'environnement
vercel env ls

# Vérifier la connexion Git
vercel git connect
```

## 🚀 Déploiement

### Déploiement automatique
Une fois le repository GitHub connecté, chaque push sur `main` déclenchera automatiquement un déploiement.

### Déploiement manuel
```bash
# Déployer en production
vercel --prod

# Déployer en preview
vercel
```

## 📝 Notes importantes

- Le fichier `vercel.json` est configuré pour Next.js
- Les scripts de build sont définis dans `package.json`
- Les fichiers `.env*` sont ignorés par Git (voir `.gitignore`)
- Le dossier `.vercel` contient la configuration locale et ne doit pas être commité

## 🔧 Dépannage

### Les déploiements automatiques ne fonctionnent pas
1. Vérifiez que le repository GitHub est bien connecté
2. Vérifiez que la branche `main` est configurée comme branche de production
3. Vérifiez que l'option "Auto-deploy" est activée

### Erreurs de build
1. Vérifiez que toutes les variables d'environnement sont configurées
2. Vérifiez les logs de build dans le dashboard Vercel
3. Testez le build localement avec `npm run build`

### Variables d'environnement manquantes
1. Vérifiez que les variables sont ajoutées pour le bon environnement (Production/Preview/Development)
2. Redéployez après avoir ajouté de nouvelles variables

