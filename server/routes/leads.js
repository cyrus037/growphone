const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const { authRequired } = require('../middleware/auth');
const { sendContactEmails } = require('../services/mailService');

const router = express.Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('email').trim().isEmail().normalizeEmail(),
    body('businessType').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('budget').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }
      const lead = await Lead.create({
        name: req.body.name,
        email: req.body.email,
        businessType: req.body.businessType,
        phone: req.body.phone,
        budget: req.body.budget || '',
      });
      let mail = { sent: false };
      try {
        mail = await sendContactEmails(lead);
      } catch (mailErr) {
        console.error('[mail] lead created but email failed:', mailErr.message);
      }
      res.status(201).json({ ...lead.toObject(), mail });
    } catch (e) {
      next(e);
    }
  }
);

router.get('/', authRequired, async (req, res) => {
  const { status } = req.query;
  const filter = status && status !== 'all' ? { status } : {};
  const leads = await Lead.find(filter).sort({ createdAt: -1 });
  res.json(leads);
});

router.patch(
  '/:id/status',
  authRequired,
  [param('id').isMongoId(), body('status').isIn(['new', 'contacted', 'converted'])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  }
);

router.delete('/:id', authRequired, [param('id').isMongoId()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  const deleted = await Lead.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Lead not found' });
  res.json({ ok: true });
});

module.exports = router;
