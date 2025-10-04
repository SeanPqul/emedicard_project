const fs = require('fs');
const path = require('path');

const files = [
  'src/features/dashboard/components/StatsOverview/StatsOverview.styles.ts',
  'src/features/dashboard/components/QuickActionsGrid/QuickActionsGrid.styles.ts',
  'src/entities/application/ui/DocumentSourceModal/DocumentSourceModal.styles.ts',
  'src/features/dashboard/components/HealthCardStatus/HealthCardStatus.styles.ts',
  'src/features/dashboard/components/RecentActivityList/RecentActivityList.styles.ts',
  'src/features/dashboard/components/StatsOverview/StatsOverview.tsx',
  'src/features/dashboard/components/WelcomeBanner/WelcomeBanner.styles.ts',
  'src/screens/application/ApplyScreen/ApplyScreen.styles.ts',
  'src/screens/application/ApplicationDetailScreen/ApplicationDetailScreen.styles.ts',
  'src/screens/application/ApplicationListScreen/ApplicationListScreen.styles.ts',
  'src/entities/application/ui/StepIndicator/StepIndicator.styles.ts',
  'src/entities/application/ui/DocumentSourceModal/DocumentSourceModal.tsx',
  'src/features/dashboard/components/DashboardHeader/DashboardHeader.styles.ts',
  'src/screens/application/ApplicationDetailScreen/ApplicationDetailScreen.tsx',
  'src/features/dashboard/components/PriorityAlerts/PriorityAlerts.styles.ts',
  'src/screens/auth/ResetPasswordScreen/ResetPasswordScreen.styles.ts',
  'src/features/auth/components/VerificationPage/VerificationPage.styles.ts',
  'src/shared/components/LoadingView/LoadingView.styles.ts',
  'src/shared/components/LoadingView/LoadingView.tsx',
  'src/shared/components/OfflineBanner/OfflineBanner.styles.ts'
];

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if file needs migration
    if (content.includes('@shared/constants/theme')) {
      // Replace import statements
      content = content.replace(
        /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@shared\/constants\/theme['"];?/g,
        "import { theme } from '@shared/styles/theme';"
      );

      // Replace COLORS references
      content = content.replace(/\bCOLORS\./g, 'theme.colors.');
      
      // Replace SPACING references
      content = content.replace(/\bSPACING\./g, 'theme.spacing.');
      
      // Replace FONT_SIZES references with actual values
      content = content.replace(/\bFONT_SIZES\.xs\b/g, '12');
      content = content.replace(/\bFONT_SIZES\.sm\b/g, '14');
      content = content.replace(/\bFONT_SIZES\.md\b/g, '16');
      content = content.replace(/\bFONT_SIZES\.lg\b/g, '18');
      content = content.replace(/\bFONT_SIZES\.xl\b/g, '20');
      content = content.replace(/\bFONT_SIZES\.xxl\b/g, '24');
      content = content.replace(/\bFONT_SIZES\.xxxl\b/g, '32');
      content = content.replace(/\bFONT_SIZES\.micro\b/g, '10');
      
      // Replace FONT_WEIGHTS references
      content = content.replace(/\bFONT_WEIGHTS\.light\b/g, "'300' as const");
      content = content.replace(/\bFONT_WEIGHTS\.regular\b/g, "'400' as const");
      content = content.replace(/\bFONT_WEIGHTS\.medium\b/g, "'500' as const");
      content = content.replace(/\bFONT_WEIGHTS\.semibold\b/g, "'600' as const");
      content = content.replace(/\bFONT_WEIGHTS\.bold\b/g, "'700' as const");
      
      // Replace BORDER_RADIUS references
      content = content.replace(/\bBORDER_RADIUS\./g, 'theme.borderRadius.');
      
      // Replace SHADOWS references
      content = content.replace(/\bSHADOWS\.sm\b/g, 'theme.shadows.small');
      content = content.replace(/\bSHADOWS\.md\b/g, 'theme.shadows.medium');
      content = content.replace(/\bSHADOWS\.lg\b/g, 'theme.shadows.large');
      
      // Fix specific color mappings
      content = content.replace(/theme\.colors\.primary\.main/g, 'theme.colors.brand.secondary');
      content = content.replace(/theme\.colors\.accent\.main/g, 'theme.colors.brand.primary');
      content = content.replace(/theme\.colors\.secondary\.main/g, 'theme.colors.blue[500]');

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Migrated: ${filePath}`);
    } else {
      console.log(`- No migration needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

console.log('Starting theme migration...\n');

files.forEach(migrateFile);

console.log('\nMigration complete! Please review the changes.');
console.log('\nNote: You may need to manually fix:');
console.log('- Complex font size or weight expressions');
console.log('- Any custom color references');
console.log('- Import ordering or formatting');
