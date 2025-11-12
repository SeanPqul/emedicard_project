# PowerShell script to fix all Convex imports in webadmin
# This script will replace all @/convex imports with backend/convex imports

Write-Host "Fixing Convex imports in webadmin..." -ForegroundColor Green

# Get all TypeScript/JavaScript files in webadmin src
$files = Get-ChildItem -Path "apps\webadmin\src" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx"

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace the imports
    $content = $content -replace "from ['`"]@/convex/_generated/api['`"]", "from 'backend/convex/_generated/api'"
    $content = $content -replace "from ['`"]@/convex/_generated/dataModel['`"]", "from 'backend/convex/_generated/dataModel'"
    $content = $content -replace "from ['`"]@/convex/_generated/server['`"]", "from 'backend/convex/_generated/server'"
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)" -ForegroundColor Yellow
        $count++
    }
}

Write-Host "`nFixed $count files!" -ForegroundColor Green
Write-Host "Now update tsconfig.json to remove the @/convex path mapping" -ForegroundColor Cyan