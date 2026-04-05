const { Resend } = require('resend');

async function testResend() {
  console.log('=== Testing Resend Email Service ===');
  
  const apiKey = 're_N8JoAor1_2SC7utARKtxXtMhaA9LN7v8V';
  
  if (!apiKey) {
    console.log('❌ No API key provided');
    return;
  }
  
  console.log('✅ API Key found, testing email send...');
  
  const resend = new Resend(apiKey);
  
  try {
    // Test sending email directly
    console.log('Sending test email to nishilsoni01@gmail.com...');
    const result = await resend.emails.send({
      from: 'Growphone <info@growphone.in>',
      to: 'nishilsoni01@gmail.com',
      subject: '🧪 Resend Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">🧪 Resend Test Successful!</h2>
          <p>This is a test email to verify Resend is working properly.</p>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Test Details:</strong></p>
            <p>Service: Resend</p>
            <p>Time: ${new Date().toLocaleString()}</p>
            <p>Status: Working ✅</p>
          </div>
          <p>If you receive this email, Resend is properly configured!</p>
        </div>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Email ID:', result.data.id);
    console.log('From: Growphone <info@growphone.in>');
    console.log('To: nishilsoni01@gmail.com');
    console.log('Subject: 🧪 Resend Test Email');
    console.log('');
    console.log('📧 Check your inbox now!');
    
  } catch (error) {
    console.error('❌ Error sending email:');
    console.error('Message:', error.message);
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
    if (error.responseBody) {
      console.error('Response:', error.responseBody);
    }
  }
}

testResend();
