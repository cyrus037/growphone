require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Lead = require('./models/Lead');
const Blog = require('./models/Blog');
const PricingPlan = require('./models/PricingPlan');
const Settings = require('./models/Settings');
const EmailTemplate = require('./models/EmailTemplate');
const WhatsAppClickStats = require('./models/WhatsAppClickStats');
const defaultPlans = require('./data/defaultPricingPlans');
const { allDemoLeads, extraBlogs } = require('./data/demoSeed');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/growphone';

const defaultBlogs = [
  {
    title: '5 Instagram Reels That 10x Restaurant Bookings',
    category: 'Case Study',
    status: 'published',
    emoji: '🍽️',
    content: 'Discover proven strategies used by our top clients.',
  },
  {
    title: 'How to Rank #1 on Google Maps in 30 Days',
    category: 'GMB',
    status: 'published',
    emoji: '📍',
    content: 'Local SEO tactics that work in Indian markets.',
  },
  {
    title: 'The Hashtag Formula That Grew Our Client 12K Followers',
    category: 'Instagram',
    status: 'published',
    emoji: '📈',
    content: 'A practical framework for hashtag research.',
  },
  {
    title: 'WhatsApp Marketing for Indian Clinics: Full Guide',
    category: 'Tips',
    status: 'draft',
    emoji: '💬',
    content: 'Draft content for clinics.',
  },
  {
    title: 'Before & After: Real Estate Brand That 3x Their Leads',
    category: 'Case Study',
    status: 'published',
    emoji: '🏠',
    content: 'Case study highlights.',
  },
  {
    title: 'Social SEO vs Traditional SEO: What Works in 2024',
    category: 'Strategy',
    status: 'draft',
    emoji: '🔍',
    content: 'Comparison draft.',
  },
  ...extraBlogs,
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const adminEmail = 'admin@growphone.in';
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    await User.create({ email: adminEmail, password: 'admin123' });
    console.log('Created admin user:', adminEmail);
  } else {
    console.log('Admin user already exists');
  }

  const planCount = await PricingPlan.countDocuments();
  if (planCount === 0) {
    await PricingPlan.insertMany(defaultPlans);
    console.log('Seeded pricing plans');
  } else {
    console.log('Pricing plans already present, skipping');
  }

  const blogCount = await Blog.countDocuments();
  if (blogCount === 0) {
    await Blog.insertMany(defaultBlogs);
    console.log('Seeded blog posts');
  } else {
    console.log('Blog posts already present, skipping');
  }

  const leadCount = await Lead.countDocuments();
  if (leadCount === 0) {
    const demoLeads = allDemoLeads();
    // Raw insert so createdAt / updatedAt are kept (for dashboard 30-day chart)
    await Lead.collection.insertMany(demoLeads);
    console.log(`Seeded ${demoLeads.length} sample leads (spread over ~40 days for dashboard chart)`);
  } else {
    console.log('Leads already present, skipping');
  }

  let settings = await Settings.findOne();
  if (!settings) {
    await Settings.create({});
    console.log('Created default settings');
  }

  const tplCount = await EmailTemplate.countDocuments();
  if (tplCount === 0) {
    await EmailTemplate.insertMany([
      {
        name: 'Thanks — Friendly',
        subject: 'Thanks for contacting us, {{name}}!',
        usage: 'contact_confirmation',
        isActive: true,
        htmlContent: `<div style="font-family:system-ui,Segoe UI,sans-serif;line-height:1.6;color:#0f172a;max-width:560px">
<p>Hi {{name}},</p>
<p><strong>Thank you</strong> for getting in touch with Growphone. We’ve received your message and our team will reach out on WhatsApp soon.</p>
<p style="background:#f1f5f9;padding:12px 16px;border-radius:8px;font-size:14px">
<strong>What you sent</strong><br/>
Email: {{email}}<br/>
Phone: {{phone}}<br/>
Business: {{businessType}}<br/>
Budget: {{budget}}
</p>
<p>Warm regards,<br/>Team Growphone</p>
</div>`,
      },
      {
        name: 'Thanks — Short',
        subject: 'Got it, {{name}} — we’ll be in touch',
        usage: 'contact_confirmation',
        isActive: false,
        htmlContent: `<p>Hi {{name}},</p>
<p>Thanks — we received your enquiry. We’ll WhatsApp you shortly.</p>
<p>— Growphone</p>`,
      },
      {
        name: 'Thanks — Professional',
        subject: 'Acknowledgement: your enquiry at Growphone',
        usage: 'contact_confirmation',
        isActive: false,
        htmlContent: `<div style="font-family:Georgia,serif;line-height:1.65;color:#111;max-width:560px">
<p>Dear {{name}},</p>
<p>Thank you for your interest in Growphone. This email confirms that we have received your submission dated <strong>{{submittedAt}}</strong>.</p>
<p>Our team will review your details and contact you using the phone number you provided ({{phone}}).</p>
<p style="font-size:14px;color:#444">Reference: {{email}} · {{businessType}} · Budget: {{budget}}</p>
<p>Sincerely,<br/>Growphone</p>
</div>`,
      },
      {
        name: 'Contact — Admin alert',
        subject: 'New lead: {{name}}',
        usage: 'contact_admin',
        isActive: true,
        htmlContent: `<p>New contact form submission.</p>
<p><strong>Name:</strong> {{name}}<br/>
<strong>Email:</strong> {{email}}<br/>
<strong>Phone:</strong> {{phone}}<br/>
<strong>Business:</strong> {{businessType}}<br/>
<strong>Budget:</strong> {{budget}}<br/>
<strong>Submitted:</strong> {{submittedAt}}</p>`,
      },
    ]);
    console.log('Seeded default email templates');
  } else {
    console.log('Email templates already present, skipping');
  }

  await WhatsAppClickStats.findOneAndUpdate(
    { key: 'whatsapp_expert' },
    { $setOnInsert: { totalClicks: 0 } },
    { upsert: true }
  );

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
