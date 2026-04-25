const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { adminAuth } = require('../middleware/auth');

// GET /api/services - Public endpoint to get active services
router.get('/', async (req, res) => {
  try {
    const services = await Service.getActiveServices();
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

// GET /api/services/:slug - Public endpoint to get service by slug
router.get('/:slug', async (req, res) => {
  try {
    const service = await Service.getBySlug(req.params.slug);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Failed to fetch service' });
  }
});

// GET /api/admin/services - Get all services (admin)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const services = await Service.find().sort({ orderIndex: 1, title: 1 });
    res.json(services);
  } catch (error) {
    console.error('Error fetching all services:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

// POST /api/admin/services - Create new service (admin)
router.post('/admin', adminAuth, async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      content,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      isActive = true,
      orderIndex = 0,
      shortDescription,
      icon,
      featured = false,
      price,
      pricingModel = 'custom'
    } = req.body;

    // Validation
    if (!title || !description || !content) {
      return res.status(400).json({ 
        message: 'Title, description, and content are required' 
      });
    }

    // Check if slug already exists
    if (slug) {
      const existingService = await Service.findOne({ slug });
      if (existingService) {
        return res.status(400).json({ message: 'Service with this slug already exists' });
      }
    }

    const newService = new Service({
      title,
      slug,
      description,
      content,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      isActive,
      orderIndex,
      shortDescription,
      icon,
      featured,
      price,
      pricingModel
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    console.error('Error creating service:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Failed to create service' });
  }
});

// PUT /api/admin/services/:id - Update service (admin)
router.put('/admin/:id', adminAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const allowedFields = [
      'title', 'slug', 'description', 'content', 'metaTitle', 'metaDescription',
      'metaKeywords', 'ogImage', 'isActive', 'orderIndex', 'shortDescription',
      'icon', 'featured', 'price', 'pricingModel'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });

    // If title is changed and no slug provided, regenerate slug
    if (req.body.title && !req.body.slug) {
      service.slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }

    await service.save();
    res.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Failed to update service' });
  }
});

// DELETE /api/admin/services/:id - Delete service (admin)
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Failed to delete service' });
  }
});

// PUT /api/admin/services/reorder - Reorder services (admin)
router.put('/admin/reorder', adminAuth, async (req, res) => {
  try {
    const { services } = req.body; // Expected format: [{ id, orderIndex }, ...]
    
    if (!Array.isArray(services)) {
      return res.status(400).json({ message: 'Services array is required' });
    }

    const updatePromises = services.map(({ id, orderIndex }) =>
      Service.findByIdAndUpdate(id, { orderIndex }, { new: true })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Services reordered successfully' });
  } catch (error) {
    console.error('Error reordering services:', error);
    res.status(500).json({ message: 'Failed to reorder services' });
  }
});

module.exports = router;
