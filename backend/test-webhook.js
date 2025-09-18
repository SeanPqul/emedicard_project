const crypto = require('crypto');

/**
 * Maya Webhook Testing and Debugging Script
 * 
 * This script helps debug Maya webhook integration issues by:
 * 1. Testing webhook endpoint connectivity
 * 2. Verifying signature generation
 * 3. Simulating different payment events
 * 4. Checking webhook processing
 */

// Configuration - Update these with your actual values
const CONFIG = {
  // Your webhook URL - update with your actual domain
  webhookUrl: process.env.WEBHOOK_URL || 'http://localhost:3000/maya-webhook',
  
  // Maya webhook secret - this should match what's in your .env
  webhookSecret: process.env.MAYA_WEBHOOK_SECRET || 'your_webhook_secret_here',
  
  // Test payment data
  testPaymentId: 'pay_test_' + Date.now(),
  testCheckoutId: 'checkout_test_' + Date.now(),
};

// Maya webhook event samples
const WEBHOOK_EVENTS = {
  PAYMENT_SUCCESS: {
    id: CONFIG.testPaymentId,
    status: 'PAYMENT_SUCCESS',
    paymentStatus: 'PAYMENT_SUCCESS',
    amount: {
      value: 100.00,
      currency: 'PHP'
    },
    requestReferenceNumber: 'EMC-TEST-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPaid: true,
    paymentScheme: 'maya',
    receiptNumber: 'RCP-' + Date.now(),
    metadata: {
      applicationId: 'test_application_id',
      userId: 'test_user_id'
    }
  },
  
  PAYMENT_FAILED: {
    id: CONFIG.testPaymentId,
    status: 'PAYMENT_FAILED',
    paymentStatus: 'PAYMENT_FAILED',
    amount: {
      value: 100.00,
      currency: 'PHP'
    },
    requestReferenceNumber: 'EMC-TEST-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPaid: false,
    failureReason: 'Insufficient funds',
    paymentScheme: 'maya',
    metadata: {
      applicationId: 'test_application_id',
      userId: 'test_user_id'
    }
  },
  
  PAYMENT_EXPIRED: {
    id: CONFIG.testPaymentId,
    status: 'PAYMENT_EXPIRED',
    paymentStatus: 'PAYMENT_EXPIRED',
    amount: {
      value: 100.00,
      currency: 'PHP'
    },
    requestReferenceNumber: 'EMC-TEST-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPaid: false,
    paymentScheme: 'maya',
    metadata: {
      applicationId: 'test_application_id',
      userId: 'test_user_id'
    }
  },
  
  CHECKOUT_SUCCESS: {
    id: CONFIG.testCheckoutId,
    checkoutId: CONFIG.testCheckoutId,
    paymentId: CONFIG.testPaymentId,
    status: 'CHECKOUT_SUCCESS',
    paymentStatus: 'CHECKOUT_SUCCESS',
    checkoutStatus: 'COMPLETED',
    requestReferenceNumber: 'EMC-TEST-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
};

/**
 * Generate Maya webhook signature
 * Maya uses HMAC-SHA256 for webhook signatures
 */
function generateMayaSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Send webhook request to endpoint
 */
async function sendWebhook(eventType, eventData) {
  console.log(`\n🚀 Testing ${eventType} webhook...`);
  console.log('📦 Payload:', JSON.stringify(eventData, null, 2));
  
  const payload = JSON.stringify(eventData);
  const signature = generateMayaSignature(payload, CONFIG.webhookSecret);
  
  console.log('🔐 Generated signature:', signature);
  console.log('🌐 Webhook URL:', CONFIG.webhookUrl);
  
  try {
    const response = await fetch(CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Maya-Signature': signature,
      },
      body: payload,
    });
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    if (responseText) {
      console.log('📊 Response body:', responseText);
    }
    
    if (response.ok) {
      console.log(`✅ ${eventType} webhook successful!`);
    } else {
      console.log(`❌ ${eventType} webhook failed!`);
    }
    
    return response;
  } catch (error) {
    console.error(`💥 Error sending ${eventType} webhook:`, error);
    return null;
  }
}

/**
 * Test webhook connectivity
 */
async function testConnectivity() {
  console.log('🔌 Testing webhook endpoint connectivity...\n');
  
  try {
    const response = await fetch(CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true }),
    });
    
    if (response.status === 401) {
      console.log('✅ Endpoint reachable - expecting signature validation (401 is expected)');
    } else {
      console.log(`⚠️  Unexpected response: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Cannot reach webhook endpoint:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Make sure your Convex dev server is running: npx convex dev');
    console.log('   2. Check if the webhook URL is correct:', CONFIG.webhookUrl);
    console.log('   3. If using a local URL, make sure the port is correct');
    console.log('   4. For production, ensure your domain is accessible');
  }
}

/**
 * Debug signature validation
 */
function debugSignature() {
  console.log('\n🔐 Debugging signature validation...\n');
  
  const testPayload = JSON.stringify({ test: 'data' });
  const testSecret = 'test_secret';
  const signature = generateMayaSignature(testPayload, testSecret);
  
  console.log('Test payload:', testPayload);
  console.log('Test secret:', testSecret);
  console.log('Generated signature:', signature);
  console.log('\nSignature validation process:');
  console.log('1. Maya sends the raw JSON payload in the request body');
  console.log('2. Maya includes the signature in the "Maya-Signature" header');
  console.log('3. Your webhook should compute HMAC-SHA256(payload, secret)');
  console.log('4. Compare the computed signature with the header value');
  console.log('\nCommon issues:');
  console.log('- Wrong webhook secret in environment variables');
  console.log('- Payload modified before signature validation');
  console.log('- Character encoding issues');
}

/**
 * Test all webhook events
 */
async function testAllEvents() {
  console.log('\n🧪 Testing Maya Webhook Events');
  console.log('=====================================\n');
  
  // Test connectivity first
  await testConnectivity();
  
  // Debug signature
  debugSignature();
  
  console.log('\n📨 Sending test webhook events...\n');
  
  // Test each event type
  for (const [eventType, eventData] of Object.entries(WEBHOOK_EVENTS)) {
    await sendWebhook(eventType, eventData);
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✨ Webhook testing complete!\n');
  console.log('🔍 Next steps:');
  console.log('1. Check your Convex logs for webhook processing');
  console.log('2. Verify payment records were created/updated in the database');
  console.log('3. Check for any error messages in the logs');
  console.log('4. Ensure MAYA_WEBHOOK_SECRET is set correctly in your environment');
}

/**
 * Test specific payment ID
 */
async function testSpecificPayment(mayaPaymentId) {
  console.log(`\n🎯 Testing webhook for specific payment: ${mayaPaymentId}\n`);
  
  const event = {
    ...WEBHOOK_EVENTS.PAYMENT_SUCCESS,
    id: mayaPaymentId,
    paymentId: mayaPaymentId,
  };
  
  await sendWebhook('PAYMENT_SUCCESS', event);
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'test':
    testAllEvents();
    break;
  case 'connectivity':
    testConnectivity();
    break;
  case 'signature':
    debugSignature();
    break;
  case 'payment':
    if (args[1]) {
      testSpecificPayment(args[1]);
    } else {
      console.log('Usage: node test-webhook.js payment <maya_payment_id>');
    }
    break;
  default:
    console.log('Maya Webhook Testing Script');
    console.log('==========================\n');
    console.log('Usage:');
    console.log('  node test-webhook.js test         - Run all tests');
    console.log('  node test-webhook.js connectivity - Test endpoint connectivity');
    console.log('  node test-webhook.js signature    - Debug signature validation');
    console.log('  node test-webhook.js payment <id> - Test specific payment webhook');
    console.log('\nEnvironment variables:');
    console.log('  WEBHOOK_URL          - Your webhook endpoint URL');
    console.log('  MAYA_WEBHOOK_SECRET  - Your Maya webhook secret');
}
