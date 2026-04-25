const { validationResult } = require('express-validator');
const User = require('../models/User');

async function list(req, res, next) {
  try {
    const users = await User.find().select('email createdAt updatedAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const { email, password } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: 'An admin with this email already exists' });
    }
    const user = await User.create({ email: email.trim().toLowerCase(), password });
    res.status(201).json({
      id: user._id,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid id', errors: errors.array() });
    }
    const id = req.params.id;
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const count = await User.countDocuments();
    if (count <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last admin user' });
    }
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, remove };
