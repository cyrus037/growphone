require('dotenv').config();
const { Resend } = require('resend');

console.log('=== Resend Email Configuration Check ===');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET');
console.log('MAIL_FROM:', process.env.MAIL_FROM || 'NOT SET');
console.log('ADMIN_NOTIFICATION_EMAIL:', process.env.ADMIN_NOTIFICATION_EMAIL || 'NOT SET');

if (!process.env.RESEND_API_KEY) {
  console.log('\n❌ Resend API key is not configured. Emails cannot be sent.');
  console.log('\nTo fix this, add this line to your server/.env file:');
  console.log('RESEND_API_KEY=re_your_resend_api_key_here');
  console.log('\nGet your API key from: https://resend.com/api-keys');
} else {
  console.log('\n✅ Resend API key found. Testing connection...');
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  // Test by attempting to get API keys (this validates the key)
  resend.apiKeys.get()
    .then(() => {
      console.log('✅ Resend connection successful! Emails should work.');
      process.exit(0);
    })
    .catch(err => {
      console.log('❌ Resend connection failed:', err.message);
      process.exit(1);
    });
}
