# Vercel Deployment Guide - BookBeacon

This guide will walk you through deploying your LibraryLive (BookBeacon) application to Vercel as two separate projects: one for the frontend and one for the backend.

## 📋 Prerequisites

Before you begin, make sure you have:

- A [Vercel account](https://vercel.com/signup)
- A [Clerk account](https://clerk.com) with your application set up
- A PostgreSQL database (we recommend [Neon](https://neon.tech) for serverless PostgreSQL)
- Your GitHub repository pushed with the latest changes

---

## 🎯 Deployment Overview

You will create **two separate Vercel projects**:

1. **Frontend Project** - Serves the React application (from `client/` folder)
2. **Backend Project** - Serves the API as serverless functions (from `server/` folder)

---

## 🚀 Part 1: Deploy the Backend (API)

### Step 1: Create New Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Click **"Import"**

### Step 2: Configure Backend Project

On the project configuration page:

#### Project Settings
- **Project Name:** `bookbeacon-api` (or your preferred name)
- **Framework Preset:** Other
- **Root Directory:** Click **"Edit"** and select `server`
- **Build Command:** `npm run build`
- **Output Directory:** Leave empty (serverless functions)
- **Install Command:** `npm install`

#### Environment Variables

Click **"Environment Variables"** and add the following:

| Name | Value | Notes |
|------|-------|-------|
| `DATABASE_URL` | `postgres://user:pass@host:port/db?sslmode=require` | Your PostgreSQL connection string |
| `CLERK_SECRET_KEY` | `sk_test_...` | From Clerk Dashboard → API Keys |
| `CLERK_PUBLISHABLE_KEY` | `pk_test_...` | From Clerk Dashboard → API Keys |
| `NODE_ENV` | `production` | Production environment |
| `FRONTEND_URL` | Leave empty for now | Will add after frontend deployment |

> **Note:** You'll update `FRONTEND_URL` after deploying the frontend.

### Step 3: Deploy Backend

1. Click **"Deploy"**
2. Wait for the deployment to complete (usually 1-2 minutes)
3. Once deployed, **copy your backend URL** (e.g., `https://bookbeacon-api.vercel.app`)
4. Keep this URL handy - you'll need it for the frontend

### Step 4: Initialize Database

After deployment, you need to push your database schema:

1. On your local machine, update `server/.env` with your production `DATABASE_URL`
2. Run: `cd server && npm run db:push`
3. This will create the necessary tables in your production database

---

## 🎨 Part 2: Deploy the Frontend

### Step 1: Create New Vercel Project

1. Go back to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import the **same GitHub repository** again
4. Click **"Import"**

### Step 2: Configure Frontend Project

On the project configuration page:

#### Project Settings
- **Project Name:** `bookbeacon` (or your preferred name)
- **Framework Preset:** Vite
- **Root Directory:** Click **"Edit"** and select `client`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Environment Variables

Click **"Environment Variables"** and add the following:

| Name | Value | Notes |
|------|-------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | From Clerk Dashboard → API Keys |
| `VITE_API_URL` | `https://bookbeacon-api.vercel.app` | Your backend URL from Part 1 |
| `NODE_ENV` | `production` | Production environment |

> **Important:** Use the exact backend URL you copied in Part 1 (without trailing slash)

### Step 3: Deploy Frontend

1. Click **"Deploy"**
2. Wait for the deployment to complete
3. Once deployed, **copy your frontend URL** (e.g., `https://bookbeacon.vercel.app`)

---

## 🔄 Part 3: Update Backend with Frontend URL

Now that you have both URLs, you need to update the backend to allow CORS from your frontend:

1. Go to your **Backend Project** in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Find `FRONTEND_URL` and update it with your frontend URL (e.g., `https://bookbeacon.vercel.app`)
4. Click **"Save"**
5. Go to **Deployments** tab
6. Click the **"..."** menu on the latest deployment
7. Click **"Redeploy"** to apply the new environment variable

---

## 🔐 Part 4: Configure Clerk

Update your Clerk application to allow your production URLs:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **"Configure"** → **"Domains"**
4. Add your frontend URL: `https://bookbeacon.vercel.app`
5. Navigate to **"API Keys"** and verify you're using the correct keys

---

## ✅ Part 5: Verify Deployment

### Test Your Application

1. Visit your frontend URL: `https://bookbeacon.vercel.app`
2. You should see the login page
3. Sign in with Clerk authentication
4. Verify that the dashboard loads and shows occupancy data
5. Test the "Simulate" button to ensure API communication works

### Troubleshooting

If you encounter issues:

#### CORS Errors
- Verify `FRONTEND_URL` is set correctly in backend environment variables
- Make sure there's no trailing slash in the URL
- Redeploy the backend after changing environment variables

#### Authentication Errors
- Check that Clerk keys match between dashboard and environment variables
- Verify your frontend domain is added in Clerk settings
- Ensure you're using the correct environment (development vs production keys)

#### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check that your database allows connections from Vercel IPs
- Run `npm run db:push` to ensure schema is up to date

#### API Not Found (404)
- Verify `VITE_API_URL` in frontend environment variables
- Check that backend deployment was successful
- Test backend API directly: `https://your-backend.vercel.app/api/occupancy`

---

## 🔄 Continuous Deployment

Both projects are now set up for automatic deployments:

- **Push to `main` branch** → Automatic deployment to production
- **Push to other branches** → Preview deployments (with unique URLs)

### Update Environment Variables

If you need to change environment variables:

1. Go to Vercel Dashboard → Your Project
2. Navigate to **Settings** → **Environment Variables**
3. Update the variable
4. **Important:** Redeploy the project to apply changes

---

## 📁 About the `.local` Folder

The `.local` folder in your project root is used for **local development data and cache**:

- **Purpose:** Stores local development files, temporary data, and Replit-specific configurations
- **Contents:** May include local database files, session data, or development logs
- **Git Status:** Already in `.gitignore` - not tracked or deployed
- **Vercel:** This folder is ignored during deployment and has no impact on production

You can safely ignore this folder - it's only used for local development.

---

## 📊 Project URLs Summary

After deployment, you'll have:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `https://bookbeacon.vercel.app` | User-facing application |
| Backend | `https://bookbeacon-api.vercel.app` | API endpoints |
| Database | Your Neon/PostgreSQL URL | Data storage |

---

## 🎉 You're Done!

Your BookBeacon application is now live on Vercel with:

✅ Separate frontend and backend deployments  
✅ Automatic deployments on git push  
✅ Serverless architecture for scalability  
✅ Secure authentication with Clerk  
✅ PostgreSQL database integration  

For any issues or questions, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Neon Documentation](https://neon.tech/docs)
