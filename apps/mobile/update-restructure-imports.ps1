# Update imports after restructuring directories to match FSD target structure

Write-Host "Updating imports after directory restructure..." -ForegroundColor Green

$files = Get-ChildItem -Path . -Include *.ts,*.tsx,*.js,*.jsx -Recurse | 
    Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.next\*" }

$totalFiles = $files.Count
$updatedFiles = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $originalContent = $content
    
    # Update config imports
    $content = $content -replace "from\s+(['""])[\./]*src/config\1", "from `$1@shared/config`$1"
    $content = $content -replace "from\s+(['""])@/src/config\1", "from `$1@shared/config`$1"
    
    # Update core/providers imports (now in app/providers)
    $content = $content -replace "from\s+(['""])[\./]*src/core/providers", "from `$1@/app/providers"
    $content = $content -replace "from\s+(['""])@/src/core/providers", "from `$1@/app/providers"
    
    # Update core/components imports (now in shared/components/core)
    $content = $content -replace "from\s+(['""])[\./]*src/core/components", "from `$1@shared/components/core"
    
    # Update core/navigation imports (now in shared/navigation)
    $content = $content -replace "from\s+(['""])[\./]*src/core/navigation", "from `$1@shared/navigation"
    
    # Update root hooks imports (now in shared/hooks)
    $content = $content -replace "from\s+(['""])[\./]*src/hooks/", "from `$1@shared/hooks/"
    $content = $content -replace "from\s+(['""])@/src/hooks/", "from `$1@shared/hooks/"
    
    # Update layouts imports (now in shared/components/layout)
    $content = $content -replace "from\s+(['""])[\./]*src/layouts/", "from `$1@shared/components/layout/"
    
    # Update styles imports (now in shared/styles)
    $content = $content -replace "from\s+(['""])[\./]*src/styles/", "from `$1@shared/styles/"
    $content = $content -replace "from\s+(['""])@/src/styles/", "from `$1@shared/styles/"
    
    # Update utils imports that were moved to entities
    $content = $content -replace "from\s+(['""])[\./]*src/utils/application/", "from `$1@entities/application/lib/"
    $content = $content -replace "from\s+(['""])[\./]*src/utils/job-category-utils", "from `$1@entities/application/lib/job-category-utils"
    $content = $content -replace "from\s+(['""])[\./]*src/utils/health-card", "from `$1@entities/healthCard/lib/health-card"
    $content = $content -replace "from\s+(['""])[\./]*src/utils/user-utils", "from `$1@entities/user/lib/user-utils"
    
    # Update remaining utils imports (now in shared/utils)
    $content = $content -replace "from\s+(['""])[\./]*src/utils/", "from `$1@shared/utils/"
    $content = $content -replace "from\s+(['""])@/src/utils/", "from `$1@shared/utils/"
    
    # Save file if changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $updatedFiles++
        $relativePath = $file.FullName.Replace("$PWD\", "").Replace("\", "/")
        Write-Host "Updated: $relativePath" -ForegroundColor Yellow
    }
}

Write-Host "`nImport update complete!" -ForegroundColor Green
Write-Host "Total files scanned: $totalFiles" -ForegroundColor White
Write-Host "Files updated: $updatedFiles" -ForegroundColor White
