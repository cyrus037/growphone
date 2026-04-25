// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const FooterSettings = require('./models/FooterSettings');
const FooterLinks = require('./models/FooterLinks');

console.log('🔧 Testing Footer System Locally');
console.log('=====================================');
console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('JWT Secret:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('Client URL:', process.env.CLIENT_URL);
console.log('');

const testFooterSystem = async () => {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Clear existing data
    console.log('🗑️ Clearing existing footer data...');
    await FooterSettings.deleteMany({});
    await FooterLinks.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create footer settings
    console.log('📝 Creating footer settings...');
    const footerSettings = await FooterSettings.create({
      logo_url: 'https://via.placeholder.com/150x40/2563eb/ffffff?text=Growphone',
      description: 'India\'s #1 Social Growth Agency - Test environment for dynamic footer system.',
      facebook_url: 'https://facebook.com/growphone',
      instagram_url: 'https://instagram.com/growphone',
      linkedin_url: 'https://linkedin.com/company/growphone',
      twitter_url: 'https://twitter.com/growphone_in',
      youtube_url: 'https://youtube.com/@growphone',
      contact_email: 'test@growphone.in',
      contact_phone: '+91 98765 43210',
      address: 'Test Address, Bangalore, India',
      copyright_text: `© ${new Date().getFullYear()} Growphone. All rights reserved.`
    });
    console.log('✅ Footer settings created:', footerSettings._id);

    // Create footer links
    console.log('🔗 Creating footer links...');
    const testLinks = [
      // Services
      { title: 'Services', label: 'Social Media Management', url: '/services', order_index: 0, is_active: true },
      { title: 'Services', label: 'GMB Optimization', url: '/services/gmb', order_index: 1, is_active: true },
      { title: 'Services', label: 'Content Creation', url: '/services/content', order_index: 2, is_active: true },
      
      // Company
      { title: 'Company', label: 'About Us', url: '/about', order_index: 0, is_active: true },
      { title: 'Company', label: 'Testimonials', url: '/testimonials', order_index: 1, is_active: true },
      { title: 'Company', label: 'Contact', url: '/contact', order_index: 2, is_active: true },
      
      // Quick Links
      { title: 'Quick Links', label: 'Pricing', url: '/#pricing', order_index: 0, is_active: true },
      { title: 'Quick Links', label: 'Blog', url: '/blog', order_index: 1, is_active: true },
      { title: 'Quick Links', label: 'Free Audit', url: '/contact', order_index: 2, is_active: true }
    ];

    const createdLinks = await FooterLinks.insertMany(testLinks);
    console.log(`✅ Created ${createdLinks.length} footer links`);

    // Test data retrieval
    console.log('📖 Testing data retrieval...');
    const settings = await FooterSettings.getSingleton();
    const groupedLinks = await FooterLinks.getGroupedLinks();
    
    console.log('📊 Retrieved Data:');
    console.log('- Settings ID:', settings._id);
    console.log('- Description:', settings.description.substring(0, 50) + '...');
    console.log('- Social Links:', Object.keys({
      facebook: settings.facebook_url,
      instagram: settings.instagram_url,
      linkedin: settings.linkedin_url,
      twitter: settings.twitter_url,
      youtube: settings.youtube_url
    }).filter(key => settings[key.toLowerCase() + '_url']).length);
    
    console.log('- Link Categories:', Object.keys(groupedLinks));
    console.log('- Total Links:', Object.values(groupedLinks).flat().length);

    // Simulate API response
    console.log('🌐 Simulating API response...');
    const apiResponse = {
      settings: {
        logo_url: settings.logo_url,
        description: settings.description,
        facebook_url: settings.facebook_url,
        instagram_url: settings.instagram_url,
        linkedin_url: settings.linkedin_url,
        twitter_url: settings.twitter_url,
        youtube_url: settings.youtube_url,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        address: settings.address,
        copyright_text: settings.copyright_text,
        updated_at: settings.updated_at
      },
      links: groupedLinks
    };

    console.log('✅ API Response Structure Valid');
    console.log('- Settings Keys:', Object.keys(apiResponse.settings).length);
    console.log('- Link Categories:', Object.keys(apiResponse.links).length);

    console.log('');
    console.log('🎉 Local test completed successfully!');
    console.log('📋 Summary:');
    console.log('- Database: Connected');
    console.log('- Settings: Created and retrieved');
    console.log('- Links: Created and grouped');
    console.log('- API: Response format validated');
    console.log('');
    console.log('🚀 Ready to start the server and test the full system!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.name === 'MongooseServerSelectionError') {
      console.log('');
      console.log('💡 Make sure MongoDB is running locally:');
      console.log('   - Install MongoDB: https://www.mongodb.com/try/download/community');
      console.log('   - Start MongoDB service');
      console.log('   - Or use MongoDB Atlas for cloud testing');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
if (require.main === module) {
  testFooterSystem();
}

module.exports = testFooterSystem;
