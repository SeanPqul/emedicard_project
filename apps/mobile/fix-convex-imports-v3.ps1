# Fix convex imports script v3
$projectRoot = "C:\Users\User\Documents\GitHub\emedicard_project\apps\mobile"
$srcPath = "$projectRoot\src"

# Find all TypeScript files
$files = Get-ChildItem -Path $srcPath -Recurse -Include "*.ts", "*.tsx" -File

$fixCount = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Fix incorrect absolute imports from /api and /dataModel
    $content = $content -replace "from '/api'", "from '../../../convex/_generated/api'"
    $content = $content -replace 'from "/api"', 'from "../../../convex/_generated/api"'
    $content = $content -replace "from '/dataModel'", "from '../../../convex/_generated/dataModel'"
    $content = $content -replace 'from "/dataModel"', 'from "../../../convex/_generated/dataModel"'
    
    # Write back only if content changed
    if ($content -ne $originalContent) {
        Write-Host "Fixed: $($file.FullName)"
        Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
        $fixCount++
    }
}

Write-Host "`nFixed $fixCount files with convex imports"
