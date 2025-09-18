const https = require('https');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const webhookUrl = process.env.WEBHOOK_URL || 'https://tangible-pika-290.convex.site/maya-webhook';
const webhookSecret = process.env.MAYA_WEBHOOK_SECRET || 'whsec_test_webhook_secret';

// Sample Maya webhook payload
const payload = {
  id: "test_payment_" + Date.now(),
  paymentStatus: "PAYMENT_SUCCESS",
  status: "PAYMENT_SUCCESS",
  amount: {
    currency: "PHP",
    value: "100.00"
  },
  description: "Test webhook payload",
  requestReferenceNumber: "test_ref_" + Date.now(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  metadata: {
    applicationId: "test_application_id"
  }
};

// Create signature (Maya uses HMAC-SHA256)
const payloadString = JSON.stringify(payload);
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payloadString)
  .digest('hex');

console.log('🚀 Sending test webhook to:', webhookUrl);
console.log('📦 Payload:', JSON.stringify(payload, null, 2));
console.log('🔐 Signature:', signature);

// Parse URL
const url = new URL(webhookUrl);
const isHttps = url.protocol === 'https:';
const http = isHttps ? https : require('http');

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payloadString),
    'Maya-Signature': signature,
    'X-Maya-Signature': signature // Some implementations use this header
  }
};

const req = http.request(options, (res) => {
  console.log(`\n📨 Response Status: ${res.statusCode}`);
  console.log('📋 Response Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response Body:', data);
    
    if (res.statusCode === 200) {
      console.log('\n✅ Webhook test successful!');
    } else {
      console.log('\n❌ Webhook test failed!');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error sending webhook:', error.message);
});

req.write(payloadString);
req.end();
