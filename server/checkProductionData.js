const mongoose = require('mongoose');
require('dotenv').config();

// Production database connection
const PROD_DB_URI = process.env.MONGODB_URI || 'mongodb://nishilsoni01_db_user:U4YJaSqDdEpKYDwL@ac-udov78n-shard-00-00.djdwyot.mongodb.net:27017,ac-udov78n-shard-00-01.djdwyot.mongodb.net:27017,ac-udov78n-shard-00-02.djdwyot.mongodb.net:27017/?ssl=true&replicaSet=atlas-dkr8nf-shard-0&authSource=admin&appName=Cluster0';

// Import models
const Service = require('./models/Service');
const FooterSettings = require('./models/FooterSettings');
const FooterLinks = require('./models/FooterLinks');
const User = require('./models/User');
const Settings = require('./models/Settings');

async function checkProductionData() {
  try {
    console.log('🔍 Checking production database...');
    
    // Connect to production database
    await mongoose.connect(PROD_DB_URI);
    console.log('✅ Connected to production database');
    
    // Check data in production database
    const services = await Service.find({});
    const footerSettings = await FooterSettings.findOne({});
    const footerLinks = await FooterLinks.find({}).sort({ order_index: 1 });
    const adminUser = await User.findOne({ email: 'admin@growphone.in' });
    const settings = await Settings.findOne({});
    
    console.log('📊 Production Database Status:');
    console.log(`   - Services: ${services.length} items`);
    console.log(`   - Footer Links: ${footerLinks.length} items`);
    console.log(`   - Footer Settings: ${footerSettings ? 'Found' : 'Not found'}`);
    console.log(`   - Admin User: ${adminUser ? 'Found' : 'Not found'}`);
    console.log(`   - Settings: ${settings ? 'Found' : 'Not found'}`);
    
    if (services.length > 0) {
      console.log('\n📋 Services in Production:');
      services.forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.title} (${service.slug})`);
      });
    }
    
    if (footerLinks.length > 0) {
      console.log('\n🔗 Footer Links in Production:');
      footerLinks.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.title} -> ${link.url}`);
      });
    }
    
    if (footerSettings) {
      console.log('\n⚙️ Footer Settings in Production:');
      console.log(`   Logo URL: ${footerSettings.logo_url || 'Not set'}`);
      console.log(`   Description: ${footerSettings.description || 'Not set'}`);
      console.log(`   Contact Email: ${footerSettings.contact_email || 'Not set'}`);
      console.log(`   Contact Phone: ${footerSettings.contact_phone || 'Not set'}`);
      console.log(`   Address: ${footerSettings.address || 'Not set'}`);
      console.log(`   Copyright: ${footerSettings.copyright_text || 'Not set'}`);
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from production database');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

// Run production data check
checkProductionData();
