const mongoose = require('mongoose');

const pricingPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    monthly: { type: Number, required: true },
    quarterly: { type: Number, required: true },
    features: { type: mongoose.Schema.Types.Mixed, default: {} },
    popular: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingPlan', pricingPlanSchema);
