# Setup Convex Deploy Key for Vercel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Setting up Convex Deploy Key for Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 1: Get your Convex Deploy Key" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "1. The Convex Dashboard should have opened in your browser" -ForegroundColor White
Write-Host "2. Go to Settings (gear icon)" -ForegroundColor White
Write-Host "3. Click on 'Deploy Keys' in the left sidebar" -ForegroundColor White
Write-Host "4. Click 'Generate a deploy key'" -ForegroundColor White
Write-Host "5. Copy the generated key (starts with 'prod:')" -ForegroundColor White
Write-Host ""
Write-Host "Dashboard URL: https://dashboard.convex.dev/d/tangible-pika-290/settings/deploy-keys" -ForegroundColor Cyan
Write-Host ""

$deployKey = Read-Host "Paste your Convex Deploy Key here (it starts with 'prod:')"

if (-not $deployKey.StartsWith("prod:")) {
    Write-Host "Error: Deploy key should start with 'prod:'" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "STEP 2: Adding Deploy Key to Vercel" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Gray
Write-Host ""

# Navigate to webadmin directory
cd apps\webadmin 2>$null

Write-Host "Adding CONVEX_DEPLOY_KEY to Vercel..." -ForegroundColor White
vercel env add CONVEX_DEPLOY_KEY production

Write-Host ""
Write-Host "When prompted, paste this value:" -ForegroundColor Yellow
Write-Host $deployKey -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 3: Redeploy to Vercel" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "After adding the environment variable, run:" -ForegroundColor White
Write-Host "vercel --prod" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host " Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your webadmin should now deploy successfully!" -ForegroundColor Green