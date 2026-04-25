const mongoose = require('mongoose');
require('dotenv').config();

// Production database connection
const PROD_DB_URI = process.env.MONGODB_URI || 'mongodb://nishilsoni01_db_user:U4YJaSqDdEpKYDwL@ac-udov78n-shard-00-00.djdwyot.mongodb.net:27017,ac-udov78n-shard-00-01.djdwyot.mongodb.net:27017,ac-udov78n-shard-00-02.djdwyot.mongodb.net:27017/?ssl=true&replicaSet=atlas-dkr8nf-shard-0&authSource=admin&appName=Cluster0';

// Import models
const FooterSettings = require('./models/FooterSettings');

async function fixFooterLogo() {
  try {
    console.log('🔧 Fixing footer logo URL...');
    
    // Connect to production database
    await mongoose.connect(PROD_DB_URI);
    console.log('✅ Connected to production database');
    
    // Update footer settings with logo URL
    const footerSettings = await FooterSettings.findOne({});
    if (footerSettings) {
      await FooterSettings.updateOne({}, {
        $set: {
          logo_url: 'https://growphone.in/logo.png'
        }
      });
      console.log('✅ Updated footer logo URL to: https://growphone.in/logo.png');
    } else {
      // Create footer settings if it doesn't exist
      await FooterSettings.create({
        logo_url: 'https://growphone.in/logo.png',
        description: 'India\'s #1 Social Growth Agency - Scale your social revenue with expert social media management.',
        facebook_url: 'https://facebook.com/growphone',
        instagram_url: 'https://instagram.com/growphone',
        linkedin_url: 'https://linkedin.com/company/growphone',
        twitter_url: 'https://twitter.com/growphone_in',
        youtube_url: 'https://youtube.com/@growphone',
        contact_email: 'info@growphone.in',
        contact_phone: '+91 98765 43210',
        address: 'Serving all of India, Remotely',
        copyright_text: `© ${new Date().getFullYear()} Growphone. All rights reserved.`
      });
      console.log('✅ Created footer settings with logo URL');
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from production database');
    console.log('🎉 Footer logo fix completed!');
    
  } catch (error) {
    console.error('❌ Footer logo fix failed:', error);
    process.exit(1);
  }
}

// Run footer logo fix
fixFooterLogo();
