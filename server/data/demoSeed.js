/** Extra demo leads/blogs; leads use explicit createdAt for dashboard charts */

const FIRST = [
  'Aarav',
  'Vihaan',
  'Aditya',
  'Arjun',
  'Reyansh',
  'Ananya',
  'Diya',
  'Kavya',
  'Myra',
  'Ira',
  'Neil',
  'Rohan',
  'Sara',
  'Tara',
];
const LAST = [
  'Sharma',
  'Verma',
  'Reddy',
  'Patel',
  'Kapoor',
  'Singh',
  'Iyer',
  'Menon',
  'Das',
  'Nair',
  'Khanna',
  'Bose',
];
const BIZ = [
  'Restaurant / Café',
  'Clinic / Hospital',
  'Real Estate',
  'D2C / E-commerce',
  'Education / Coaching',
  'Salon / Spa',
  'Fitness Studio',
  'Legal / CA',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function atDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(Math.floor(Math.random() * 10) + 9, Math.floor(Math.random() * 55), 0, 0);
  return d;
}

const BUDGETS = [
  'Under ₹5,000',
  '₹5,000 – ₹10,000',
  '₹10,000 – ₹25,000',
  '₹25,000+',
];
const STATUSES = ['new', 'contacted', 'converted'];

function buildRandomLeads(count) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const daysBack = Math.floor(Math.random() * 40);
    const when = atDaysAgo(daysBack);
    const phoneNum = 9800000000 + i * 71324 + Math.floor(Math.random() * 999);
    const s = String(phoneNum).padStart(10, '0');
    out.push({
      name: `${pick(FIRST)} ${pick(LAST)}`,
      businessType: pick(BIZ),
      phone: `+91 ${s.slice(0, 5)} ${s.slice(5)}`,
      budget: pick(BUDGETS),
      status: pick(STATUSES),
      createdAt: when,
      updatedAt: when,
    });
  }
  return out;
}

const anchorLeads = [
  {
    name: 'Priya Mehta',
    businessType: 'Restaurant',
    phone: '+91 98001 12345',
    budget: '₹5,000 – ₹10,000',
    status: 'new',
    createdAt: atDaysAgo(1),
    updatedAt: atDaysAgo(1),
  },
  {
    name: 'Dr. Ankit Shah',
    businessType: 'Clinic',
    phone: '+91 99001 22334',
    budget: '₹10,000 – ₹25,000',
    status: 'contacted',
    createdAt: atDaysAgo(5),
    updatedAt: atDaysAgo(5),
  },
  {
    name: 'Ravi Patel',
    businessType: 'Real Estate',
    phone: '+91 97001 55667',
    budget: '₹25,000+',
    status: 'converted',
    createdAt: atDaysAgo(12),
    updatedAt: atDaysAgo(12),
  },
  {
    name: 'Sneha Gupta',
    businessType: 'D2C / E-commerce',
    phone: '+91 96001 77889',
    budget: 'Under ₹5,000',
    status: 'new',
    createdAt: atDaysAgo(18),
    updatedAt: atDaysAgo(18),
  },
  {
    name: 'Mohit Joshi',
    businessType: 'Education / Coaching',
    phone: '+91 95001 99001',
    budget: '₹5,000 – ₹10,000',
    status: 'contacted',
    createdAt: atDaysAgo(25),
    updatedAt: atDaysAgo(25),
  },
  {
    name: 'Kavita Sharma',
    businessType: 'Restaurant / Café',
    phone: '+91 94001 11223',
    budget: '₹5,000 – ₹10,000',
    status: 'converted',
    createdAt: atDaysAgo(33),
    updatedAt: atDaysAgo(33),
  },
];

const extraBlogs = [
  {
    title: 'Reels Hooks That Work for Indian SMBs in 2026',
    category: 'Instagram',
    status: 'published',
    emoji: '🎬',
    content: 'Three hook formulas we use on client accounts weekly.',
  },
  {
    title: 'GMB Photo Checklist: Before You Upload',
    category: 'GMB',
    status: 'published',
    emoji: '📸',
    content: 'What to shoot, crop sizes, and posting cadence.',
  },
  {
    title: 'Budget ₹10k: What Social Scope You Should Expect',
    category: 'Strategy',
    status: 'published',
    emoji: '💡',
    content: 'Honest scope table for founders comparing agencies.',
  },
  {
    title: 'Draft: Influencer Collabs — DOOH in Tier-2 Cities',
    category: 'Strategy',
    status: 'draft',
    emoji: '📝',
    content: 'Work in progress for Q2 playbook.',
  },
  {
    title: 'Case: Jewellery Brand — From 2k to 18k Followers',
    category: 'Case Study',
    status: 'published',
    emoji: '💎',
    content: 'Month-by-month reel mix and offer timing.',
  },
];

function allDemoLeads() {
  return [...anchorLeads, ...buildRandomLeads(20)];
}

module.exports = { allDemoLeads, extraBlogs };
