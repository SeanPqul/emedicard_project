/**
 * Simple Maya Sandbox Test
 * Tests Maya checkout creation directly via API
 */

const https = require('https');

// Maya Sandbox Credentials
const MAYA_PUBLIC_KEY = 'pk-Z0OSzLvIcOI2UIvDhdTGVVfRSSeiGStnceqwUE7n0Ah';

// Test data for ₱60 payment
const checkoutData = {
  totalAmount: {
    value: 60.00,
    currency: 'PHP'
  },
  buyer: {
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    phone: '+639123456789'
  },
  items: [{
    name: 'eMediCard Health Card',
    description: 'Health card application fee',
    quantity: 1,
    code: 'EMEDICARD_60',
    amount: {
      value: 60.00,
      currency: 'PHP'
    },
    totalAmount: {
      value: 60.00,
      currency: 'PHP'
    }
  }],
  requestReferenceNumber: 'TEST_' + Date.now(),
  redirectUrl: {
    success: 'https://example.com/payment/success',
    failure: 'https://example.com/payment/failed', 
    cancel: 'https://example.com/payment/cancelled'
  }
};

console.log('🧪 Maya Sandbox Test - ₱60 Payment');
console.log('==================================');

const postData = JSON.stringify(checkoutData);

const options = {
  hostname: 'pg-sandbox.paymaya.com',
  port: 443,
  path: '/checkout/v1/checkouts',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length,
    'Authorization': `Basic ${Buffer.from(MAYA_PUBLIC_KEY + ':').toString('base64')}`
  }
};

console.log('🔄 Creating Maya checkout session...');

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      try {
        const result = JSON.parse(data);
        console.log('✅ Maya checkout created successfully!');
        console.log('');
        console.log(`💳 Checkout ID: ${result.checkoutId}`);
        console.log(`🔗 Checkout URL: ${result.redirectUrl}`);
        console.log('');
        console.log('🌐 You can test this checkout URL in a browser:');
        console.log('   ' + result.redirectUrl);
        console.log('');
        console.log('💡 Maya Sandbox Test Cards:');
        console.log('   Card Number: 4123 4500 0000 0008');
        console.log('   Expiry: 12/25');
        console.log('   CVV: 123');
        console.log('   3DS Password: mypassword');
        console.log('');
        console.log('📱 Mobile Testing:');
        console.log('   1. Open the checkout URL above in browser');
        console.log('   2. Complete payment with test card');
        console.log('   3. Verify redirect to: emedicardproject://payment/success');
        
      } catch (error) {
        console.error('❌ Failed to parse response:', error.message);
        console.log('Raw response:', data);
      }
    } else {
      console.error('❌ Maya API Error:');
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
      
      if (res.statusCode === 400) {
        console.log('');
        console.log('🔧 Common 400 issues:');
        console.log('   - Invalid JSON format in request');
        console.log('   - Missing required fields');
        console.log('   - Invalid amount format');
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('');
  console.log('🔧 Check:');
  console.log('   - Internet connection');
  console.log('   - Maya sandbox API is accessible');
});

req.write(postData);
req.end();
