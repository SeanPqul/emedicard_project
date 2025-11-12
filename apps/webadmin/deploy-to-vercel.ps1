# eMediCard WebAdmin - Vercel Deployment Script
# This script helps deploy the webadmin to Vercel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " eMediCard WebAdmin - Vercel Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
if (-not $currentDir.Path.EndsWith("webadmin")) {
    Write-Host "Error: Please run this script from the apps/webadmin directory" -ForegroundColor Red
    exit 1
}

# Step 1: Check if Vercel CLI is installed
Write-Host "Step 1: Checking Vercel CLI..." -ForegroundColor Yellow
$vercelVersion = vercel --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
} else {
    Write-Host "Vercel CLI installed (version: $vercelVersion)" -ForegroundColor Green
}

# Step 2: Build test
Write-Host ""
Write-Host "Step 2: Testing build locally..." -ForegroundColor Yellow
Write-Host "Running: pnpm run build" -ForegroundColor Gray
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Please fix the errors above before deploying." -ForegroundColor Red
    exit 1
}
Write-Host "Build successful!" -ForegroundColor Green

# Step 3: Environment Variables Check
Write-Host ""
Write-Host "Step 3: Checking environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host ".env.local not found" -ForegroundColor Red
    Write-Host "Please create .env.local with your environment variables" -ForegroundColor Yellow
    exit 1
}
Write-Host ".env.local found" -ForegroundColor Green

# Step 4: Deployment instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Ready for Deployment!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now run the following commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Initialize Vercel project (first time only):" -ForegroundColor White
Write-Host "   vercel" -ForegroundColor Cyan
Write-Host ""
Write-Host "   When prompted:" -ForegroundColor Gray
Write-Host "   - Set up and deploy? Yes" -ForegroundColor Gray
Write-Host "   - Scope: Choose your account" -ForegroundColor Gray
Write-Host "   - Link to existing project? No (if new)" -ForegroundColor Gray
Write-Host "   - Project name: emedicard-webadmin" -ForegroundColor Gray
Write-Host "   - Directory: ./" -ForegroundColor Gray
Write-Host "   - Override settings? No" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Add environment variables:" -ForegroundColor White
Write-Host "   vercel env add NEXT_PUBLIC_CONVEX_URL production" -ForegroundColor Cyan
Write-Host "   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production" -ForegroundColor Cyan
Write-Host "   vercel env add CLERK_SECRET_KEY production" -ForegroundColor Cyan
Write-Host "   vercel env add CLERK_WEBHOOK_SECRET production" -ForegroundColor Cyan
Write-Host "   vercel env add CLERK_JWT_ISSUER_DOMAIN production" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Deploy to production:" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your environment variable values are in .env.local" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Important Notes:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "- DO NOT share or commit your .env.local file" -ForegroundColor Red
Write-Host "- The backend (Convex) must be deployed first" -ForegroundColor Yellow
Write-Host "- Mobile app files will not be affected" -ForegroundColor Green
Write-Host ""