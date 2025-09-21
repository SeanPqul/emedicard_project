# FSD Import Path Update Script
# This script updates all import paths to use FSD aliases

Write-Host "Starting FSD import path updates..." -ForegroundColor Green

# Get all TypeScript and TypeScript React files
$files = Get-ChildItem -Path "src" -Include *.ts,*.tsx -Recurse

$totalFiles = $files.Count
$updatedFiles = 0
$changes = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanged = $false
    
    # Track changes for this file
    $fileChanges = @()
    
    # Update domain type imports
    if ($content -match "@/src/types/domain/application") {
        $content = $content -replace "@/src/types/domain/application", "@entities/application/model/types"
        $fileChanges += "Updated application domain types import"
        $fileChanged = $true
    }
    
    if ($content -match "@/src/types/domain/user") {
        $content = $content -replace "@/src/types/domain/user", "@entities/user/model/types"
        $fileChanges += "Updated user domain types import"
        $fileChanged = $true
    }
    
    if ($content -match "@/src/types/domain/payment") {
        $content = $content -replace "@/src/types/domain/payment", "@entities/payment/model/types"
        $fileChanges += "Updated payment domain types import"
        $fileChanged = $true
    }
    
    if ($content -match "@/src/types/domain/health-card") {
        $content = $content -replace "@/src/types/domain/health-card", "@entities/healthCard/model/types"
        $fileChanges += "Updated health-card domain types import"
        $fileChanged = $true
    }
    
    # Update entity imports
    if ($content -match "@/src/entities/") {
        $content = $content -replace "@/src/entities/", "@entities/"
        $fileChanges += "Updated entities import path"
        $fileChanged = $true
    }
    
    # Update shared imports
    if ($content -match "@/src/shared/") {
        $content = $content -replace "@/src/shared/", "@shared/"
        $fileChanges += "Updated shared import path"
        $fileChanged = $true
    }
    
    # Update features imports
    if ($content -match "@/src/features/") {
        $content = $content -replace "@/src/features/", "@features/"
        $fileChanges += "Updated features import path"
        $fileChanged = $true
    }
    
    # Update screens imports
    if ($content -match "@/src/screens/") {
        $content = $content -replace "@/src/screens/", "@screens/"
        $fileChanges += "Updated screens import path"
        $fileChanged = $true
    }
    
    # Update processes imports
    if ($content -match "@/src/processes/") {
        $content = $content -replace "@/src/processes/", "@processes/"
        $fileChanges += "Updated processes import path"
        $fileChanged = $true
    }
    
    # Update application service import
    if ($content -match "@/src/features/application/services/applicationService") {
        $content = $content -replace "@/src/features/application/services/applicationService", "@entities/application/model/service"
        $fileChanges += "Updated application service import"
        $fileChanged = $true
    }
    
    # Update types imports
    if ($content -match "@/src/types/") {
        # Skip domain types as they're handled above
        if ($content -notmatch "@/src/types/domain/") {
            $content = $content -replace "@/src/types/", "@types/"
            $fileChanges += "Updated types import path"
            $fileChanged = $true
        }
    }
    
    # Save the file if changes were made
    if ($fileChanged) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $updatedFiles++
        $relativePath = $file.FullName.Replace("$PWD\", "").Replace("\", "/")
        Write-Host "Updated $relativePath" -ForegroundColor Yellow
        foreach ($change in $fileChanges) {
            Write-Host "  - $change" -ForegroundColor Cyan
        }
        $changes += @{
            File = $relativePath
            Changes = $fileChanges
        }
    }
}

Write-Host "`nImport update complete!" -ForegroundColor Green
Write-Host "Total files scanned: $totalFiles" -ForegroundColor White
Write-Host "Files updated: $updatedFiles" -ForegroundColor White

# Generate summary report
if ($changes.Count -gt 0) {
    Write-Host "`nGenerating update report..." -ForegroundColor Yellow
    $report = @"
# FSD Import Path Update Report
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Total files updated: $updatedFiles

## Changes by file:

"@
    
    foreach ($change in $changes) {
        $report += "`n### $($change.File)`n"
        foreach ($c in $change.Changes) {
            $report += "- $c`n"
        }
    }
    
    $report | Out-File -FilePath "fsd-import-update-report.md"
    Write-Host "Report saved to fsd-import-update-report.md" -ForegroundColor Green
}
