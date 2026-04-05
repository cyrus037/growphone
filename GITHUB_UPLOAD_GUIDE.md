# 📤 GitHub Upload Guide - GrowPhone Project

## Prerequisites

1. **Install Git** (if not installed):
   - Download from: https://git-scm.com/download/win
   - Install with default settings
   - Restart PowerShell/Command Prompt

2. **Create GitHub Account** (if you don't have one):
   - Go to https://github.com
   - Sign up for free account

## Step 1: Initialize Git Repository

Open PowerShell/Command Prompt and run:

```bash
# Navigate to your project folder
cd "C:\Users\nishi\OneDrive\Desktop\GP\GP"

# Initialize Git repository
git init

# Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 2: Create GitHub Repository

1. **Go to GitHub.com** → Click **"New"** (or **"+" icon**)
2. **Repository name**: `growphone` 
3. **Description**: `GrowPhone - Social Media Marketing Agency Website`
4. **Choose**: 
   - ✅ **Public** (recommended for deployment)
   - ❌ **Add a README file** (we already have one)
   - ❌ **Add .gitignore** (we already have one)
   - ❌ **Choose a license** (optional)

5. **Click "Create repository"**
6. **Copy the repository URL** (HTTPS): `https://github.com/username/growphone.git`

## Step 3: Add Files and Commit

```bash
# Add all files to Git
git add .

# Check what will be committed
git status

# Create first commit
git commit -m "Initial commit: GrowPhone social media agency website

- React frontend with Vite
- Node.js/Express backend
- MongoDB database
- Email system with Zoho SMTP
- Admin panel for content management
- Deployment ready for Netlify + Render"
```

## Step 4: Push to GitHub

```bash
# Add GitHub repository as remote
git remote add origin https://github.com/username/growphone.git

# Push to GitHub (main branch)
git push -u origin main
```

**If you get an error about main vs master:**
```bash
git branch -M main
git push -u origin main
```

## Step 5: Verify Upload

1. **Go to your GitHub repository**
2. **Check all files are there**:
   - ✅ `client/` folder with React app
   - ✅ `server/` folder with Node.js API
   - ✅ `README.md`
   - ✅ `DEPLOYMENT_GUIDE.md`
   - ✅ `.gitignore` (should be visible)

## What Gets Excluded (by .gitignore)

These files are NOT uploaded (good for security):
- `node_modules/` folders
- `client/dist/` build files
- `server/.env` (your secret keys)
- Log files
- `.DS_Store` (Mac files)

## Step 6: Ready for Deployment

Once uploaded to GitHub:

1. **Render.com** → Connect your GitHub repo
2. **Netlify.com** → Connect your GitHub repo
3. **Both services** will automatically detect the structure

## Troubleshooting

### "Git is not recognized"
```bash
# Install Git first, then restart PowerShell
# https://git-scm.com/download/win
```

### "Authentication failed"
```bash
# Use GitHub CLI or Personal Access Token
# Or create SSH key: ssh-keygen -t rsa -b 4096 -C "your@email.com"
```

### "Permission denied"
```bash
# Make sure you're repository owner or have collaborator access
```

## Quick Commands Summary

```bash
# One-time setup
git init
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Add & commit
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/username/growphone.git
git push -u origin main
```

## Next Steps After Upload

1. ✅ **Repository live on GitHub**
2. ✅ **Ready for Render deployment**
3. ✅ **Ready for Netlify deployment**
4. ✅ **Deployment services can auto-detect your project**

Once uploaded, follow the `DEPLOYMENT_GUIDE.md` to go live!
