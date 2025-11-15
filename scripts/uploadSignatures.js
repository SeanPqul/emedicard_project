/**
 * Script to upload signature images to Convex Storage
 * 
 * Usage:
 * 1. Make sure your Convex dev server is running (npm run dev in backend)
 * 2. Run: node scripts/uploadSignatures.js
 * 3. Copy the storage IDs printed to console
 * 4. Update generateHealthCard.ts with those IDs
 */

const fs = require('fs');
const path = require('path');
const { ConvexHttpClient } = require('convex/browser');
const { api } = require('../backend/convex/_generated/api');

// Load env from root and backend .env files if present
try {
  const dotenv = require('dotenv');
  const rootEnv = path.join(__dirname, '../.env.local');
  const backendEnv = path.join(__dirname, '../backend/.env.local');
  if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });
  if (fs.existsSync(backendEnv)) dotenv.config({ path: backendEnv });
} catch (_) {
  // dotenv not installed or other issue; continue with process.env
}

// Your Convex deployment URL - supports multiple env var names
const CONVEX_URL =
  process.env.CONVEX_URL ||
  process.env.NEXT_PUBLIC_CONVEX_URL ||
  process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error('❌ Error: CONVEX_URL not found!');
  console.error('   Please set CONVEX_URL (or NEXT_PUBLIC_CONVEX_URL / VITE_CONVEX_URL) in .env.local');
  console.error('   Found no value in: .env.local (root) or backend/.env.local');
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Signature file paths
const SIGNATURES = [
  {
    path: path.join(__dirname, '../apps/webadmin/public/assests/signature/Marjorie_signature.png'),
    name: 'Marjorie_signature.png',
    type: 'doctor',
  },
  {
    path: path.join(__dirname, '../apps/webadmin/public/assests/signature/Luzminda_signature.png'),
    name: 'Luzminda_signature.png',
    type: 'sanitation_chief',
  },
];

async function uploadSignature(signatureInfo) {
  console.log(`\n📤 Uploading ${signatureInfo.name}...`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(signatureInfo.path)) {
      throw new Error(`File not found: ${signatureInfo.path}`);
    }

    // Read the file
    const fileBuffer = fs.readFileSync(signatureInfo.path);
    const blob = new Blob([fileBuffer], { type: 'image/png' });

    // Step 1: Generate upload URL
    const uploadUrl = await client.mutation(api.signatures.uploadSignatures.generateUploadUrl);
    
    // Step 2: Upload the file
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' },
      body: blob,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const { storageId } = await response.json();

    // Step 3: Store metadata
    const result = await client.mutation(api.signatures.uploadSignatures.storeSignature, {
      storageId,
      name: signatureInfo.name,
      type: signatureInfo.type,
    });

    console.log(`✅ Success!`);
    console.log(`   Storage ID: ${result.storageId}`);
    console.log(`   URL: ${result.url}`);
    
    return result;
  } catch (error) {
    console.error(`❌ Failed to upload ${signatureInfo.name}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting signature upload process...');
  console.log(`📍 Convex URL: ${CONVEX_URL}\n`);

  const results = {};

  for (const signature of SIGNATURES) {
    try {
      const result = await uploadSignature(signature);
      results[signature.type] = result.storageId;
    } catch (error) {
      console.error(`Failed to upload ${signature.name}`);
      process.exit(1);
    }
  }

  console.log('\n\n🎉 All signatures uploaded successfully!');
  console.log('\n📋 Copy these Storage IDs to your generateHealthCard.ts:\n');
  console.log('─'.repeat(70));
  console.log(`const DOCTOR_SIGNATURE_STORAGE_ID = "${results.doctor}";`);
  console.log(`const SANITATION_SIGNATURE_STORAGE_ID = "${results.sanitation_chief}";`);
  console.log('─'.repeat(70));
  console.log('\n✅ Done! Update generateHealthCard.ts with the IDs above.\n');
}

// Run the script
main().catch((error) => {
  console.error('❌ Upload failed:', error);
  process.exit(1);
});
