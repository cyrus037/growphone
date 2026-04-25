# GrowPhone - Digital Marketing Website

A professional digital marketing website with contact forms, admin panel, and email notifications.

**🚀 Live Site:** [growphone.in](https://growphone.in)

---

## ✅ Features

- **Contact Form** with instant email notifications
- **Admin Panel** for content management
- **Blog Management** system
- **Pricing Plans** management
- **WhatsApp Click** tracking
- **Lead Management** dashboard
- **Email Templates** (fixed, no database dependency)
- **Responsive Design** for all devices
- **SEO Optimized** structure

---

## 🛠 Tech Stack

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (with fallback for development)
- **Email:** Nodemailer + Zoho SMTP
- **Deployment:** Netlify (frontend) + Render (backend)

---

## 📧 Email System

**Fixed email templates** - no database required:
- **Client Email:** Professional confirmation with website link
- **Admin Email:** Lead notification with action items
- **2026 Copyright** in both templates
- **Clickable website links** in every email

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup
```bash
# Clone and setup
git clone <repo-url>
cd growphone-main

# Backend setup
cd server
cp .env.example .env
# Edit .env with your credentials
npm install

# Frontend setup  
cd ../client
npm install
npm run dev
```

### Environment Variables
```bash
# Required
MONGODB_URI=mongodb://127.0.0.1:27017/growphone
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173

# SMTP (Zoho)
SMTP_HOST=smtp.zoho.in
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@growphone.in
SMTP_PASS=your_zoho_password
MAIL_FROM=info@growphone.in
ADMIN_NOTIFICATION_EMAIL=growphonedigital@gmail.com
```

---

## 📁 Project Structure

```
growphone-main/
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── middleware/
│   └── package.json
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file
```

---

## 🌐 Deployment

### Frontend (Netlify)
```bash
cd client
npm run build
# Deploy dist/ folder
```

### Backend (Render)
```bash
cd server
npm start
```

**Environment variables for production:**
- Use MongoDB Atlas URI
- Set production CLIENT_URL
- Configure Zoho SMTP
- Use strong JWT_SECRET

---

## 🔧 API Endpoints

- `POST /api/leads` - Contact form submission
- `GET /api/health` - Health check
- `POST /api/auth/login` - Admin authentication
- `GET /api/settings` - Website settings
- `GET /api/blogs` - Blog posts
- `GET /api/pricing` - Pricing plans

---

## 📊 Admin Features

- **Dashboard:** Overview of leads and analytics
- **Leads:** Manage contact form submissions
- **Blogs:** Create and edit blog posts
- **Pricing:** Manage service pricing plans
- **Settings:** Configure website settings
- **Email Templates:** Customize email notifications

---

## 🔒 Security

- JWT authentication for admin panel
- CORS protection
- Input validation and sanitization
- Environment variable protection
- SMTP authentication

---

## 🐛 Troubleshooting

### Emails not working?
1. Check SMTP credentials in `.env`
2. Verify Zoho Mail settings
3. Test with: `node test-smtp.js`

### Form submission slow?
1. Emails are sent asynchronously
2. Response should be instant
3. Check console for timing

### Database connection issues?
1. Verify MongoDB URI
2. Check network access (Atlas)
3. Server will run in dev mode without DB

---

## 📞 Support

For deployment issues:
1. Check environment variables
2. Verify MongoDB connection
3. Test SMTP configuration
4. Check API health endpoint

---

**© 2026 Growphone. All rights reserved.****.
