#!/usr/bin/env node

/**
 * Generate Convex files for build without requiring deployment credentials
 * This script is used in Vercel builds to bypass the deployment key requirement
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Set environment to bypass Vercel detection
process.env.VERCEL = '';
process.env.CI = '';

// Set the Convex URL
process.env.CONVEX_URL = 'https://tangible-pika-290.convex.cloud';

// Change to backend directory
const backendPath = path.join(__dirname, '..', 'backend');
process.chdir(backendPath);

console.log('Generating Convex files...');

try {
  // Run convex codegen
  execSync('npx convex codegen', {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Override Vercel environment detection
      VERCEL: '',
      CI: '',
      CONVEX_URL: 'https://tangible-pika-290.convex.cloud'
    }
  });
  
  console.log('✓ Convex files generated successfully');
  
  // Verify the files were created
  const generatedPath = path.join(backendPath, 'convex', '_generated');
  if (fs.existsSync(generatedPath)) {
    const files = fs.readdirSync(generatedPath);
    console.log(`✓ Generated ${files.length} files in convex/_generated/`);
  }
  
} catch (error) {
  console.error('Failed to generate Convex files:', error.message);
  process.exit(1);
}