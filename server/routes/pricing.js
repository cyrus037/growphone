const express = require('express');
const PricingPlan = require('../models/PricingPlan');
const { authRequired } = require('../middleware/auth');
const defaultPricingPlans = require('../data/defaultPricingPlans');

const router = express.Router();

router.get('/public', async (req, res) => {
  let plans = await PricingPlan.find().sort({ order: 1 });
  if (!plans.length) {
    await PricingPlan.insertMany(defaultPricingPlans);
    plans = await PricingPlan.find().sort({ order: 1 });
  }
  res.json(plans);
});

router.put('/bulk', authRequired, async (req, res) => {
  const { plans } = req.body;
  if (!Array.isArray(plans)) {
    return res.status(400).json({ message: 'Expected plans array' });
  }
  const results = [];
  for (const p of plans) {
    if (!p._id) continue;
    const updated = await PricingPlan.findByIdAndUpdate(
      p._id,
      {
        name: p.name,
        monthly: p.monthly,
        quarterly: p.quarterly,
        features: p.features,
        popular: !!p.popular,
        order: p.order ?? 0,
      },
      { new: true }
    );
    if (updated) results.push(updated);
  }
  res.json(results);
});

module.exports = router;
