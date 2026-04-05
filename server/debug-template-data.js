const { Resend } = require('resend');

async function debugTemplateData() {
  console.log('=== Debugging Template Data ===');
  
  const apiKey = 're_N8JoAor1_2SC7utARKtxXtMhaA9LN7v8V';
  const resend = new Resend(apiKey);
  
  // Simulate lead data from form (same as leads.js)
  const mockLead = {
    name: 'Test User',
    email: 'nishilsoni01@gmail.com',
    businessType: 'E-commerce',
    phone: '+91 98765 43210',
    budget: '₹50,000 - ₹1,00,000',
    createdAt: new Date()
  };
  
  // Simulate leadVars function from mailService.js
  const submittedAt = mockLead.createdAt
    ? new Date(mockLead.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    
  const vars = {
    name: mockLead.name || '',
    email: mockLead.email || '',
    businessType: mockLead.businessType || '',
    phone: mockLead.phone || '',
    budget: mockLead.budget || '',
    submittedAt,
  };
  
  console.log('=== Lead Data ===');
  console.log('Original lead:', JSON.stringify(mockLead, null, 2));
  console.log('');
  
  console.log('=== Processed Variables ===');
  console.log('Vars object:', JSON.stringify(vars, null, 2));
  console.log('');
  
  console.log('=== Template Data Structure ===');
  const templateData = {
    name: vars.name,
    email: vars.email,
    businessType: vars.businessType,
    phone: vars.phone,
    budget: vars.budget,
    submittedAt: vars.submittedAt
  };
  
  console.log('Template data:', JSON.stringify(templateData, null, 2));
  console.log('');
  
  try {
    console.log('=== Sending Test Email with Debug Info ===');
    const result = await resend.emails.send({
      from: 'Growphone <info@growphone.in>',
      to: 'nishilsoni01@gmail.com',
      subject: '🔍 DEBUG: Template Data Test',
      template: {
        id: 'ef7400f8-c4eb-4a47-9ff7-a86fef453f6f',
        data: templateData
      }
    });
    
    console.log('✅ Debug email sent!');
    console.log('Email ID:', result.data.id);
    console.log('');
    console.log('📧 Check your email for the template content!');
    console.log('If variables are still empty, the issue is in Resend template configuration.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugTemplateData();
