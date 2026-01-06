# Script PowerShell pour créer le fichier .env.local
# Exécutez ce script depuis le dossier racine du projet

$envContent = @"
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
"@

# Créer le fichier .env.local
$envContent | Out-File -FilePath ".env.local" -Encoding utf8 -NoNewline

Write-Host "Fichier .env.local cree avec succes !" -ForegroundColor Green
Write-Host ""
Write-Host "Variables configurees :" -ForegroundColor Cyan
Write-Host "  - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Yellow
Write-Host "  - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Yellow
Write-Host "  - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
Write-Host ""
Write-Host "Vous pouvez maintenant lancer: npm run dev" -ForegroundColor Green

