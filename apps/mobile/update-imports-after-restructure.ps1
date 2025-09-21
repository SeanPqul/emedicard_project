# Update imports after restructuring directories to match FSD target structure

Write-Host "Updating imports after directory restructure..." -ForegroundColor Green

$files = Get-ChildItem -Path . -Include *.ts,*.tsx,*.js,*.jsx -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notlike "*\node_modules\*" }

$totalFiles = $files.Count
$updatedFiles = 0
$fileChanges = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $changes = @()
    
    # Update config imports
    if ($content -match "from\s+['"][\./]*src/config['"]") {
        $content = $content -replace "from\s+['"][\./]*src/config['"]", "from '@shared/config'"
        $changes += "Updated config import"
    }
    if ($content -match "from\s+['"]@/src/config['"]") {
        $content = $content -replace "from\s+['"]@/src/config['"]", "from '@shared/config'"
        $changes += "Updated config import"
    }
    
    # Update core/providers imports (now in app/providers)
    if ($content -match "from\s+['"][\./]*src/core/providers") {
        $content = $content -replace "from\s+['"][\./]*src/core/providers(/[^'"]*)?['"]", "from '../../../app/providers`$1'"
        $changes += "Updated core/providers import"
    }
    if ($content -match "from\s+['"]@/src/core/providers") {
        $content = $content -replace "from\s+['"]@/src/core/providers(/[^'"]*)?['"]", "from '@/app/providers`$1'"
        $changes += "Updated core/providers import"
    }
    
    # Update core/components imports (now in shared/components/core)
    if ($content -match "from\s+['"][\./]*src/core/components") {
        $content = $content -replace "from\s+['"][\./]*src/core/components(/[^'"]*)?['"]", "from '@shared/components/core`$1'"
        $changes += "Updated core/components import"
    }
    
    # Update core/navigation imports (now in shared/navigation)
    if ($content -match "from ['\"][\./]*src/core/navigation") {
        $content = $content -replace "from ['\"][\./]*src/core/navigation(/[^'\"]*)?['\"]", "from '@shared/navigation`$1'"
        $changes += "Updated core/navigation import"
    }
    
    # Update root hooks imports (now in shared/hooks)
    if ($content -match "from ['\"][\./]*src/hooks/") {
        $content = $content -replace "from ['\"][\./]*src/hooks/([^'\"]+)['\"]", "from '@shared/hooks/`$1'"
        $changes += "Updated root hooks import"
    }
    if ($content -match "from ['\"]@/src/hooks/") {
        $content = $content -replace "from ['\"]@/src/hooks/([^'\"]+)['\"]", "from '@shared/hooks/`$1'"
        $changes += "Updated root hooks import"
    }
    
    # Update layouts imports (now in shared/components/layout)
    if ($content -match "from ['\"][\./]*src/layouts/") {
        $content = $content -replace "from ['\"][\./]*src/layouts/([^'\"]+)['\"]", "from '@shared/components/layout/`$1'"
        $changes += "Updated layouts import"
    }
    
    # Update styles imports (now in shared/styles)
    if ($content -match "from ['\"][\./]*src/styles/") {
        $content = $content -replace "from ['\"][\./]*src/styles/([^'\"]+)['\"]", "from '@shared/styles/`$1'"
        $changes += "Updated styles import"
    }
    if ($content -match "from ['\"]@/src/styles/") {
        $content = $content -replace "from ['\"]@/src/styles/([^'\"]+)['\"]", "from '@shared/styles/`$1'"
        $changes += "Updated styles import"
    }
    
    # Update utils imports that were moved to entities
    if ($content -match "from ['\"][\./]*src/utils/application/") {
        $content = $content -replace "from ['\"][\./]*src/utils/application/([^'\"]+)['\"]", "from '@entities/application/lib/`$1'"
        $changes += "Updated application utils import"
    }
    if ($content -match "from ['\"][\./]*src/utils/job-category-utils") {
        $content = $content -replace "from ['\"][\./]*src/utils/job-category-utils['\"]", "from '@entities/application/lib/job-category-utils'"
        $changes += "Updated job-category-utils import"
    }
    if ($content -match "from ['\"][\./]*src/utils/health-card") {
        $content = $content -replace "from ['\"][\./]*src/utils/(health-card[^'\"]*)['\"]", "from '@entities/healthCard/lib/`$1'"
        $changes += "Updated health-card utils import"
    }
    if ($content -match "from ['\"][\./]*src/utils/user-utils") {
        $content = $content -replace "from ['\"][\./]*src/utils/user-utils['\"]", "from '@entities/user/lib/user-utils'"
        $changes += "Updated user-utils import"
    }
    
    # Update remaining utils imports (now in shared/utils)
    if ($content -match "from ['\"][\./]*src/utils/") {
        $content = $content -replace "from ['\"][\./]*src/utils/([^'\"]+)['\"]", "from '@shared/utils/`$1'"
        $changes += "Updated utils import"
    }
    if ($content -match "from ['\"]@/src/utils/") {
        $content = $content -replace "from ['\"]@/src/utils/([^'\"]+)['\"]", "from '@shared/utils/`$1'"
        $changes += "Updated utils import"
    }
    
    # Save file if changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $updatedFiles++
        $relativePath = $file.FullName.Replace("$PWD\", "").Replace("\", "/")
        Write-Host "Updated $relativePath" -ForegroundColor Yellow
        foreach ($change in $changes) {
            Write-Host "  - $change" -ForegroundColor Cyan
        }
        $fileChanges += @{
            File = $relativePath
            Changes = $changes
        }
    }
}

Write-Host "`nImport update complete!" -ForegroundColor Green
Write-Host "Total files scanned: $totalFiles" -ForegroundColor White
Write-Host "Files updated: $updatedFiles" -ForegroundColor White

# Generate report
if ($fileChanges.Count -gt 0) {
    $report = @"
# Import Update Report - Directory Restructure
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Total files updated: $updatedFiles

## Moved directories:
- src/config → src/shared/config
- src/core/providers → app/providers
- src/core/components → src/shared/components/core
- src/core/navigation → src/shared/navigation
- src/hooks → src/shared/hooks
- src/layouts → src/shared/components/layout
- src/styles → src/shared/styles
- src/utils/application → src/entities/application/lib
- src/utils/job-category-utils.ts → src/entities/application/lib
- src/utils/health-card*.ts → src/entities/healthCard/lib
- src/utils/user-utils.ts → src/entities/user/lib
- src/utils/* → src/shared/utils

## Changes by file:
"@
    
    foreach ($change in $fileChanges) {
        $report += "`n### $($change.File)`n"
        foreach ($c in $change.Changes) {
            $report += "- $c`n"
        }
    }
    
    $report | Out-File -FilePath "restructure-import-update-report.md"
    Write-Host "`nReport saved to restructure-import-update-report.md" -ForegroundColor Green
}
