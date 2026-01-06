# Script pour créer les buckets directement via l'API Supabase
# Utilise les credentials du fichier .env.local

$envFile = Get-Content .env.local
$supabaseUrl = ($envFile | Select-String "NEXT_PUBLIC_SUPABASE_URL").ToString().Split("=")[1].Trim()
$serviceKey = ($envFile | Select-String "SUPABASE_SERVICE_ROLE_KEY").ToString().Split("=")[1].Trim()

Write-Host "Creation des buckets Storage via API..." -ForegroundColor Cyan
Write-Host "URL: $supabaseUrl" -ForegroundColor Gray
Write-Host ""

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
    
    $body = @{
        name = $bucket
        public = $false
    } | ConvertTo-Json
    
    $headers = @{
        "apikey" = $serviceKey
        "Authorization" = "Bearer $serviceKey"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$supabaseUrl/storage/v1/bucket" -Method POST -Headers $headers -Body $body -ErrorAction Stop
        Write-Host "  [OK] Bucket '$bucket' cree avec succes" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "  [INFO] Bucket '$bucket' existe deja" -ForegroundColor Yellow
        } else {
            Write-Host "  [ERREUR] $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    Write-Host ""
}

Write-Host "Termine !" -ForegroundColor Green

