const mongoose = require('mongoose');

/** Singleton row for total expert-button clicks. */
const whatsAppClickStatsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'whatsapp_expert', unique: true },
    totalClicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WhatsAppClickStats', whatsAppClickStatsSchema);
