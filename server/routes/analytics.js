const express = require('express');
const { authRequired } = require('../middleware/auth');
const {
  incrementWhatsAppClick,
  getWhatsAppStats,
} = require('../controllers/analyticsController');

const router = express.Router();

router.post('/whatsapp-clicks', incrementWhatsAppClick);
router.get('/whatsapp-clicks', authRequired, getWhatsAppStats);

module.exports = router;
