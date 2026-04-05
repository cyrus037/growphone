# Growphone Deployment Guide

## Overview
Growphone is a full-stack digital marketing website with:
- React frontend (Vite)
- Node.js/Express backend
- MongoDB database
- SMTP email functionality (Zoho Mail)
- Admin panel for content management

## Environment Variables

### Required for Production
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/growphone

# JWT
JWT_SECRET=your-super-secure-jwt-secret-for-production-256-bits

# CORS
CLIENT_URL=https://growphone.in,https://www.growphone.in

# SMTP Configuration (Zoho Mail)
SMTP_HOST=smtp.zoho.in
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@growphone.in
SMTP_PASS=your_actual_zoho_password
MAIL_FROM=info@growphone.in
ADMIN_NOTIFICATION_EMAIL=growphonedigital@gmail.com

# Optional
ADMIN_RECOVERY_KEY=emergency-recovery-key-2026
ADMIN_EMAIL=admin@growphone.in
```

## Deployment Steps

### 1. Frontend Deployment (Netlify/Vercel)
```bash
cd client
npm run build
# Deploy dist/ folder to your hosting provider
```

### 2. Backend Deployment (Render/Railway)
```bash
cd server
npm install
npm start
```

### 3. Database Setup
- Create MongoDB cluster
- Add connection string to environment variables
- Run seed script for initial data:
```bash
npm run seed
```

### 4. Email Configuration
- Configure Zoho Mail SMTP settings
- Test email functionality:
```bash
node test-smtp.js
```

## Features
- ✅ Contact form with email notifications
- ✅ Admin panel for content management
- ✅ Blog management
- ✅ Pricing plans management
- ✅ WhatsApp click tracking
- ✅ Lead management
- ✅ Email templates (fixed templates, no DB dependency)
- ✅ Responsive design
- ✅ SEO optimized

## API Endpoints
- `POST /api/leads` - Contact form submission
- `GET /api/health` - Health check
- `POST /api/auth/login` - Admin authentication
- `GET /api/settings` - Website settings
- `GET /api/blogs` - Blog posts
- `GET /api/pricing` - Pricing plans

## Monitoring
- Check logs for email delivery status
- Monitor form submissions
- Track WhatsApp clicks analytics
- Admin panel provides overview dashboard

## Support
For deployment issues:
1. Check environment variables
2. Verify MongoDB connection
3. Test SMTP configuration
4. Check API health endpoint

© 2026 Growphone. All rights reserved.
