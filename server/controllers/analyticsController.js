const WhatsAppClickStats = require('../models/WhatsAppClickStats');
const WhatsAppDailyClick = require('../models/WhatsAppDailyClick');

const DEBOUNCE_MS = 4000;
const recentKeys = new Map();

function dayKeyUtc(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function pruneRecent() {
  const now = Date.now();
  for (const [k, ts] of recentKeys) {
    if (now - ts > DEBOUNCE_MS * 4) recentKeys.delete(k);
  }
}

/**
 * Public: increment WhatsApp expert button clicks (debounced per IP + session).
 */
async function incrementWhatsAppClick(req, res, next) {
  try {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const sessionId = (req.body && req.body.sessionId) || req.headers['x-click-session'] || '';
    const key = `${ip}|${sessionId}`;

    pruneRecent();
    const now = Date.now();
    const last = recentKeys.get(key);
    if (last && now - last < DEBOUNCE_MS) {
      const stats = await getOrCreateStats();
      const dk = dayKeyUtc();
      const daily = await WhatsAppDailyClick.findOne({ dayKey: dk });
      return res.json({
        ok: true,
        debounced: true,
        totalClicks: stats.totalClicks,
        today: daily ? daily.count : 0,
      });
    }
    recentKeys.set(key, now);

    const stats = await getOrCreateStats();
    stats.totalClicks += 1;
    await stats.save();

    const dk = dayKeyUtc();
    await WhatsAppDailyClick.findOneAndUpdate(
      { dayKey: dk },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    const daily = await WhatsAppDailyClick.findOne({ dayKey: dk });
    res.json({
      ok: true,
      debounced: false,
      totalClicks: stats.totalClicks,
      today: daily ? daily.count : 0,
    });
  } catch (e) {
    next(e);
  }
}

async function getOrCreateStats() {
  let s = await WhatsAppClickStats.findOne({ key: 'whatsapp_expert' });
  if (!s) {
    s = await WhatsAppClickStats.create({ key: 'whatsapp_expert', totalClicks: 0 });
  }
  return s;
}

async function getWhatsAppStats(req, res, next) {
  try {
    const stats = await getOrCreateStats();
    const dk = dayKeyUtc();
    const todayDoc = await WhatsAppDailyClick.findOne({ dayKey: dk });

    const last7 = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const k = dayKeyUtc(d);
      const doc = await WhatsAppDailyClick.findOne({ dayKey: k });
      last7.push({ dayKey: k, count: doc ? doc.count : 0 });
    }

    res.json({
      totalClicks: stats.totalClicks,
      today: todayDoc ? todayDoc.count : 0,
      last7Days: last7,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  incrementWhatsAppClick,
  getWhatsAppStats,
  getOrCreateStats,
  dayKeyUtc,
};
