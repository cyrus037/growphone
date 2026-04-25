const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    // Basic service information
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      maxlength: 500
    },
    content: {
      type: String,
      required: true
    },
    
    // SEO fields
    metaTitle: {
      type: String,
      maxlength: 60,
      default: ''
    },
    metaDescription: {
      type: String,
      maxlength: 160,
      default: ''
    },
    metaKeywords: {
      type: String,
      maxlength: 200,
      default: ''
    },
    ogImage: {
      type: String,
      default: ''
    },
    
    // Service management
    isActive: {
      type: Boolean,
      default: true
    },
    orderIndex: {
      type: Number,
      default: 0
    },
    
    // Additional details
    shortDescription: {
      type: String,
      maxlength: 200,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    featured: {
      type: Boolean,
      default: false
    },
    
    // Pricing information
    price: {
      type: String,
      default: ''
    },
    pricingModel: {
      type: String,
      enum: ['fixed', 'monthly', 'custom', 'package'],
      default: 'custom'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Generate slug from title before saving
serviceSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Static method to get active services sorted by order
serviceSchema.statics.getActiveServices = function() {
  return this.find({ isActive: true }).sort({ orderIndex: 1, title: 1 });
};

// Static method to get service by slug
serviceSchema.statics.getBySlug = function(slug) {
  return this.findOne({ slug, isActive: true });
};

// Virtual for URL
serviceSchema.virtual('url').get(function() {
  return `/services/${this.slug}`;
});

// Ensure text search indexes
serviceSchema.index({ title: 'text', description: 'text', content: 'text' });
serviceSchema.index({ slug: 1 });
serviceSchema.index({ isActive: 1, orderIndex: 1 });

module.exports = mongoose.model('Service', serviceSchema);
