const { Resend } = require('resend');

async function testResendCorrectTemplateAPI() {
  console.log('=== Testing Correct Resend Template API ===');
  
  const apiKey = 're_N8JoAor1_2SC7utARKtxXtMhaA9LN7v8V';
  const resend = new Resend(apiKey);
  
  // Test data
  const testLeadData = {
    name: 'Test User',
    email: 'nishilsoni01@gmail.com',
    businessType: 'E-commerce',
    phone: '+91 98765 43210',
    budget: '₹50,000 - ₹1,00,000',
    submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };
  
  try {
    console.log('Testing with correct template API format...');
    
    // Try the correct Resend template format
    const userResult = await resend.emails.send({
      from: 'Growphone <info@growphone.in>',
      to: testLeadData.email,
      subject: 'Thank you for contacting Growphone!',
      template: {
        id: 'ef7400f8-c4eb-4a47-9ff7-a86fef453f6f',
        data: testLeadData
      }
    });
    
    console.log('✅ User email sent with correct template format!');
    console.log('Result:', userResult);
    
  } catch (error) {
    console.error('❌ Error with template format:');
    console.error('Message:', error.message);
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
    if (error.responseBody) {
      console.error('Response:', error.responseBody);
    }
  }
}

testResendCorrectTemplateAPI();
