const { validationResult } = require('express-validator');
const EmailTemplate = require('../models/EmailTemplate');

async function list(req, res, next) {
  try {
    const items = await EmailTemplate.find().sort({ usage: 1, createdAt: -1 });
    res.json(items);
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
    const { name, subject, htmlContent, usage, isActive } = req.body;
    if (isActive) {
      await EmailTemplate.updateMany({ usage }, { isActive: false });
    }
    const doc = await EmailTemplate.create({
      name: name.trim(),
      subject: subject.trim(),
      htmlContent,
      usage,
      isActive: !!isActive,
    });
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const t = await EmailTemplate.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Template not found' });

    const { name, subject, htmlContent, usage, isActive } = req.body;
    const nextUsage = usage || t.usage;
    if (name !== undefined) t.name = name.trim();
    if (subject !== undefined) t.subject = subject.trim();
    if (htmlContent !== undefined) t.htmlContent = htmlContent;
    if (usage !== undefined) t.usage = nextUsage;

    if (isActive === true) {
      await EmailTemplate.updateMany({ usage: nextUsage, _id: { $ne: t._id } }, { isActive: false });
      t.isActive = true;
    } else if (isActive === false) {
      t.isActive = false;
    }

    await t.save();
    res.json(t);
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const t = await EmailTemplate.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ message: 'Template not found' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

async function activate(req, res, next) {
  try {
    const t = await EmailTemplate.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Template not found' });
    await EmailTemplate.updateMany({ usage: t.usage }, { isActive: false });
    t.isActive = true;
    await t.save();
    res.json(t);
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, update, remove, activate };
