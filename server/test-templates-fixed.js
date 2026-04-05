const { Resend } = require('resend');

async function testResendTemplatesFixed() {
  console.log('=== Testing Resend Templates (Fixed) ===');
  
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
    console.log('Testing user email with template ID...');
    
    // Test user email using template ID (not alias)
    const userResult = await resend.emails.send({
      from: 'Growphone <info@growphone.in>',
      to: testLeadData.email,
      subject: 'Thank you for contacting Growphone!',
      templateId: 'ef7400f8-c4eb-4a47-9ff7-a86fef453f6f',
      variables: testLeadData
    });
    
    console.log('✅ User email sent with template ID!');
    console.log('Result:', userResult);
    
    console.log('\nTesting admin email with template ID...');
    
    // Test admin email using template ID (not alias)
    const adminResult = await resend.emails.send({
      from: 'Growphone <info@growphone.in>',
      to: 'growphonedigital@gmail.com',
      subject: 'New Lead Received',
      templateId: '56fd67a3-d5ad-4a22-bd22-d9d5345baf49',
      variables: testLeadData
    });
    
    console.log('✅ Admin email sent with template ID!');
    console.log('Result:', adminResult);
    
    console.log('\n🎉 Both template emails sent successfully!');
    console.log('📧 Check both inboxes:');
    console.log('   User: nishilsoni01@gmail.com');
    console.log('   Admin: growphonedigital@gmail.com');
    
  } catch (error) {
    console.error('❌ Error sending template email:');
    console.error('Message:', error.message);
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
    if (error.responseBody) {
      console.error('Response:', error.responseBody);
    }
  }
}

testResendTemplatesFixed();
