const mongoose = require('mongoose');

const footerSettingsSchema = new mongoose.Schema(
  {
    logo_url: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: 'India\'s #1 Social Growth Agency - Scale your social revenue with expert social media management.',
      trim: true,
      maxlength: 500
    },
    facebook_url: {
      type: String,
      default: '',
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?facebook\.com/.test(v);
        },
        message: 'Invalid Facebook URL format'
      }
    },
    instagram_url: {
      type: String,
      default: '',
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?instagram\.com/.test(v);
        },
        message: 'Invalid Instagram URL format'
      }
    },
    linkedin_url: {
      type: String,
      default: '',
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?linkedin\.com/.test(v);
        },
        message: 'Invalid LinkedIn URL format'
      }
    },
    twitter_url: {
      type: String,
      default: '',
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?twitter\.com/.test(v);
        },
        message: 'Invalid Twitter URL format'
      }
    },
    youtube_url: {
      type: String,
      default: '',
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?youtube\.com/.test(v);
        },
        message: 'Invalid YouTube URL format'
      }
    },
    contact_email: {
      type: String,
      default: 'info@growphone.in',
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    contact_phone: {
      type: String,
      default: '+91 98765 43210',
      trim: true
    },
    address: {
      type: String,
      default: 'Serving all of India, Remotely',
      trim: true,
      maxlength: 200
    },
    copyright_text: {
      type: String,
      default: `© ${new Date().getFullYear()} Growphone. All rights reserved.`,
      trim: true,
      maxlength: 200
    }
  },
  {
    timestamps: { createdAt: false, updatedAt: true }
  }
);

// Ensure only one footer settings document exists
footerSettingsSchema.statics.getSingleton = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('FooterSettings', footerSettingsSchema);
