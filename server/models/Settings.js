const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    heroHeadline: { type: String, default: 'WE SCALE YOUR' },
    heroAccent: { type: String, default: 'SOCIAL REVENUE.' },
    heroSubtext: {
      type: String,
      default:
        'Stop posting into the void. Start dominating your niche. 15 Posts · 6 Reels · Full GMB Optimization — starting today.',
    },
    whatsappNumber: { type: String, default: '+91 98765 43210' },
    adminEmailDisplay: { type: String, default: 'admin@growphone.in' },
    exitIntentPopup: { type: Boolean, default: true },
    whatsappPulseButton: { type: Boolean, default: true },
    quarterlyPricingToggle: { type: Boolean, default: true },
    /** Pre-filled WhatsApp message for wa.me links */
    whatsappMessageTemplate: {
      type: String,
      default: "Hi, I'm interested in your services. Can you assist me?",
    },
    /** Public site shows maintenance screen when true */
    maintenanceMode: { type: Boolean, default: false },
    /** When false, admin login is blocked unless ADMIN_RECOVERY_KEY is used */
    adminPanelEnabled: { type: Boolean, default: true },
    /** password | secret_key | both */
    adminLoginMode: {
      type: String,
      enum: ['password', 'secret_key', 'both'],
      default: 'password',
    },
    /** Dynamic admin API key (also used for login when mode is secret_key or both) */
    adminApiKey: { type: String, default: '' },
    /** When true, protected API routes require X-Admin-Key matching adminApiKey */
    requireAdminApiKeyForRequests: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
