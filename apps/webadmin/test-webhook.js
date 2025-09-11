const crypto = require('crypto');

// Mock webhook data for testing
const mockWebhookData = {
  type: "user.created",
  data: {
    id: "user_test_" + Date.now(),
    email_addresses: [
      {
        email_address: "test.user@example.com"
      }
    ],
    first_name: "Test",
    last_name: "User",
    image_url: "https://example.com/avatar.jpg"
  }
};

// Mock webhook secret (you would need to set this in your .env.local)
const WEBHOOK_SECRET = "whsec_test_secret_key_for_testing";

// Generate mock Svix headers
function generateSvixHeaders(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const body = JSON.stringify(payload);
  
  // Create signature (simplified version - in real implementation, this would be more complex)
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');
  
  return {
    'svix-id': 'msg_test_' + Date.now(),
    'svix-timestamp': timestamp.toString(),
    'svix-signature': `v1,${signature}`,
    'content-type': 'application/json'
  };
}

async function testWebhook() {
  console.log('🚀 Starting Clerk webhook integration test...\n');
  
  try {
    // Generate headers
    const headers = generateSvixHeaders(mockWebhookData, WEBHOOK_SECRET);
    
    console.log('📦 Mock webhook payload:');
    console.log(JSON.stringify(mockWebhookData, null, 2));
    console.log('\n📋 Generated headers:');
    console.log(headers);
    
    // Send webhook request
    console.log('\n📡 Sending webhook request to http://localhost:3001/clerk-webhook...');
    
    const response = await fetch('http://localhost:3001/clerk-webhook', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(mockWebhookData)
    });
    
    console.log(`\n📊 Response status: ${response.status}`);
    console.log(`📊 Response status text: ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`📊 Response body: ${responseText}`);
    
    if (response.ok) {
      console.log('\n✅ Webhook request successful!');
      console.log('\n🔍 Now check your Convex dashboard to verify the user was created:');
      console.log('   - User ID:', mockWebhookData.data.id);
      console.log('   - Email:', mockWebhookData.data.email_addresses[0].email_address);
      console.log('   - Name:', `${mockWebhookData.data.first_name} ${mockWebhookData.data.last_name}`);
      console.log('\n🌐 Convex Dashboard: https://dashboard.convex.dev/d/tangible-pika-290');
    } else {
      console.log('\n❌ Webhook request failed!');
      console.log('   This might be due to:');
      console.log('   1. Missing CLERK_WEBHOOK_SECRET in .env.local');
      console.log('   2. Incorrect webhook signature verification');
      console.log('   3. Server not running or database connection issues');
    }
    
  } catch (error) {
    console.error('\n💥 Error testing webhook:', error);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Make sure Next.js dev server is running (npm run dev)');
    console.log('   2. Make sure Convex dev is running (npx convex dev)');
    console.log('   3. Check if CLERK_WEBHOOK_SECRET is set in .env.local');
    console.log('   4. Verify the webhook endpoint is accessible');
  }
}

// Alternative: Test without signature verification (for debugging)
async function testWebhookWithoutVerification() {
  console.log('\n🔧 Testing webhook without signature verification...');
  
  // Create a simpler payload that bypasses verification
  const simplePayload = {
    type: "user.created",
    data: {
      id: "user_debug_" + Date.now(),
      email_addresses: [{ email_address: "debug.user@example.com" }],
      first_name: "Debug",
      last_name: "User",
      image_url: "https://example.com/debug-avatar.jpg"
    }
  };
  
  try {
    const response = await fetch('http://localhost:3001/clerk-webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        // Provide minimal headers to test basic functionality
        'svix-id': 'debug_msg_id',
        'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
        'svix-signature': 'debug_signature'
      },
      body: JSON.stringify(simplePayload)
    });
    
    console.log(`Debug response status: ${response.status}`);
    const debugResponseText = await response.text();
    console.log(`Debug response: ${debugResponseText}`);
    
  } catch (error) {
    console.error('Debug test error:', error);
  }
}

// Run the tests
console.log('🧪 Clerk Webhook Integration Test');
console.log('=====================================');

testWebhook().then(() => {
  console.log('\n🔄 Running additional debug test...');
  return testWebhookWithoutVerification();
});
