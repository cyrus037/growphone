const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/public', async (req, res) => {
  const posts = await Blog.find({ status: 'published' }).sort({ createdAt: -1 });
  res.json(posts);
});

router.get('/', authRequired, async (req, res) => {
  const posts = await Blog.find().sort({ createdAt: -1 });
  res.json(posts);
});

router.post(
  '/',
  authRequired,
  [
    body('title').trim().notEmpty(),
    body('category').optional().isString(),
    body('content').optional().isString(),
    body('coverImage').optional().isString(),
    body('metaTitle').optional().isString(),
    body('status').optional().isIn(['draft', 'published']),
    body('emoji').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const post = await Blog.create(req.body);
    res.status(201).json(post);
  }
);

router.patch(
  '/:id',
  authRequired,
  [param('id').isMongoId()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const post = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  }
);

router.delete('/:id', authRequired, [param('id').isMongoId()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  const deleted = await Blog.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Post not found' });
  res.json({ ok: true });
});

module.exports = router;
