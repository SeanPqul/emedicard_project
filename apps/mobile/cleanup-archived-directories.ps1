# FSD Phase 9: Cleanup Archived Directories Script
# This script removes archived directories after confirming no references exist

Write-Host "Starting Phase 9: Cleanup of archived directories..." -ForegroundColor Green

# Define archived directories to remove
$archivedDirs = @(
    "src/archive/migration_v2_archived_2025_09_21",
    "src/_archived_components_20250921_154242",
    "convex_archived"
)

# Verify each directory exists before attempting removal
Write-Host "`nChecking for archived directories..." -ForegroundColor Yellow

$foundDirs = @()
foreach ($dir in $archivedDirs) {
    if (Test-Path $dir) {
        $foundDirs += $dir
        Write-Host "  Found: $dir" -ForegroundColor Cyan
    } else {
        Write-Host "  Not found: $dir (already removed or doesn't exist)" -ForegroundColor Gray
    }
}

if ($foundDirs.Count -eq 0) {
    Write-Host "`nNo archived directories found to remove." -ForegroundColor Yellow
    exit 0
}

# Search for any references to these directories in the codebase
Write-Host "`nSearching for references to archived directories..." -ForegroundColor Yellow

$hasReferences = $false
foreach ($dir in $foundDirs) {
    $escapedDir = [regex]::Escape($dir)
    $references = Get-ChildItem -Path . -Include *.ts,*.tsx,*.js,*.jsx,*.json -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -notlike "*\$dir\*" -and $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\docs\*" } |
        Select-String -Pattern $escapedDir -ErrorAction SilentlyContinue
    
    if ($references) {
        $hasReferences = $true
        Write-Host "  Found references to $dir in:" -ForegroundColor Red
        $references | ForEach-Object {
            $relativePath = $_.Path.Replace("$PWD\", "").Replace("\", "/")
            Write-Host "    - $relativePath : Line $($_.LineNumber)" -ForegroundColor Red
        }
    }
}

# Only proceed if no references found (excluding the migration plan doc)
if ($hasReferences) {
    Write-Host "`nError: Found references to archived directories in the codebase!" -ForegroundColor Red
    Write-Host "Please remove these references before running this cleanup script." -ForegroundColor Red
    exit 1
}

Write-Host "`nNo references found. Safe to remove archived directories." -ForegroundColor Green

# Prompt for confirmation
Write-Host "`nThe following directories will be permanently deleted:" -ForegroundColor Yellow
foreach ($dir in $foundDirs) {
    Write-Host "  - $dir" -ForegroundColor Cyan
}

Write-Host "`nDo you want to proceed? (y/N): " -ForegroundColor Yellow -NoNewline
$confirmation = Read-Host

if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "Cleanup cancelled by user." -ForegroundColor Yellow
    exit 0
}

# Remove directories
Write-Host "`nRemoving archived directories..." -ForegroundColor Yellow

$removedCount = 0
foreach ($dir in $foundDirs) {
    try {
        Remove-Item -Path $dir -Recurse -Force -ErrorAction Stop
        Write-Host "  Removed: $dir" -ForegroundColor Green
        $removedCount++
    } catch {
        Write-Host "  Failed to remove: $dir" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Red
    }
}

# Generate cleanup report
$report = @"
# Phase 9 Cleanup Report
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Directories Checked:
"@

foreach ($dir in $archivedDirs) {
    if ($dir -in $foundDirs) {
        $report += "`n- [x] $dir (removed)"
    } else {
        $report += "`n- [ ] $dir (not found)"
    }
}

$report += @"

## Summary:
- Total directories found: $($foundDirs.Count)
- Successfully removed: $removedCount
- Failed removals: $($foundDirs.Count - $removedCount)

## Next Steps:
1. Run 'git status' to see removed files
2. Commit the cleanup with: git commit -m "chore: remove archived directories (FSD Phase 9)"
3. Update FSD_MIGRATION_PLAN.md to mark Phase 9 as complete
"@

$report | Out-File -FilePath "phase-9-cleanup-report.md"

Write-Host "`nPhase 9 cleanup complete!" -ForegroundColor Green
Write-Host "Removed $removedCount of $($foundDirs.Count) directories." -ForegroundColor White
Write-Host "Report saved to phase-9-cleanup-report.md" -ForegroundColor Green
