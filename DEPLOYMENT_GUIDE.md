# 🚀 GrowPhone Live Deployment Guide

## Step 1: Deploy Backend (Render)

1. **Go to [Render.com](https://render.com)**
2. **New Web Service** → Connect your Git repo
3. **Settings:**
   - Name: `growphone-api`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free (to start)

4. **Environment Variables** (copy from `server/production-env-template.txt`):
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate new secure key
   - `CLIENT_URL`: `https://growphone.in,https://www.growphone.in`
   - All SMTP variables (update password)

5. **Deploy** → Wait for it to finish
6. **Copy your API URL**: `https://growphone-api.onrender.com`

## Step 2: Deploy Frontend (Netlify)

1. **Go to [Netlify](https://netlify.com)**
2. **Add new site** → Connect your Git repo
3. **Build Settings:**
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Environment Variables:**
   - `VITE_API_URL`: Your Render API URL (no trailing slash)
   - Example: `VITE_API_URL=https://growphone-api.onrender.com`

5. **Deploy** → Wait for build to complete

## Step 3: Configure Domain & DNS

### Netlify (Frontend)
1. **Domain settings** → Add custom domain
2. **Add**: `growphone.in` and `www.growphone.in`
3. **Copy DNS records** from Netlify

### Domain Registrar (Where you bought growphone.in)
1. **Add Netlify DNS records** (from Netlify dashboard)
2. **Add MX Records for Zoho**:
   ```
   Type: MX
   Host: @
   Value: mx.zoho.com
   Priority: 10

   Type: MX  
   Host: @
   Value: mx2.zoho.com
   Priority: 20

   Type: MX
   Host: @
   Value: mx3.zoho.com
   Priority: 50
   ```

### Optional: API Subdomain
1. **Render** → Custom domain → `api.growphone.in`
2. **Add DNS record**: `CNAME api → growphone-api.onrender.com`
3. **Update Netlify**: `VITE_API_URL=https://api.growphone.in`

## Step 4: Final Setup

### Seed Production Database
```bash
# After backend is live, run once:
cd server
MONGODB_URI=your-production-uri npm run seed
```

### Test Everything
1. ✅ Visit `https://growphone.in` - should load
2. ✅ Try contact form - should save lead
3. ✅ Admin portal: `https://growphone.in/admin-portal`
4. ✅ Emails will work after MX propagation (24-48 hours)

## What Happens When MX Records Propagate

**Email Auto-Activation:**
- ✅ User confirmation emails start sending
- ✅ Admin notification emails start sending  
- ✅ Contact form becomes fully functional
- ✅ No code changes needed - just works!

## Timeline

- **Today**: Website goes live instantly
- **24-48 hours**: Email functionality activates automatically
- **After propagation**: Full lead generation system working

## Troubleshooting

**If emails don't work after 48 hours:**
1. Check MX records: `nslookup -type=mx growphone.in`
2. Verify Zoho domain settings
3. Test SMTP: Check Render logs
4. Fallback: Use Gmail SMTP temporarily

**Quick verification commands:**
```bash
# Check MX records
dig mx growphone.in

# Test API
curl https://your-api.onrender.com/api/health
```

That's it! Your site will be live today, and emails will auto-start working once DNS propagates.
