# Scripts de configuration

## 📋 Scripts disponibles

### 1. `setup-vercel-env.*` - Configuration des variables d'environnement Vercel

Configure automatiquement les variables d'environnement requises dans Vercel en lisant les valeurs depuis `.env.local`.

**Fichiers disponibles :**
- `setup-vercel-env.ps1` - Pour Windows PowerShell
- `setup-vercel-env.sh` - Pour Linux/Mac (Bash)
- `setup-vercel-env.ts` - Version TypeScript interactive

**Prérequis :**
- Vercel CLI installé : `npm i -g vercel`
- Connecté à Vercel : `vercel login`
- Fichier `.env.local` avec les variables requises

**Utilisation :**

**Windows :**
```powershell
.\scripts\setup-vercel-env.ps1
```

**Linux/Mac :**
```bash
chmod +x scripts/setup-vercel-env.sh
./scripts/setup-vercel-env.sh
```

**TypeScript (interactif) :**
```bash
npx tsx scripts/setup-vercel-env.ts
```

**Variables configurées :**
- `NEXT_PUBLIC_SUPABASE_URL` (production, preview, development)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production, preview, development)
- `SUPABASE_SERVICE_ROLE_KEY` (production uniquement)

### 2. `seed-account.mjs` - Création de comptes (Niveau 1, 2, 3, Partenaires, Validateurs)

Script générique pour créer un compte avec le rôle demandé (USER, PM, FIN, LOG, GRH, DIR, MEAL, PART).

**Utilisation :**
```bash
ROLE=USER EMAIL=niveau1@afdr.local PASSWORD=xxx node scripts/seed-account.mjs
ROLE=DIR EMAIL=validateur@afdr.local PASSWORD=xxx node scripts/seed-account.mjs
```

Voir **README-seed-accounts.md** pour le tableau des types de comptes et tous les exemples.

### 3. `create-test-user.ts` - Création d'utilisateur de test

Crée un utilisateur de test dans Supabase avec profil et rôle (PM par défaut).

**Utilisation :**
```bash
npx tsx scripts/create-test-user.ts
```

**Prérequis :**
- Fichier `.env.local` avec les variables Supabase
- Clé service role pour créer l'utilisateur automatiquement

## 🔧 Installation des dépendances

Si vous utilisez les scripts TypeScript, assurez-vous d'avoir `tsx` installé :

```bash
npm install -g tsx
# ou
npm install --save-dev tsx
```





