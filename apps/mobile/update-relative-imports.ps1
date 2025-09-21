# FSD Relative Import Update Script
# This script updates relative imports to use FSD aliases

Write-Host "Starting relative import path updates..." -ForegroundColor Green

# Get all TypeScript and TypeScript React files
$files = Get-ChildItem -Path "src" -Include *.ts,*.tsx -Recurse

$totalFiles = $files.Count
$updatedFiles = 0
$changes = @()

# Helper function to determine FSD layer from path
function Get-FSDLayer {
    param([string]$path)
    
    if ($path -match "src[/\\]screens[/\\]") { return "screens" }
    elseif ($path -match "src[/\\]features[/\\]") { return "features" }
    elseif ($path -match "src[/\\]entities[/\\]") { return "entities" }
    elseif ($path -match "src[/\\]processes[/\\]") { return "processes" }
    elseif ($path -match "src[/\\]shared[/\\]") { return "shared" }
    elseif ($path -match "src[/\\]types[/\\]") { return "types" }
    else { return $null }
}

foreach ($file in $files) {
    # Skip archived and test files
    if ($file.FullName -match "_archived|archive|\.test\.|\.spec\.") {
        continue
    }
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanged = $false
    
    # Track changes for this file
    $fileChanges = @()
    
    # Get the current file's FSD layer
    $currentLayer = Get-FSDLayer -path $file.FullName
    
    # Find all relative imports
    $relativeImportPattern = "from\s+['""](\.\./[^'""]+|\.{2,}/[^'""]+)['""]"
    $matches = [regex]::Matches($content, $relativeImportPattern)
    
    foreach ($match in $matches) {
        $originalImport = $match.Value
        $relativePath = $match.Groups[1].Value
        
        # Try to resolve the import path
        $currentDir = Split-Path $file.FullName -Parent
        $resolvedPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($currentDir, $relativePath))
        $resolvedPath = $resolvedPath.Replace("\", "/")
        
        # Check if this resolves to a known FSD layer
        if ($resolvedPath -match "shared/") {
            $newPath = $resolvedPath -replace ".*src/shared/", "@shared/"
            $newImport = $originalImport -replace [regex]::Escape($relativePath), $newPath
            $content = $content.Replace($originalImport, $newImport)
            $fileChanges += "Updated relative import to shared: $relativePath -> $newPath"
            $fileChanged = $true
        }
        elseif ($resolvedPath -match "features/") {
            $newPath = $resolvedPath -replace ".*src/features/", "@features/"
            $newImport = $originalImport -replace [regex]::Escape($relativePath), $newPath
            $content = $content.Replace($originalImport, $newImport)
            $fileChanges += "Updated relative import to features: $relativePath -> $newPath"
            $fileChanged = $true
        }
        elseif ($resolvedPath -match "entities/") {
            $newPath = $resolvedPath -replace ".*src/entities/", "@entities/"
            $newImport = $originalImport -replace [regex]::Escape($relativePath), $newPath
            $content = $content.Replace($originalImport, $newImport)
            $fileChanges += "Updated relative import to entities: $relativePath -> $newPath"
            $fileChanged = $true
        }
        elseif ($resolvedPath -match "processes/") {
            $newPath = $resolvedPath -replace ".*src/processes/", "@processes/"
            $newImport = $originalImport -replace [regex]::Escape($relativePath), $newPath
            $content = $content.Replace($originalImport, $newImport)
            $fileChanges += "Updated relative import to processes: $relativePath -> $newPath"
            $fileChanged = $true
        }
        elseif ($resolvedPath -match "screens/") {
            $newPath = $resolvedPath -replace ".*src/screens/", "@screens/"
            $newImport = $originalImport -replace [regex]::Escape($relativePath), $newPath
            $content = $content.Replace($originalImport, $newImport)
            $fileChanges += "Updated relative import to screens: $relativePath -> $newPath"
            $fileChanged = $true
        }
    }
    
    # Also handle imports from index files
    $content = $content -replace "from '\.\./(shared|features|entities|processes|screens|types)'", "from '@`$1'"
    $content = $content -replace 'from "\.\./(shared|features|entities|processes|screens|types)"', 'from "@$1"'
    
    if ($content -ne $originalContent -and $fileChanges.Count -eq 0) {
        $fileChanges += "Updated index imports"
        $fileChanged = $true
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

Write-Host "`nRelative import update complete!" -ForegroundColor Green
Write-Host "Total files scanned: $totalFiles" -ForegroundColor White
Write-Host "Files updated: $updatedFiles" -ForegroundColor White

# Generate summary report
if ($changes.Count -gt 0) {
    Write-Host "`nGenerating update report..." -ForegroundColor Yellow
    $report = @"
# FSD Relative Import Update Report
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
    
    $report | Out-File -FilePath "fsd-relative-import-update-report.md"
    Write-Host "Report saved to fsd-relative-import-update-report.md" -ForegroundColor Green
}
