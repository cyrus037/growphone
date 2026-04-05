const { Resend } = require('resend');

async function testResendWithTemplate() {
  console.log('=== Testing Resend with Templates ===');
  
  const apiKey = 're_N8JoAor1_2SC7utARKtxXtMhaA9LN7v8V';
  
  if (!apiKey) {
    console.log('❌ No API key provided');
    return;
  }
  
  console.log('✅ API Key found, testing with templates...');
  
  const resend = new Resend(apiKey);
  
  // Test data (simulating a lead submission)
  const testLeadData = {
    name: 'Test User',
    email: 'nishilsoni01@gmail.com',
    businessType: 'E-commerce',
    phone: '+91 98765 43210',
    budget: '₹50,000 - ₹1,00,000',
    submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };
  
  try {
    console.log('Testing user email with "inquiry-received" template...');
    
    // Test user email template
    const userResult = await resend.emails.send({
      from: 'Growphone <info@growphone.in>',
      to: testLeadData.email,
      subject: 'Thank you for contacting Growphone!',
      template: 'inquiry-received',
      variables: testLeadData
    });
    
    console.log('✅ User email sent with template!');
    console.log('User Email Result:', userResult);
    console.log('Template: inquiry-received');
    console.log('Variables:', testLeadData);
    
    console.log('\nTesting admin email with "new-lead" template...');
    
    // Test admin email template
    const adminResult = await resend.emails.send({
      from: 'Growphone <info@growphone.in>',
      to: 'growphonedigital@gmail.com',
      subject: 'New Lead Received',
      template: 'new-lead',
      variables: testLeadData
    });
    
    console.log('✅ Admin email sent with template!');
    console.log('Admin Email Result:', adminResult);
    console.log('Template: new-lead');
    console.log('Variables:', testLeadData);
    
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

testResendWithTemplate();
