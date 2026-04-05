require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
const blogsRoutes = require('./routes/blogs');
const { isMailConfigured } = require('./services/mailService');
const settingsRoutes = require('./routes/settings');
const dashboardRoutes = require('./routes/dashboard');
const adminUsersRoutes = require('./routes/adminUsers');
const emailTemplatesRoutes = require('./routes/emailTemplates');
const analyticsRoutes = require('./routes/analytics');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_URL = process.env.CLIENT_URL || 'https://growphone.in,https://www.growphone.in,http://localhost:5173,http://127.0.0.1:5173';
/** Dev: browser may use localhost or 127.0.0.1 — both must be allowed */
const DEFAULT_DEV_ORIGINS = [
  'https://growphone.in',
  'https://www.growphone.in',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// 🔴 Force error if DB URI missing (no silent fallback)
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

// JWT fallback (only for dev)
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET not set. Using dev default.');
  process.env.JWT_SECRET = 'dev-secret';
}

const app = express();

const corsAllowed = new Set([
  ...CLIENT_URL.split(',').map((s) => s.trim()).filter(Boolean),
  ...DEFAULT_DEV_ORIGINS,
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (corsAllowed.has(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key', 'X-Click-Session'],
  })
);

app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'growphone-api' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/email/templates', emailTemplatesRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

// DB connect
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 API running on http://localhost:${PORT}`);
      console.log('🔑 Admin API routes use JWT — login at POST /api/auth/login');
      if (isMailConfigured()) {
        console.log('📧 Resend email functionality enabled');
      } else {
        console.log('⚠️  Email functionality disabled - RESEND_API_KEY not configured');
      }
    });
  })
  .catch((e) => {
    console.error('❌ MongoDB connection failed:', e.message);
    console.log('🔄 Starting development server without database...');
    // Start server anyway for development
    app.listen(PORT, () => {
      console.log(`🚀 Dev API running on http://localhost:${PORT}`);
      if (isMailConfigured()) {
        console.log('📧 Resend email functionality enabled');
      } else {
        console.log('⚠️  Email functionality disabled - RESEND_API_KEY not configured');
      }
      console.log('⚠️  MongoDB disabled - some features may not work');
    });
  });
