const { Resend } = require('resend');

async function checkResendTemplates() {
  console.log('=== Checking Resend Templates ===');
  
  const apiKey = 're_N8JoAor1_2SC7utARKtxXtMhaA9LN7v8V';
  const resend = new Resend(apiKey);
  
  try {
    console.log('Fetching available templates...');
    
    // Try to get templates list
    const templates = await resend.templates.list();
    console.log('✅ Templates found:');
    console.log(JSON.stringify(templates, null, 2));
    
  } catch (error) {
    console.error('❌ Error fetching templates:');
    console.error('Message:', error.message);
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
    if (error.responseBody) {
      console.error('Response:', error.responseBody);
    }
  }
}

checkResendTemplates();
