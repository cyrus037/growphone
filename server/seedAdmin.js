// Seed admin user for testing
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing admin users
    await User.deleteMany({});
    console.log('🗑️ Cleared existing admin users');

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@growphone.in',
      password: 'admin123'
    });

    console.log('✅ Admin user created successfully!');
    console.log('📋 Login Credentials:');
    console.log('   Email: admin@growphone.in');
    console.log('   Password: admin123');
    console.log('   User ID:', adminUser._id);

  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed
if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
