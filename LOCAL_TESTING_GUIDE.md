# 🧪 Local Testing Guide for Dynamic Footer System

## 📋 Prerequisites

### 1. MongoDB Setup
Choose one of the following options:

#### Option A: Local MongoDB Installation
```bash
# Install MongoDB Community Server
# Download from: https://www.mongodb.com/try/download/community

# Start MongoDB service
# Windows: Start MongoDB service from Services
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)
```bash
# 1. Create free account at https://www.mongodb.com/atlas
# 2. Create a free cluster
# 3. Get your connection string
# 4. Add your IP to whitelist (0.0.0.0/0 for testing)
```

#### Option C: Docker MongoDB
```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Environment Variables Setup

#### For Local MongoDB:
```bash
cd server
cp .env.local .env
# Edit .env with your MongoDB URI
```

#### For MongoDB Atlas:
```bash
cd server
cp .env.atlas .env
# Replace the connection string with your Atlas URI
```

## 🚀 Quick Start Testing

### Step 1: Install Dependencies
```bash
# Server dependencies
cd server
npm install

# Client dependencies  
cd ../client
npm install
```

### Step 2: Test Database Connection
```bash
cd server
# Test with mock data (no DB required)
node testFooterMock.js

# Test with real database (MongoDB must be running)
node testFooterLocal.js
```

### Step 3: Seed Test Data
```bash
cd server
# Only run if MongoDB is connected
node seedFooter.js
```

### Step 4: Start Development Servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## 🧪 Testing Checklist

### ✅ Database Tests
- [ ] MongoDB connection successful
- [ ] Footer settings created
- [ ] Footer links created and grouped
- [ ] Data retrieval working
- [ ] API response format correct

### ✅ API Tests
```bash
# Test endpoints (run these commands in another terminal)
curl http://localhost:5000/api/health
curl http://localhost:5000/api/footer
curl -X GET http://localhost:5000/api/footer/links
```

### ✅ Frontend Tests
- [ ] Footer renders on all pages
- [ ] Social media icons display correctly
- [ ] Footer links are grouped properly
- [ ] Contact information shows
- [ ] Responsive design works
- [ ] Loading states display
- [ ] Error handling works

### ✅ Admin Panel Tests
- [ ] Can access footer management section
- [ ] Can edit footer settings
- [ ] Can add/edit/delete footer links
- [ ] Changes reflect on live site
- [ ] Validation works correctly

## 📁 Environment Variables Reference

### Required Variables:
```env
MONGODB_URI=mongodb://localhost:27017/growphone_footer_test
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173,http://127.0.0.1:5173
PORT=5000
```

### Optional Variables:
```env
ADMIN_RECOVERY_KEY=
ADMIN_EMAIL=admin@growphone.in
SMTP_HOST=smtp.zoho.in
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@growphone.in
SMTP_PASS=your-email-password
MAIL_FROM=info@growphone.in
ADMIN_NOTIFICATION_EMAIL=admin@example.com
```

## 🔧 Troubleshooting

### Common Issues:

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running locally or use MongoDB Atlas

#### 2. Environment Variables Not Loading
```
Error: MONGODB_URI is undefined
```
**Solution:** Check that .env file exists and has correct variables

#### 3. CORS Errors in Browser
```
Access-Control-Allow-Origin error
```
**Solution:** Ensure CLIENT_URL includes your frontend URL

#### 4. Footer Not Showing
**Solution:** Check browser console for API errors, verify server is running

### Debug Commands:
```bash
# Check MongoDB connection
node -e "require('dotenv').config(); console.log('MongoDB URI:', process.env.MONGODB_URI)"

# Test API directly
curl -v http://localhost:5000/api/footer

# Check server logs
npm run dev
```

## 📊 Test Data Examples

### Sample Footer Settings:
```json
{
  "logo_url": "https://example.com/logo.png",
  "description": "Your company description here",
  "facebook_url": "https://facebook.com/yourpage",
  "instagram_url": "https://instagram.com/yourprofile",
  "linkedin_url": "https://linkedin.com/company/yourcompany",
  "twitter_url": "https://twitter.com/yourhandle",
  "youtube_url": "https://youtube.com/yourchannel",
  "contact_email": "info@yourcompany.com",
  "contact_phone": "+91 98765 43210",
  "address": "Your address here",
  "copyright_text": "© 2024 Your Company. All rights reserved."
}
```

### Sample Footer Links:
```json
[
  {
    "title": "Services",
    "label": "Social Media Management",
    "url": "/services",
    "order_index": 0,
    "is_active": true
  },
  {
    "title": "Company", 
    "label": "About Us",
    "url": "/about",
    "order_index": 0,
    "is_active": true
  }
]
```

## 🎯 Success Criteria

Your local testing is successful when:

1. ✅ **Database Connected**: MongoDB connection established
2. ✅ **API Working**: All footer endpoints return correct data
3. ✅ **Frontend Rendering**: Footer displays correctly on all pages
4. ✅ **Admin Management**: Can edit footer from admin panel
5. ✅ **Real-time Updates**: Changes appear immediately on live site
6. ✅ **Responsive Design**: Footer works on mobile, tablet, desktop
7. ✅ **Error Handling**: Graceful fallbacks when API fails

## 🚀 Next Steps

After successful local testing:

1. **Deploy to Staging**: Test on a staging environment
2. **Performance Testing**: Check API response times
3. **User Testing**: Get feedback from actual users
4. **Production Deployment**: Deploy to production environment
5. **Monitoring**: Set up error tracking and analytics

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure MongoDB is accessible
4. Check browser console for JavaScript errors
5. Review server logs for backend errors

Happy testing! 🎉
