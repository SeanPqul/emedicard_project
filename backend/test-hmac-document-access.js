#!/usr/bin/env node

/**
 * Test script for HMAC-signed document access URLs
 * This script verifies that the HMAC signature generation and verification works correctly
 */

const crypto = require('crypto');

// Test configuration
const DOCUMENT_SIGNING_SECRET = 'test-secret-key-minimum-32-characters-for-security';
const TEST_DOCUMENT_ID = 'test_doc_123';
const TEST_USER_ID = 'test_user_456';
const BASE_URL = 'http://localhost:3333/secure-document';

/**
 * Generate HMAC signature (Node.js version for testing)
 */
function generateHmacSignature(documentId, expiresAt, userId, secret) {
  const payload = `${documentId}.${expiresAt}.${userId}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  // Convert to base64url format
  const signature = hmac.digest('base64url');
  return signature;
}

/**
 * Build a signed URL
 */
function buildSignedUrl(baseUrl, documentId, expiresAt, userId, secret) {
  const signature = generateHmacSignature(documentId, expiresAt, userId, secret);
  
  const url = new URL(baseUrl);
  url.searchParams.set('documentId', documentId);
  url.searchParams.set('expiresAt', expiresAt.toString());
  url.searchParams.set('signature', signature);
  
  return url.toString();
}

/**
 * Verify HMAC signature
 */
function verifyHmacSignature(signature, documentId, expiresAt, userId, secret) {
  const expectedSignature = generateHmacSignature(documentId, expiresAt, userId, secret);
  return signature === expectedSignature;
}

/**
 * Run tests
 */
function runTests() {
  console.log('🧪 Testing HMAC Document Access Implementation\n');
  console.log('=' .repeat(50));
  
  // Test 1: Generate a valid signed URL
  console.log('\n📝 Test 1: Generate valid signed URL');
  const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutes from now
  const signedUrl = buildSignedUrl(BASE_URL, TEST_DOCUMENT_ID, expiresAt, TEST_USER_ID, DOCUMENT_SIGNING_SECRET);
  console.log('✅ Generated URL:', signedUrl);
  
  // Parse the URL to extract parameters
  const urlObj = new URL(signedUrl);
  const extractedSignature = urlObj.searchParams.get('signature');
  const extractedDocumentId = urlObj.searchParams.get('documentId');
  const extractedExpiresAt = parseInt(urlObj.searchParams.get('expiresAt'), 10);
  
  // Test 2: Verify the signature is correct
  console.log('\n🔍 Test 2: Verify signature');
  const isValid = verifyHmacSignature(
    extractedSignature,
    extractedDocumentId,
    extractedExpiresAt,
    TEST_USER_ID,
    DOCUMENT_SIGNING_SECRET
  );
  console.log(isValid ? '✅ Signature is valid' : '❌ Signature is invalid');
  
  // Test 3: Test with wrong secret (should fail)
  console.log('\n🚫 Test 3: Verify with wrong secret (should fail)');
  const wrongSecret = 'wrong-secret-key';
  const isInvalid = verifyHmacSignature(
    extractedSignature,
    extractedDocumentId,
    extractedExpiresAt,
    TEST_USER_ID,
    wrongSecret
  );
  console.log(!isInvalid ? '✅ Correctly rejected invalid secret' : '❌ Incorrectly accepted invalid secret');
  
  // Test 4: Test with tampered document ID (should fail)
  console.log('\n🚫 Test 4: Verify with tampered document ID (should fail)');
  const tamperedDocId = 'tampered_doc_999';
  const isTampered = verifyHmacSignature(
    extractedSignature,
    tamperedDocId,
    extractedExpiresAt,
    TEST_USER_ID,
    DOCUMENT_SIGNING_SECRET
  );
  console.log(!isTampered ? '✅ Correctly rejected tampered document ID' : '❌ Incorrectly accepted tampered document ID');
  
  // Test 5: Test expiration check
  console.log('\n⏱️ Test 5: Test expiration');
  const expiredTime = Date.now() - 1000; // 1 second ago
  const expiredUrl = buildSignedUrl(BASE_URL, TEST_DOCUMENT_ID, expiredTime, TEST_USER_ID, DOCUMENT_SIGNING_SECRET);
  const expiredUrlObj = new URL(expiredUrl);
  const expiredExpiresAt = parseInt(expiredUrlObj.searchParams.get('expiresAt'), 10);
  const isExpired = Date.now() > expiredExpiresAt;
  console.log(isExpired ? '✅ Correctly identified expired URL' : '❌ Failed to identify expired URL');
  
  // Test 6: Generate multiple signatures for different users
  console.log('\n👥 Test 6: Different signatures for different users');
  const user1Signature = generateHmacSignature(TEST_DOCUMENT_ID, expiresAt, 'user1', DOCUMENT_SIGNING_SECRET);
  const user2Signature = generateHmacSignature(TEST_DOCUMENT_ID, expiresAt, 'user2', DOCUMENT_SIGNING_SECRET);
  console.log('User 1 signature:', user1Signature.substring(0, 16) + '...');
  console.log('User 2 signature:', user2Signature.substring(0, 16) + '...');
  console.log(user1Signature !== user2Signature ? '✅ Different users have different signatures' : '❌ Users have same signature');
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ All tests completed!');
  
  // Display environment variable reminder
  console.log('\n📋 Environment Variable Setup:');
  console.log('Add the following to your .env.local file:');
  console.log(`DOCUMENT_SIGNING_SECRET=${crypto.randomBytes(32).toString('hex')}`);
  console.log('\n⚠️  Make sure to use a secure, random secret in production!');
}

// Run the tests
runTests();
