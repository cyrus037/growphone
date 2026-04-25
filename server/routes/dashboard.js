const express = require('express');
const Lead = require('../models/Lead');
const Blog = require('../models/Blog');
const { authRequired } = require('../middleware/auth');
const { getOrCreateStats } = require('../controllers/analyticsController');
const WhatsAppDailyClick = require('../models/WhatsAppDailyClick');

const router = express.Router();

router.get('/stats', authRequired, async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [totalThisMonth, totalPrevMonth, pendingNew, convertedTotal, blogs, allLeads] =
    await Promise.all([
      Lead.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Lead.countDocuments({ createdAt: { $gte: startPrevMonth, $lte: endPrevMonth } }),
      Lead.countDocuments({ status: 'new' }),
      Lead.countDocuments({ status: 'converted' }),
      Blog.find(),
      Lead.find().sort({ createdAt: -1 }).limit(200),
    ]);

  const published = blogs.filter((b) => b.status === 'published').length;
  const drafts = blogs.filter((b) => b.status === 'draft').length;

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentLeads = await Lead.find({ createdAt: { $gte: thirtyDaysAgo } });

  const dayBuckets = Array(30).fill(0);
  const dayStart = new Date(thirtyDaysAgo);
  dayStart.setHours(0, 0, 0, 0);
  for (const l of recentLeads) {
    const d = new Date(l.createdAt);
    const idx = Math.floor((d - dayStart) / (86400000));
    if (idx >= 0 && idx < 30) dayBuckets[idx] += 1;
  }

  const delta = totalThisMonth - totalPrevMonth;
  const closeRate =
    allLeads.length > 0
      ? Math.round((convertedTotal / Math.max(1, allLeads.length)) * 100)
      : 0;

  const waStats = await getOrCreateStats();
  const dk = new Date().toISOString().slice(0, 10);
  const todayWa = await WhatsAppDailyClick.findOne({ dayKey: dk });

  res.json({
    metrics: {
      totalLeadsMonth: totalThisMonth,
      leadsDeltaVsPrevMonth: delta,
      blogPosts: blogs.length,
      blogPublished: published,
      blogDrafts: drafts,
      pendingEnquiries: pendingNew,
      conversions: convertedTotal,
      closeRate,
      whatsappClicksTotal: waStats.totalClicks,
      whatsappClicksToday: todayWa ? todayWa.count : 0,
    },
    chart: dayBuckets,
    recentLeads: allLeads.slice(0, 5).map((l) => l.toObject()),
  });
});

module.exports = router;
