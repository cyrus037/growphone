require('dotenv').config();
const mongoose = require('mongoose');
const EmailTemplate = require('./models/EmailTemplate');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const templates = await EmailTemplate.find({});
    console.log(`\nEmail templates found: ${templates.length}\n`);
    
    templates.forEach(t => {
      console.log(`- ${t.name} (${t.usage}): ${t.isActive ? 'ACTIVE' : 'INACTIVE'}`);
      console.log(`  Subject: ${t.subject}`);
      console.log(`  Content preview: ${t.htmlContent.substring(0, 100)}...`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
