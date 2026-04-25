// Seed services with initial data
require('dotenv').config();

const mongoose = require('mongoose');
const Service = require('./models/Service');

async function seedServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing services
    await Service.deleteMany({});
    console.log('🗑️ Cleared existing services');

    // Create initial services
    const services = [
      {
        title: 'Social Media Management',
        slug: 'social-media-management',
        description: 'Complete social media management to grow your online presence and engage with your audience effectively.',
        content: `# Social Media Management

Transform your social media presence with our comprehensive management services. We handle everything from content creation to community engagement, ensuring your brand stands out across all platforms.

## What We Offer

### Platform Management
- Instagram, Facebook, LinkedIn, Twitter, YouTube
- Daily posting and engagement
- Content calendar planning
- Community management

### Content Creation
- High-quality graphics and videos
- Engaging captions and copywriting
- Brand-aligned visual content
- Trend-focused content strategy

### Analytics & Reporting
- Monthly performance reports
- Audience growth tracking
- Engagement rate analysis
- ROI measurement

### Pricing Models
- **Basic**: ₹15,000/month (3 platforms)
- **Professional**: ₹25,000/month (5 platforms)
- **Enterprise**: Custom pricing

## Why Choose Us?

✅ Expert content creators<br>
✅ Proven growth strategies<br>
✅ Real-time engagement<br>
✅ Detailed analytics<br>
✅ Dedicated account manager`,
        metaTitle: 'Social Media Management Services | Grow Online',
        metaDescription: 'Professional social media management services in India. Complete Instagram, Facebook, LinkedIn management with content creation, engagement, and analytics.',
        metaKeywords: 'social media management, instagram marketing, facebook management, linkedin marketing, social media agency',
        shortDescription: 'Complete social media management across all platforms with content creation and analytics.',
        icon: '📱',
        featured: true,
        price: 'Starting from ₹15,000/month',
        pricingModel: 'monthly',
        orderIndex: 1,
        isActive: true
      },
      {
        title: 'GMB Optimization',
        slug: 'gmb-optimization',
        description: 'Optimize your Google My Business profile to rank #1 in local searches and attract more customers.',
        content: `# Google My Business Optimization

Dominate local search results with our expert GMB optimization services. We help businesses rank #1 on Google Maps and attract qualified local customers.

## Our GMB Services

### Profile Optimization
- Complete profile setup and verification
- Business information optimization
- Category selection and hierarchy
- Service area definition

### Content & Posts
- Regular GMB posts creation
- Before/after photos
- Customer success stories
- Event announcements and offers

### Review Management
- Review generation strategy
- Response to all reviews
- Review monitoring and alerts
- Reputation management

### Local SEO Integration
- Local keyword optimization
- Citation building
- Local link building
- Map ranking improvement

## Pricing

- **Basic GMB Setup**: ₹5,000 (one-time)
- **Monthly Management**: ₹10,000/month
- **Complete Local SEO**: ₹20,000/month

## Results You Can Expect

🎯 #1-3 ranking on Google Maps<br>
📈 200% increase in calls<br>
👥 5x more customer visits<br>
⭐ 4.5+ star rating achievement`,
        metaTitle: 'GMB Optimization Services | Rank #1 on Maps',
        metaDescription: 'Expert GMB optimization services to rank #1 on Google Maps. Get more local customers, reviews, and calls with our proven local SEO strategies.',
        metaKeywords: 'google my business, gmb optimization, local seo, google maps ranking, local marketing',
        shortDescription: 'Rank #1 on Google Maps and attract local customers with expert GMB optimization.',
        icon: '📍',
        featured: true,
        price: 'Starting from ₹10,000/month',
        pricingModel: 'monthly',
        orderIndex: 2,
        isActive: true
      },
      {
        title: 'Content Creation',
        slug: 'content-creation',
        description: 'High-quality, engaging content creation including graphics, videos, and copywriting for all your marketing needs.',
        content: `# Professional Content Creation Services

Create compelling content that converts with our expert content creation team. From stunning visuals to persuasive copy, we create content that resonates with your audience.

## Content Services

### Visual Content
- Professional graphics and designs
- Brand-aligned visual identity
- Social media templates
- Infographics and data visualization

### Video Content
- Short-form video creation (Reels, Shorts)
- Professional video editing
- Brand video production
- Product demonstration videos

### Copywriting
- Website content and landing pages
- Blog posts and articles
- Email marketing copy
- Social media captions

### Brand Strategy
- Content strategy development
- Brand voice guidelines
- Content calendar planning
- Campaign ideation

## Pricing

- **Basic Package**: ₹8,000/month (20 graphics)
- **Professional**: ₹15,000/month (40 graphics + 4 videos)
- **Enterprise**: Custom pricing

## Why Our Content Works

✅ Brand-aligned creative<br>
✅ Data-driven strategies<br>
✅ High engagement rates<br>
✅ Quick turnaround time<br>
✅ Unlimited revisions`,
        metaTitle: 'Content Creation Services | Graphics & Videos',
        metaDescription: 'Professional content creation services including graphics, videos, and copywriting. High-quality, brand-aligned content for social media and marketing.',
        metaKeywords: 'content creation, graphic design, video production, copywriting, social media content',
        shortDescription: 'High-quality graphics, videos, and copywriting for all your marketing needs.',
        icon: '🎨',
        featured: false,
        price: 'Starting from ₹8,000/month',
        pricingModel: 'monthly',
        orderIndex: 3,
        isActive: true
      },
      {
        title: 'Instagram Marketing',
        slug: 'instagram-marketing',
        description: 'Specialized Instagram marketing services including growth strategies, content creation, and influencer collaborations.',
        content: `# Instagram Marketing Services

Dominate Instagram with our specialized marketing services. We help brands grow their following, increase engagement, and drive real business results through strategic Instagram marketing.

## Instagram Services

### Growth Strategy
- Targeted follower growth
- Hashtag strategy optimization
- Engagement rate improvement
- Community building

### Content Strategy
- Instagram feed planning
- Story content creation
- Reels production and optimization
- IGTV and video content

### Influencer Marketing
- Influencer identification and outreach
- Campaign management
- Performance tracking
- ROI measurement

### Instagram Ads
- Ad campaign creation
- Audience targeting
- A/B testing and optimization
- Conversion tracking

## Pricing

- **Growth Package**: ₹12,000/month
- **Content + Growth**: ₹20,000/month
- **Full Service**: ₹35,000/month

## Results

📈 10K+ followers growth<br>
🎯 5% engagement rate<br>
💰 3x ROAS on ads<br>
👥 50% increase in leads`,
        metaTitle: 'Instagram Marketing Services | Growth Experts',
        metaDescription: 'Expert Instagram marketing services with proven growth strategies. Get more followers, engagement, and business results with our Instagram specialists.',
        metaKeywords: 'instagram marketing, instagram growth, social media marketing, instagram ads, influencer marketing',
        shortDescription: 'Specialized Instagram marketing with growth strategies and content creation.',
        icon: '📸',
        featured: true,
        price: 'Starting from ₹12,000/month',
        pricingModel: 'monthly',
        orderIndex: 4,
        isActive: true
      },
      {
        title: 'Website Development',
        slug: 'website-development',
        description: 'Professional website development services with modern design, SEO optimization, and mobile responsiveness.',
        content: `# Website Development Services

Build stunning, high-converting websites that represent your brand perfectly. Our web development services combine beautiful design with powerful functionality.

## Web Development Services

### Custom Website Design
- Modern, responsive design
- Mobile-first approach
- Brand-aligned aesthetics
- User experience optimization

### E-commerce Solutions
- Shopify development
- Custom e-commerce platforms
- Payment gateway integration
- Product catalog management

### SEO Optimization
- On-page SEO implementation
- Site speed optimization
- Schema markup integration
- Technical SEO audits

### Maintenance & Support
- Regular updates and security
- Performance monitoring
- Backup management
- Technical support

## Pricing

- **Basic Website**: ₹25,000 (5 pages)
- **Professional**: ₹50,000 (10 pages + CMS)
- **E-commerce**: ₹75,000+
- **Custom**: Quote based on requirements

## Technologies We Use

- React, Vue.js, Angular
- Node.js, PHP, Python
- Shopify, WooCommerce
- WordPress, Webflow`,
        metaTitle: 'Website Development Services | Professional Design',
        metaDescription: 'Professional website development services with modern design, SEO optimization, and mobile responsiveness. Custom websites and e-commerce solutions.',
        metaKeywords: 'website development, web design, e-commerce, SEO optimization, responsive design',
        shortDescription: 'Professional website development with modern design and SEO optimization.',
        icon: '💻',
        featured: false,
        price: 'Starting from ₹25,000',
        pricingModel: 'fixed',
        orderIndex: 5,
        isActive: true
      }
    ];

    const createdServices = await Service.insertMany(services);
    console.log(`✅ Created ${createdServices.length} services`);

    console.log('\n🎉 Services seeding completed successfully!');
    console.log('\n📋 Created Services:');
    createdServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.title} (${service.slug})`);
    });

  } catch (error) {
    console.error('❌ Error seeding services:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed
if (require.main === module) {
  seedServices();
}

module.exports = seedServices;
