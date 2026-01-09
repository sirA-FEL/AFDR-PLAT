# Configuration Vercel avec Token d'authentification

## Méthode 1 : Créer un token depuis le dashboard Vercel

1. Allez sur https://vercel.com/account/tokens
2. Connectez-vous avec votre compte **sirA-FEL** (ou le compte qui a accès au repository)
3. Cliquez sur **"Create Token"**
4. Donnez un nom au token (ex: "AFDR Platform CLI")
5. Sélectionnez la portée : **Full Account** ou **Project** (selon vos besoins)
6. Cliquez sur **"Create"**
7. **Copiez le token** (il ne sera affiché qu'une seule fois !)

## Méthode 2 : Utiliser le token dans le CLI

Une fois le token créé, utilisez-le de deux façons :

### Option A : Via variable d'environnement (Recommandé)

**Windows PowerShell :**
```powershell
$env:VERCEL_TOKEN = "votre_token_ici"
vercel whoami
```

**Windows CMD :**
```cmd
set VERCEL_TOKEN=votre_token_ici
vercel whoami
```

**Linux/Mac :**
```bash
export VERCEL_TOKEN=votre_token_ici
vercel whoami
```

### Option B : Via flag --token

```bash
vercel --token votre_token_ici whoami
```

### Option C : Via fichier de configuration

Créez un fichier `.vercelrc` dans votre projet (ne pas commiter) :
```json
{
  "token": "votre_token_ici"
}
```

## Vérification

Après avoir configuré le token, vérifiez que vous êtes connecté avec le bon compte :

```bash
vercel whoami
```

Vous devriez voir le username correspondant à votre compte Vercel (celui qui a accès à sirA-FEL/AFDR-PLAT).

## Important

- Ne commitez JAMAIS le token dans Git
- Ajoutez `.vercelrc` au `.gitignore` si vous l'utilisez
- Le token a une expiration (vous pouvez le configurer lors de la création)




