const mongoose = require('mongoose');

const footerLinksSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    url: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          // Allow both absolute and relative URLs
          return /^https?:\/\/.+|^\/.+$/.test(v);
        },
        message: 'Invalid URL format. Use absolute URLs (https://...) or relative URLs (/path)'
      }
    },
    order_index: {
      type: Number,
      default: 0
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for better query performance
footerLinksSchema.index({ title: 1, order_index: 1 });
footerLinksSchema.index({ is_active: 1 });

// Static method to get grouped links
footerLinksSchema.statics.getGroupedLinks = async function() {
  const links = await this.find({ is_active: true }).sort({ title: 1, order_index: 1 });
  
  const grouped = {};
  links.forEach(link => {
    if (!grouped[link.title]) {
      grouped[link.title] = [];
    }
    grouped[link.title].push({
      id: link._id,
      label: link.label,
      url: link.url,
      order_index: link.order_index
    });
  });
  
  return grouped;
};

module.exports = mongoose.model('FooterLinks', footerLinksSchema);
