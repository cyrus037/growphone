const mongoose = require('mongoose');

/** One active template per usage (enforced in controller). */
const emailTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    htmlContent: { type: String, required: true },
    /** contact_confirmation = email to lead; contact_admin = notify growphonedigital@gmail.com */
    usage: {
      type: String,
      enum: ['contact_confirmation', 'contact_admin'],
      required: true,
    },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

emailTemplateSchema.index({ usage: 1, isActive: 1 });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
