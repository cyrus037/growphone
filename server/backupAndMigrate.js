const mongoose = require('mongoose');
require('dotenv').config();

// Database connections
const TEST_DB_URI = 'mongodb://nishilsoni01_db_user:U4YJaSqDdEpKYDwL@ac-udov78n-shard-00-00.djdwyot.mongodb.net:27017,ac-udov78n-shard-00-01.djdwyot.mongodb.net:27017,ac-udov78n-shard-00-02.djdwyot.mongodb.net:27017/?ssl=true&replicaSet=atlas-dkr8nf-shard-0&authSource=admin&appName=Cluster0';
const PROD_DB_URI = process.env.MONGODB_URI;

// Import models
const Service = require('./models/Service');
const FooterSettings = require('./models/FooterSettings');
const FooterLinks = require('./models/FooterLinks');
const User = require('./models/User');
const Settings = require('./models/Settings');

async function backupAndMigrate() {
  try {
    console.log('🔄 Starting backup and migration process...');
    
    // Connect to test database first
    console.log('📦 Connecting to test database...');
    await mongoose.connect(TEST_DB_URI);
    console.log('✅ Connected to test database');
    
    // Backup data from test database
    const backupData = {
      services: await Service.find({}),
      footerSettings: await FooterSettings.findOne({}),
      footerLinks: await FooterLinks.find({}).sort({ order_index: 1 }),
      adminUser: await User.findOne({ email: 'admin@growphone.in' }),
      settings: await Settings.findOne({})
    };
    
    console.log('📊 Data collected from test database:');
    console.log(`   - Services: ${backupData.services.length} items`);
    console.log(`   - Footer Links: ${backupData.footerLinks.length} items`);
    console.log(`   - Footer Settings: ${backupData.footerSettings ? 'Found' : 'Not found'}`);
    console.log(`   - Admin User: ${backupData.adminUser ? 'Found' : 'Not found'}`);
    console.log(`   - Settings: ${backupData.settings ? 'Found' : 'Not found'}`);
    
    // Close test database connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from test database');
    
    // Connect to production database
    console.log('🚀 Connecting to production database...');
    await mongoose.connect(PROD_DB_URI);
    console.log('✅ Connected to production database');
    
    // Clear existing data (optional - remove if you want to keep existing data)
    console.log('⚠️  WARNING: This will clear existing production data!');
    console.log('📝 Press Ctrl+C to cancel in 5 seconds...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Clear production database
    await Service.deleteMany({});
    await FooterSettings.deleteMany({});
    await FooterLinks.deleteMany({});
    await User.deleteMany({});
    await Settings.deleteMany({});
    console.log('🗑️  Cleared existing production data');
    
    // Migrate data to production
    if (backupData.services.length > 0) {
      await Service.insertMany(backupData.services);
      console.log(`✅ Migrated ${backupData.services.length} services`);
    }
    
    if (backupData.footerSettings) {
      await FooterSettings.create(backupData.footerSettings);
      console.log('✅ Migrated footer settings');
    }
    
    if (backupData.footerLinks.length > 0) {
      await FooterLinks.insertMany(backupData.footerLinks);
      console.log(`✅ Migrated ${backupData.footerLinks.length} footer links`);
    }
    
    if (backupData.adminUser) {
      await User.create(backupData.adminUser);
      console.log('✅ Migrated admin user');
    }
    
    if (backupData.settings) {
      await Settings.create(backupData.settings);
      console.log('✅ Migrated settings');
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log('📋 Summary:');
    console.log(`   - Services: ${backupData.services.length} → Production`);
    console.log(`   - Footer Links: ${backupData.footerLinks.length} → Production`);
    console.log(`   - Admin User: ${backupData.adminUser ? '✅' : '❌'} → Production`);
    console.log(`   - Settings: ${backupData.settings ? '✅' : '❌'} → Production`);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from production database');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run backup and migration
backupAndMigrate();
