# Script PowerShell pour configurer les variables d'environnement Vercel
# Usage: .\scripts\setup-vercel-env.ps1

Write-Host "Configuration des variables d'environnement Vercel" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que Vercel CLI est installe
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "Vercel CLI installe: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "Vercel CLI n'est pas installe" -ForegroundColor Red
    Write-Host "   Installez-le avec: npm i -g vercel" -ForegroundColor Yellow
    exit 1
}

# Verifier la connexion
try {
    $whoami = vercel whoami 2>&1
    Write-Host "Connecte a Vercel CLI: $whoami" -ForegroundColor Green
} catch {
    Write-Host "Vous devez etre connecte a Vercel CLI" -ForegroundColor Red
    Write-Host "   Executez: vercel login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Charger les variables depuis .env.local si disponible
$envVars = @{}
if (Test-Path .env.local) {
    Write-Host "Lecture de .env.local..." -ForegroundColor Cyan
    Get-Content .env.local | ForEach-Object {
        if ($_ -match '^([^=:#]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            if ($value.StartsWith("'") -and $value.EndsWith("'")) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            $envVars[$key] = $value
        }
    }
    Write-Host "$($envVars.Count) variables trouvees dans .env.local" -ForegroundColor Green
    Write-Host ""
}

# Fonction pour ajouter une variable
function Add-EnvVar {
    param(
        [string]$VarName,
        [string]$VarValue,
        [string[]]$Environments
    )
    
    if ([string]::IsNullOrWhiteSpace($VarValue)) {
        Write-Host "$VarName non definie, ignoree" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Configuration de $VarName..." -ForegroundColor Cyan
    foreach ($env in $Environments) {
        try {
            $VarValue | vercel env add $VarName $env 2>&1 | Out-Null
            Write-Host "   $VarName ajoutee pour $env" -ForegroundColor Green
        } catch {
            Write-Host "   Erreur pour $env (peut-etre deja definie)" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

# Variables requises
Write-Host "Configuration des variables..." -ForegroundColor Cyan
Write-Host ""

Add-EnvVar "NEXT_PUBLIC_SUPABASE_URL" $envVars["NEXT_PUBLIC_SUPABASE_URL"] @("production", "preview", "development")
Add-EnvVar "NEXT_PUBLIC_SUPABASE_ANON_KEY" $envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] @("production", "preview", "development")
Add-EnvVar "SUPABASE_SERVICE_ROLE_KEY" $envVars["SUPABASE_SERVICE_ROLE_KEY"] @("production")

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Configuration terminee!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifiez les variables avec: vercel env ls" -ForegroundColor Cyan
Write-Host "Ou dans le dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host ""
