# Configuration du fichier .env.local

## 📝 Instructions

Créez manuellement un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
# Configuration Supabase
# ⚠️ Ce fichier contient des secrets - NE JAMAIS le commiter dans Git !

# URL de votre projet Supabase
NEXT_PUBLIC_SUPABASE_URL=https://foxxnqckwkdwgbjfjetm.supabase.co

# Clé anonyme (anon key) de votre projet Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZveHhucWNrd2tkd2diZmpmZXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2Njg5OTksImV4cCI6MjA4MzI0NDk5OX0.c-7kcL80YkYqYv4WtVq5nvzqRKKsM4OcLpFA80dsviU

# Clé secrète Supabase (pour les Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_A4W41HO8pIl_DpP_e7Ofbw_TVWvSpQ7

# Configuration email (optionnel, pour les Edge Functions)
RESEND_API_KEY=
```

## 🚀 Création rapide (Windows PowerShell)

Exécutez cette commande dans PowerShell depuis le dossier du projet :

```powershell
@"
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=https://foxxnqckwkdwgbjfjetm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZveHhucWNrd2tkd2diZmpmZXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2Njg5OTksImV4cCI6MjA4MzI0NDk5OX0.c-7kcL80YkYqYv4WtVq5nvzqRKKsM4OcLpFA80dsviU
SUPABASE_SERVICE_ROLE_KEY=sb_secret_A4W41HO8pIl_DpP_e7Ofbw_TVWvSpQ7
RESEND_API_KEY=
"@ | Out-File -FilePath .env.local -Encoding utf8
```

## ✅ Vérification

Après avoir créé le fichier, vérifiez qu'il existe :

```powershell
Test-Path .env.local
```

Si la commande retourne `True`, le fichier est créé correctement.

## 🔒 Sécurité

- ✅ Le fichier `.env.local` est déjà dans `.gitignore`
- ✅ Ne partagez JAMAIS ces clés publiquement
- ✅ Ne commitez JAMAIS ce fichier dans Git

## 🎯 Prochaines étapes

1. ✅ Fichier `.env.local` créé
2. ⏭️ Exécuter les migrations SQL dans Supabase
3. ⏭️ Créer les buckets Storage
4. ⏭️ Lancer `npm run dev` pour tester


