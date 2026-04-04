require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('=== SMTP Configuration Check ===');
console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
console.log('SMTP_SECURE:', process.env.SMTP_SECURE || 'NOT SET');
console.log('MAIL_FROM:', process.env.MAIL_FROM || 'NOT SET');
console.log('ADMIN_NOTIFICATION_EMAIL:', process.env.ADMIN_NOTIFICATION_EMAIL || 'NOT SET');

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.log('\n❌ SMTP is not configured. Emails cannot be sent.');
  console.log('\nTo fix this, add these lines to your server/.env file:');
  console.log('SMTP_HOST=smtp.zoho.com');
  console.log('SMTP_PORT=587');
  console.log('SMTP_SECURE=false');
  console.log('SMTP_USER=info@growphone.in');
  console.log('SMTP_PASS=your_zoho_password');
  console.log('MAIL_FROM=info@growphone.in');
  console.log('ADMIN_NOTIFICATION_EMAIL=growphonedigital@gmail.com');
} else {
  console.log('\n✅ SMTP configuration found. Testing connection...');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    ...(parseInt(process.env.SMTP_PORT || '587') === 587 && process.env.SMTP_SECURE !== 'true' ? { requireTLS: true } : {}),
  });
  
  transporter.verify()
    .then(() => {
      console.log('✅ SMTP connection successful! Emails should work.');
      process.exit(0);
    })
    .catch(err => {
      console.log('❌ SMTP connection failed:', err.message);
      process.exit(1);
    });
}
