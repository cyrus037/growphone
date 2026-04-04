const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const { authRequired } = require('../middleware/auth');
const { sendContactEmails } = require('../services/mailService');

const router = express.Router();

// Mock lead storage for when MongoDB is not available
const mockLeads = [];

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

      let lead;
      try {
        // Try to save to MongoDB first
        lead = await Lead.create({
          name: req.body.name,
          email: req.body.email,
          businessType: req.body.businessType,
          phone: req.body.phone,
          budget: req.body.budget || '',
        });
      } catch (dbError) {
        // Fallback to mock storage if MongoDB is not available
        console.warn('[leads] MongoDB not available, using mock storage:', dbError.message);
        lead = {
          _id: 'lead_' + Date.now(),
          name: req.body.name,
          email: req.body.email,
          businessType: req.body.businessType,
          phone: req.body.phone,
          budget: req.body.budget || '',
          createdAt: new Date(),
          toObject: () => ({ ...lead })
        };
        mockLeads.push(lead);
      }
      
      // Send emails asynchronously without waiting for completion
      let mail = { sent: false };
      setImmediate(async () => {
        try {
          mail = await sendContactEmails(lead);
          console.log('[leads] Email send completed:', mail);
        } catch (mailErr) {
          console.error('[mail] lead created but email failed:', mailErr.message);
        }
      });
      
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
