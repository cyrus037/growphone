const express = require('express');
const Settings = require('../models/Settings');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

async function getOrCreateSettings() {
  let doc = await Settings.findOne();
  if (!doc) {
    doc = await Settings.create({});
  }
  return doc;
}

router.get('/public', async (req, res) => {
  const s = await getOrCreateSettings();
  res.json({
    heroHeadline: s.heroHeadline,
    heroAccent: s.heroAccent,
    heroSubtext: s.heroSubtext,
    whatsappNumber: s.whatsappNumber,
    whatsappMessageTemplate: s.whatsappMessageTemplate,
    exitIntentPopup: s.exitIntentPopup,
    whatsappPulseButton: s.whatsappPulseButton,
    quarterlyPricingToggle: s.quarterlyPricingToggle,
    maintenanceMode: s.maintenanceMode,
    adminPanelEnabled: s.adminPanelEnabled,
    adminLoginMode: s.adminLoginMode,
    requireAdminApiKeyForRequests: s.requireAdminApiKeyForRequests,
  });
});

router.get('/', authRequired, async (req, res) => {
  const s = await getOrCreateSettings();
  res.json(s);
});

router.put('/', authRequired, async (req, res) => {
  const s = await getOrCreateSettings();
  const allowed = [
    'heroHeadline',
    'heroAccent',
    'heroSubtext',
    'whatsappNumber',
    'whatsappMessageTemplate',
    'adminEmailDisplay',
    'exitIntentPopup',
    'whatsappPulseButton',
    'quarterlyPricingToggle',
    'maintenanceMode',
    'adminPanelEnabled',
    'adminLoginMode',
    'adminApiKey',
    'requireAdminApiKeyForRequests',
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) s[key] = req.body[key];
  }
  await s.save();
  res.json(s);
});

module.exports = router;
