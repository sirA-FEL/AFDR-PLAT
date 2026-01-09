# Script PowerShell pour déployer sur Vercel avec token
# Usage: .\scripts\deploy-vercel.ps1 [--token VOTRE_TOKEN] [--prod]

param(
    [string]$Token,
    [switch]$Prod
)

Write-Host "Deploiement sur Vercel" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Vercel CLI est installé
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "Vercel CLI installe: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "Vercel CLI n'est pas installe" -ForegroundColor Red
    Write-Host "   Installez-le avec: npm i -g vercel" -ForegroundColor Yellow
    exit 1
}

# Configurer le token si fourni
if ($Token) {
    Write-Host "Configuration du token Vercel..." -ForegroundColor Cyan
    $env:VERCEL_TOKEN = $Token
    Write-Host "Token configure" -ForegroundColor Green
    Write-Host ""
}

# Vérifier la connexion
Write-Host "Verification de la connexion..." -ForegroundColor Cyan
try {
    if ($Token) {
        $whoami = vercel --token $Token whoami 2>&1
    } else {
        $whoami = vercel whoami 2>&1
    }
    Write-Host "Connecte a Vercel: $whoami" -ForegroundColor Green
} catch {
    Write-Host "Erreur de connexion" -ForegroundColor Red
    Write-Host "   Assurez-vous que le token est valide" -ForegroundColor Yellow
    Write-Host "   Ou executez: vercel login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Déploiement
if ($Prod) {
    Write-Host "Deploiement en PRODUCTION..." -ForegroundColor Yellow
    Write-Host ""
    if ($Token) {
        vercel --token $Token --prod --yes
    } else {
        vercel --prod --yes
    }
} else {
    Write-Host "Deploiement en PREVIEW..." -ForegroundColor Cyan
    Write-Host ""
    if ($Token) {
        vercel --token $Token --yes
    } else {
        vercel --yes
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================" -ForegroundColor Cyan
    Write-Host "Deploiement reussi!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "=====================" -ForegroundColor Cyan
    Write-Host "Erreur lors du deploiement" -ForegroundColor Red
    exit 1
}

