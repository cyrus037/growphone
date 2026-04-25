const mongoose = require('mongoose');
const FooterSettings = require('./models/FooterSettings');
const FooterLinks = require('./models/FooterLinks');

require('dotenv').config();

const seedFooter = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing footer data
    await FooterSettings.deleteMany({});
    await FooterLinks.deleteMany({});
    console.log('🗑️ Cleared existing footer data');

    // Create footer settings
    const footerSettings = await FooterSettings.create({
      logo_url: '',
      description: 'India\'s #1 Social Growth Agency - Scale your social revenue with expert social media management, GMB optimization, and content creation.',
      facebook_url: 'https://facebook.com/growphone',
      instagram_url: 'https://instagram.com/growphone',
      linkedin_url: 'https://linkedin.com/company/growphone',
      twitter_url: 'https://twitter.com/growphone_in',
      youtube_url: '',
      contact_email: 'info@growphone.in',
      contact_phone: '+91 98765 43210',
      address: 'Serving all of India, Remotely',
      copyright_text: `© ${new Date().getFullYear()} Growphone. All rights reserved.`
    });

    console.log('✅ Created footer settings');

    // Create footer links
    const footerLinks = [
      // Services links
      { title: 'Services', label: 'Social Media Management', url: '/services', order_index: 0, is_active: true },
      { title: 'Services', label: 'GMB Optimization', url: '/services/gmb', order_index: 1, is_active: true },
      { title: 'Services', label: 'Content Creation', url: '/services/content', order_index: 2, is_active: true },
      { title: 'Services', label: 'Instagram Marketing', url: '/services/instagram', order_index: 3, is_active: true },
      
      // Company links
      { title: 'Company', label: 'About Us', url: '/about', order_index: 0, is_active: true },
      { title: 'Company', label: 'Case Studies', url: '/blog', order_index: 1, is_active: true },
      { title: 'Company', label: 'Contact', url: '/contact', order_index: 2, is_active: true },
      { title: 'Company', label: 'Careers', url: '/careers', order_index: 3, is_active: false }, // Inactive example
      
      // Quick Links
      { title: 'Quick Links', label: 'Pricing', url: '/#pricing', order_index: 0, is_active: true },
      { title: 'Quick Links', label: 'Free Audit', url: '/contact', order_index: 1, is_active: true },
      { title: 'Quick Links', label: 'Blog', url: '/blog', order_index: 2, is_active: true },
      { title: 'Quick Links', label: 'Admin Portal', url: '/admin-portal', order_index: 3, is_active: false }, // Inactive
    ];

    await FooterLinks.insertMany(footerLinks);
    console.log(`✅ Created ${footerLinks.length} footer links`);

    console.log('\n🎉 Footer seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Footer settings: ${footerSettings._id}`);
    console.log(`- Footer links: ${footerLinks.length} items`);
    console.log(`- Active links: ${footerLinks.filter(link => link.is_active).length}`);
    console.log(`- Categories: ${[...new Set(footerLinks.map(link => link.title))].join(', ')}`);

  } catch (error) {
    console.error('❌ Error seeding footer:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seed
if (require.main === module) {
  seedFooter();
}

module.exports = seedFooter;
