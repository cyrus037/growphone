const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Settings = require('../models/Settings');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function getSettings() {
  let s = await Settings.findOne();
  if (!s) {
    s = await Settings.create({});
  }
  return s;
}

router.post(
  '/login',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isString(),
    body('adminKey').optional().isString(),
    body('recoveryKey').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }

    const s = await getSettings();

    if (!s.adminPanelEnabled) {
      const recoveryOk =
        process.env.ADMIN_RECOVERY_KEY &&
        req.body.recoveryKey &&
        req.body.recoveryKey === process.env.ADMIN_RECOVERY_KEY;
      if (!recoveryOk) {
        return res.status(403).json({
          message: 'Admin panel is temporarily disabled. Use recovery key if configured.',
        });
      }
    }

    const mode = s.adminLoginMode || 'password';

    if (mode === 'secret_key') {
      const key = req.body.adminKey;
      if (!key || !s.adminApiKey || key !== s.adminApiKey) {
        return res.status(401).json({ message: 'Invalid admin key' });
      }
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@growphone.in';
      const user = await User.findOne({ email: adminEmail });
      if (!user) {
        return res.status(500).json({ message: 'No admin user configured' });
      }
      const token = signToken(user);
      return res.json({
        token,
        user: { email: user.email, id: user._id },
      });
    }

    if (mode === 'both') {
      const { email, password, adminKey } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }
      if (!adminKey || !s.adminApiKey || adminKey !== s.adminApiKey) {
        return res.status(401).json({ message: 'Invalid admin key' });
      }
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = signToken(user);
      return res.json({
        token,
        user: { email: user.email, id: user._id },
      });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken(user);
    return res.json({
      token,
      user: { email: user.email, id: user._id },
    });
  }
);

module.exports = router;
