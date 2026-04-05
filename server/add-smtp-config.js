const fs = require('fs');
const path = require('path');

// SMTP configuration to add
const smtpConfig = `

# --- SMTP: Zoho Mail (info@growphone.in) ---
# In Zoho: Mail → Settings → Mail Accounts → IMAP / SMTP — copy the SMTP host shown for your region.
# Common: smtp.zoho.com (port 587 TLS) or port 465 SSL. India-hosted accounts may use smtp.zoho.in — check Zoho.
# Use the mailbox password, or an App Password if Zoho requires 2FA.
SMTP_HOST=smtp.zoho.in
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@growphone.in
SMTP_PASS=yZ4yTUcuGX30
MAIL_FROM=info@growphone.in
ADMIN_NOTIFICATION_EMAIL=growphonedigital@gmail.com`;

const envPath = path.join(__dirname, '.env');

// Read current .env content
fs.readFile(envPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading .env file:', err);
    return;
  }
  
  // Check if SMTP config already exists
  if (data.includes('SMTP_HOST=')) {
    console.log('SMTP configuration already exists in .env file');
    return;
  }
  
  // Append SMTP configuration
  fs.appendFile(envPath, smtpConfig, 'utf8', (appendErr) => {
    if (appendErr) {
      console.error('Error appending to .env file:', appendErr);
      return;
    }
    console.log('✅ SMTP configuration added to .env file successfully!');
    console.log('Please restart the server for changes to take effect.');
  });
});
