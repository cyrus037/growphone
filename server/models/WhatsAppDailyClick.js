const mongoose = require('mongoose');

/** UTC calendar day key YYYY-MM-DD. */
const whatsAppDailyClickSchema = new mongoose.Schema(
  {
    dayKey: { type: String, required: true, unique: true, index: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WhatsAppDailyClick', whatsAppDailyClickSchema);
