# LibraryLive - Vercel Deployment Guide

## Overview

Deploy LibraryLive as **two separate Vercel projects** from the **same repository**:
- **Backend**: Serverless API functions
- **Frontend**: Static React application

---

## Prerequisites

- ✅ GitHub repository with your code pushed
- ✅ Vercel account (free tier works)
- ✅ Environment variables ready (from your `.env` file)

---

## Step 1: Deploy Backend First

### 1.1 Create Backend Project on Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your repository: `bharat-krishna-verma/BookBeacon`
4. Click **"Import"**

### 1.2 Configure Backend Project

**Project Settings:**
- **Project Name**: `librarylive-backend` (or your choice)
- **Framework Preset**: `Other`
- **Root Directory**: `.` (leave as root)

**Build & Output Settings:**
- **Build Command**: Leave empty (no build needed)
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### 1.3 Add Backend Environment Variables

Click **"Environment Variables"** and add:

```
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
NODE_ENV=production
```

> **Important**: Use your actual values from your local `.env` file

### 1.4 Deploy Backend

1. Click **"Deploy"**
2. Wait for deployment to complete (~2-3 minutes)
3. **Copy your backend URL** (e.g., `https://librarylive-backend.vercel.app`)

### 1.5 Test Backend

Visit: `https://your-backend-url.vercel.app/api/rfid`

You should see RFID data response.

---

## Step 2: Update Frontend Configuration

### 2.1 Edit vercel.frontend.json

Open `vercel.frontend.json` and update line 7 with your actual backend URL:

```json
{
  "buildCommand": "npm run build:frontend",
  "outputDirectory": "dist/public",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://librarylive-backend.vercel.app/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Replace `https://librarylive-backend.vercel.app` with your actual backend URL.

### 2.2 Commit and Push

```bash
git add vercel.frontend.json
git commit -m "Update frontend with backend URL"
git push origin main
```

---

## Step 3: Deploy Frontend

### 3.1 Create Frontend Project on Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select **the same repository**: `bharat-krishna-verma/BookBeacon`
4. Click **"Import"**

### 3.2 Configure Frontend Project

**Project Settings:**
- **Project Name**: `librarylive-frontend` (or your choice)
- **Framework Preset**: `Vite`
- **Root Directory**: `.` (leave as root)

**Build & Output Settings:**
- **Build Command**: `npm run build:frontend`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

### 3.3 Add Frontend Environment Variables

Click **"Environment Variables"** and add:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
NODE_ENV=production
```

### 3.4 Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment to complete (~3-5 minutes)
3. **Copy your frontend URL** (e.g., `https://librarylive-frontend.vercel.app`)

---

## Step 4: Final Configuration

### 4.1 Update Backend with Frontend URL

1. Go to your **backend project** in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   ```
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
4. Go to **Deployments** tab
5. Click **⋯** on latest deployment → **Redeploy**

### 4.2 Update Clerk Dashboard

1. Go to https://dashboard.clerk.com
2. Select your application
3. Navigate to **Settings** → **Allowed Origins**
4. Add both URLs:
   - `https://librarylive-backend.vercel.app`
   - `https://librarylive-frontend.vercel.app`

---

## Step 5: Test Your Deployment

### Test Backend
Visit: `https://your-backend-url.vercel.app/api/rfid`
- ✅ Should return RFID data

### Test Frontend
Visit: `https://your-frontend-url.vercel.app`
- ✅ Should load the dashboard
- ✅ Sign in should work
- ✅ Data should load from backend

---

## Important Notes

### Using vercel.json Files

Your repository has three Vercel config files:

1. **`vercel.json`** - Used by backend deployment (automatically detected)
2. **`vercel.backend.json`** - Backup copy of backend config
3. **`vercel.frontend.json`** - Used by frontend deployment (automatically detected)

Vercel automatically uses the correct config based on your build settings.

### Automatic Deployments

After initial setup, both projects will auto-deploy when you push to `main`:
- Changes to `/server`, `/api`, `/shared` → Backend redeploys
- Changes to `/client` → Frontend redeploys
- Changes to both → Both redeploy

---

## Troubleshooting

### Backend Issues

**Problem**: API returns 500 errors
- ✅ Check environment variables are set correctly
- ✅ Check database connection string
- ✅ View logs in Vercel dashboard

**Problem**: CORS errors
- ✅ Verify `FRONTEND_URL` is set in backend
- ✅ Check Clerk allowed origins

### Frontend Issues

**Problem**: API calls fail
- ✅ Verify backend URL in `vercel.frontend.json`
- ✅ Check backend is deployed and accessible
- ✅ Test backend API endpoint directly

**Problem**: Authentication doesn't work
- ✅ Check Clerk publishable key
- ✅ Verify both URLs in Clerk dashboard
- ✅ Check browser console for errors

---

## Summary

✅ **Two separate Vercel projects** from one repository  
✅ **Backend**: Serverless functions at `/api`  
✅ **Frontend**: Static site with API proxy  
✅ **Auto-deploy**: Push to main triggers deployment  

Your LibraryLive application is now live on Vercel! 🚀
