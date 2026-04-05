const { Resend } = require('resend');

async function testResendVariableFormat() {
  console.log('=== Testing Resend Variable Format ===');
  
  const apiKey = 're_N8JoAor1_2SC7utARKtxXtMhaA9LN7v8V';
  const resend = new Resend(apiKey);
  
  // Test with different variable formats Resend might expect
  const testFormats = [
    {
      name: 'Format 1: Direct variables',
      data: {
        name: 'Test User',
        email: 'nishilsoni01@gmail.com',
        businessType: 'E-commerce',
        phone: '+91 98765 43210',
        budget: '₹50,000 - ₹1,00,000',
        submittedAt: '5/4/2026, 1:41:36 pm'
      }
    },
    {
      name: 'Format 2: Nested data object',
      data: {
        data: {
          name: 'Test User',
          email: 'nishilsoni01@gmail.com',
          businessType: 'E-commerce',
          phone: '+91 98765 43210',
          budget: '₹50,000 - ₹1,00,000',
          submittedAt: '5/4/2026, 1:41:36 pm'
        }
      }
    },
    {
      name: 'Format 3: Simple HTML with variables',
      html: `
        <h2>Hello Test User!</h2>
        <p><strong>Email:</strong> nishilsoni01@gmail.com</p>
        <p><strong>Business:</strong> E-commerce</p>
        <p><strong>Phone:</strong> +91 98765 43210</p>
        <p><strong>Budget:</strong> ₹50,000 - ₹1,00,000</p>
        <p><strong>Submitted:</strong> 5/4/2026, 1:41:36 pm</p>
      `
    }
  ];
  
  for (let i = 0; i < testFormats.length; i++) {
    const format = testFormats[i];
    console.log(`\n=== ${format.name} ===`);
    
    try {
      const emailData = {
        from: 'Growphone <info@growphone.in>',
        to: 'nishilsoni01@gmail.com',
        subject: `Test ${i + 1}: ${format.name}`,
        ...format
      };
      
      const result = await resend.emails.send(emailData);
      console.log(`✅ Format ${i + 1} sent successfully!`);
      console.log(`Email ID: ${result.data.id}`);
      
    } catch (error) {
      console.log(`❌ Format ${i + 1} failed:`, error.message);
    }
    
    // Wait between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📧 Check all 3 test emails in your inbox!');
  console.log('Format 3 (HTML) should definitely work and show all data.');
}

testResendVariableFormat();
