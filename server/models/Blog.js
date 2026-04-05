const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'Tips' },
    content: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    metaTitle: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    emoji: { type: String, default: '📝' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
