const express = require('express');
const router = express.Router();
const FooterSettings = require('../models/FooterSettings');
const FooterLinks = require('../models/FooterLinks');
const { adminAuth } = require('../middleware/auth');

// GET /api/footer - Public endpoint to fetch footer data
router.get('/', async (req, res) => {
  try {
    // Set proper headers for JSON response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const [settings, links] = await Promise.all([
      FooterSettings.getSingleton(),
      FooterLinks.getGroupedLinks()
    ]);

    res.json({
      settings: {
        logo_url: settings.logo_url,
        description: settings.description,
        facebook_url: settings.facebook_url,
        instagram_url: settings.instagram_url,
        linkedin_url: settings.linkedin_url,
        twitter_url: settings.twitter_url,
        youtube_url: settings.youtube_url,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        address: settings.address,
        copyright_text: settings.copyright_text,
        updated_at: settings.updated_at
      },
      links
    });
  } catch (error) {
    console.error('Error fetching footer data:', error);
    res.status(500).json({ message: 'Failed to fetch footer data' });
  }
});

// GET /api/footer/links - Public endpoint for footer links
router.get('/links', async (req, res) => {
  try {
    // Set proper headers for JSON response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const links = await FooterLinks.find({}).sort({ order_index: 1 });
    res.json(links);
  } catch (error) {
    console.error('Error fetching footer links:', error);
    res.status(500).json({ message: 'Failed to fetch footer links' });
  }
});

// PUT /api/footer/settings - Update footer settings (admin only)
router.put('/settings', adminAuth, async (req, res) => {
  try {
    const settings = await FooterSettings.getSingleton();
    
    const allowedFields = [
      'logo_url', 'description', 'facebook_url', 'instagram_url', 
      'linkedin_url', 'twitter_url', 'youtube_url', 'contact_email',
      'contact_phone', 'address', 'copyright_text'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();
    res.json({ message: 'Footer settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating footer settings:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Failed to update footer settings' });
  }
});

// GET /api/footer/links - Get all footer links (admin)
router.get('/links', adminAuth, async (req, res) => {
  try {
    const links = await FooterLinks.find().sort({ title: 1, order_index: 1 });
    res.json(links);
  } catch (error) {
    console.error('Error fetching footer links:', error);
    res.status(500).json({ message: 'Failed to fetch footer links' });
  }
});

// POST /api/footer/links - Create new footer link (admin only)
router.post('/links', adminAuth, async (req, res) => {
  try {
    const { title, label, url, order_index = 0, is_active = true } = req.body;

    if (!title || !label || !url) {
      return res.status(400).json({ message: 'Title, label, and URL are required' });
    }

    const newLink = new FooterLinks({
      title,
      label,
      url,
      order_index,
      is_active
    });

    await newLink.save();
    res.status(201).json({ message: 'Footer link created successfully', link: newLink });
  } catch (error) {
    console.error('Error creating footer link:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Failed to create footer link' });
  }
});

// PUT /api/footer/links/:id - Update footer link (admin only)
router.put('/links/:id', adminAuth, async (req, res) => {
  try {
    const link = await FooterLinks.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Footer link not found' });
    }

    const allowedFields = ['title', 'label', 'url', 'order_index', 'is_active'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        link[field] = req.body[field];
      }
    });

    await link.save();
    res.json({ message: 'Footer link updated successfully', link });
  } catch (error) {
    console.error('Error updating footer link:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Failed to update footer link' });
  }
});

// DELETE /api/footer/links/:id - Delete footer link (admin only)
router.delete('/links/:id', adminAuth, async (req, res) => {
  try {
    const link = await FooterLinks.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Footer link not found' });
    }

    await FooterLinks.findByIdAndDelete(req.params.id);
    res.json({ message: 'Footer link deleted successfully' });
  } catch (error) {
    console.error('Error deleting footer link:', error);
    res.status(500).json({ message: 'Failed to delete footer link' });
  }
});

// PUT /api/footer/links/reorder - Reorder footer links (admin only)
router.put('/links/reorder', adminAuth, async (req, res) => {
  try {
    const { links } = req.body; // Expected format: [{ id, order_index }, ...]
    
    if (!Array.isArray(links)) {
      return res.status(400).json({ message: 'Links array is required' });
    }

    const updatePromises = links.map(({ id, order_index }) =>
      FooterLinks.findByIdAndUpdate(id, { order_index }, { new: true })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Footer links reordered successfully' });
  } catch (error) {
    console.error('Error reordering footer links:', error);
    res.status(500).json({ message: 'Failed to reorder footer links' });
  }
});

module.exports = router;
