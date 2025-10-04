# Theme Migration Script
# This script helps migrate from old theme constants to new unified theme

$files = @(
    "src/features/dashboard/components/StatsOverview/StatsOverview.styles.ts",
    "src/features/dashboard/components/QuickActionsGrid/QuickActionsGrid.styles.ts",
    "src/entities/application/ui/DocumentSourceModal/DocumentSourceModal.styles.ts",
    "src/features/dashboard/components/HealthCardStatus/HealthCardStatus.styles.ts",
    "src/features/dashboard/components/RecentActivityList/RecentActivityList.styles.ts",
    "src/features/dashboard/components/StatsOverview/StatsOverview.tsx",
    "src/features/dashboard/components/WelcomeBanner/WelcomeBanner.styles.ts",
    "src/screens/application/ApplyScreen/ApplyScreen.styles.ts",
    "src/screens/dashboard/DashboardScreen.styles.ts",
    "src/screens/application/ApplicationDetailScreen/ApplicationDetailScreen.styles.ts",
    "src/screens/application/ApplicationListScreen/ApplicationListScreen.styles.ts",
    "src/entities/application/ui/StepIndicator/StepIndicator.styles.ts",
    "src/entities/application/ui/DocumentSourceModal/DocumentSourceModal.tsx",
    "src/features/dashboard/components/DashboardHeader/DashboardHeader.styles.ts",
    "src/screens/application/ApplicationDetailScreen/ApplicationDetailScreen.tsx",
    "src/features/dashboard/components/PriorityAlerts/PriorityAlerts.styles.ts",
    "src/features/dashboard/components/ApplicationStatus/ApplicationStatus.styles.ts",
    "src/screens/auth/ResetPasswordScreen/ResetPasswordScreen.styles.ts",
    "src/features/auth/components/VerificationPage/VerificationPage.styles.ts",
    "src/shared/components/LoadingView/LoadingView.styles.ts",
    "src/shared/components/LoadingView/LoadingView.tsx",
    "src/shared/components/OfflineBanner/OfflineBanner.styles.ts"
)

Write-Host "Starting theme migration..." -ForegroundColor Green

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        # Read the file
        $content = Get-Content $file -Raw
        
        # Replace import statements
        if ($content -match "@shared/constants/theme") {
            $content = $content -replace "import\s*\{[^}]+\}\s*from\s*'@shared/constants/theme';?", "import { theme } from '@shared/styles/theme';"
            $content = $content -replace 'import\s*\{[^}]+\}\s*from\s*"@shared/constants/theme";?', "import { theme } from '@shared/styles/theme';"
            
            # Replace references
            $content = $content -replace '\bCOLORS\.', 'theme.colors.'
            $content = $content -replace '\bSPACING\.', 'theme.spacing.'
            $content = $content -replace '\bFONT_SIZES\.', 'theme.typography.'
            $content = $content -replace '\bFONT_WEIGHTS\.', 'theme.typography.'
            $content = $content -replace '\bBORDER_RADIUS\.', 'theme.borderRadius.'
            $content = $content -replace '\bSHADOWS\.', 'theme.shadows.'
            
            # Fix specific mappings
            $content = $content -replace 'theme\.colors\.primary\.main', 'theme.colors.brand.secondary'
            $content = $content -replace 'theme\.colors\.accent\.main', 'theme.colors.brand.primary'
            $content = $content -replace 'theme\.colors\.secondary\.main', 'theme.colors.blue[500]'
            
            # Fix shadow mappings
            $content = $content -replace 'theme\.shadows\.sm\b', 'theme.shadows.small'
            $content = $content -replace 'theme\.shadows\.md\b', 'theme.shadows.medium'
            $content = $content -replace 'theme\.shadows\.lg\b', 'theme.shadows.large'
            
            # Write back
            Set-Content $file $content -NoNewline -Encoding UTF8
            
            Write-Host "Migrated: $file" -ForegroundColor Green
        } else {
            Write-Host "No migration needed: $file" -ForegroundColor Cyan
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nMigration complete!" -ForegroundColor Green
