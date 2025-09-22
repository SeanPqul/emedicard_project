# Fix convex imports script v2
$projectRoot = "C:\Users\User\Documents\GitHub\emedicard_project\apps\mobile"
$srcPath = "$projectRoot\src"

# Find all TypeScript files
$files = Get-ChildItem -Path $srcPath -Recurse -Include "*.ts", "*.tsx" -File

$fixCount = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Fix backend convex imports
    # Replace ../../../../../backend/convex/_generated/api with appropriate relative path
    $content = $content -replace "from '\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/backend\/convex\/_generated\/api'", "from '../../../convex/_generated/api'"
    $content = $content -replace 'from "\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/backend\/convex\/_generated\/api"', 'from "../../../convex/_generated/api"'
    $content = $content -replace "from '\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/backend\/convex\/_generated\/dataModel'", "from '../../../convex/_generated/dataModel'"
    $content = $content -replace 'from "\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/backend\/convex\/_generated\/dataModel"', 'from "../../../convex/_generated/dataModel"'
    
    # Write back only if content changed
    if ($content -ne $originalContent) {
        Write-Host "Fixed: $($file.Name)"
        Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
        $fixCount++
    }
}

Write-Host "`nFixed $fixCount files with convex imports"
