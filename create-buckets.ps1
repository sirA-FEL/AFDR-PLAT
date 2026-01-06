# Script PowerShell pour créer les buckets Storage Supabase
# Prérequis: Supabase CLI installé et projet lié

Write-Host "Creation des buckets Storage Supabase..." -ForegroundColor Cyan
Write-Host ""

# Liste des buckets à créer (tous en mode Private)
$buckets = @(
    "documents-ordre-mission",
    "documents-projets",
    "justificatifs-depenses",
    "tdrs",
    "documents-grh",
    "rapports"
)

foreach ($bucket in $buckets) {
    Write-Host "Creation du bucket: $bucket" -ForegroundColor Yellow
    
    # Créer le bucket avec Supabase CLI
    $result = supabase storage create $bucket --public false 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Bucket '$bucket' cree avec succes" -ForegroundColor Green
    } else {
        # Vérifier si le bucket existe déjà
        if ($result -match "already exists" -or $result -match "duplicate") {
            Write-Host "  ⚠ Bucket '$bucket' existe deja" -ForegroundColor Yellow
        } else {
            Write-Host "  ✗ Erreur lors de la creation: $result" -ForegroundColor Red
        }
    }
    Write-Host ""
}

Write-Host "Termine !" -ForegroundColor Green
Write-Host ""
Write-Host "Verification des buckets crees:" -ForegroundColor Cyan
supabase storage list


