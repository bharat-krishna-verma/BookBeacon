# Separate Frontend & Backend Deployment Guide

This guide explains how to deploy your LibraryLive application as **two separate Vercel projects**: one for the frontend (React) and one for the backend (Express API).

## Architecture

```
Frontend (Vercel)          Backend (Vercel)
┌─────────────────┐       ┌──────────────────┐
│  React + Vite   │──────▶│  Express API     │
│  Clerk Auth     │       │  PostgreSQL      │
└─────────────────┘       └──────────────────┘
```

---

## Part 1: Deploy Backend (API)

### Step 1: Create Backend Repository

```bash
# Create a new directory for backend
mkdir LibraryLive-Backend
cd LibraryLive-Backend

# Copy backend files
cp -r ../LibraryLive/server .
cp -r ../LibraryLive/shared .
cp ../LibraryLive/package.json .
cp ../LibraryLive/tsconfig.json .
cp ../LibraryLive/drizzle.config.ts .
cp ../LibraryLive/vercel.backend.json ./vercel.json

# Initialize Git
git init
git add .
git commit -m "Initial backend commit"
```

### Step 2: Update package.json for Backend

Edit `package.json` and keep only backend dependencies:

```json
{
  "name": "librarylive-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "esbuild server/index-prod.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js",
    "start": "node dist/index.js",
    "dev": "tsx server/index-dev.ts"
  }
}
```

### Step 3: Deploy Backend to Vercel

1. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/LibraryLive-Backend.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → New Project
3. Import `LibraryLive-Backend` repository
4. **Build Settings**:
   - Framework: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Environment Variables**:
   ```
   DATABASE_URL=postgres://username:password@your-database-host.com:port/database?sslmode=require
   
   CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
   
   CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
   
   NODE_ENV=production
   ```

6. Click **Deploy**

7. **Note your backend URL**: `https://your-backend.vercel.app`

---

## Part 2: Deploy Frontend (React)

### Step 1: Create Frontend Repository

```bash
# Create a new directory for frontend
mkdir LibraryLive-Frontend
cd LibraryLive-Frontend

# Copy frontend files
cp -r ../LibraryLive/client .
cp -r ../LibraryLive/shared .
cp ../LibraryLive/package.json .
cp ../LibraryLive/tsconfig.json .
cp ../LibraryLive/vite.config.ts .
cp ../LibraryLive/tailwind.config.ts .
cp ../LibraryLive/postcss.config.js .
cp ../LibraryLive/components.json .
cp -r ../LibraryLive/public .
cp ../LibraryLive/vercel.frontend.json ./vercel.json

# Initialize Git
git init
git add .
git commit -m "Initial frontend commit"
```

### Step 2: Update vercel.json with Backend URL

Edit `vercel.json` and replace `your-backend.vercel.app` with your actual backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-actual-backend.vercel.app/api/:path*"
    }
  ]
}
```

### Step 3: Update package.json for Frontend

Edit `package.json` and keep only frontend dependencies:

```json
{
  "name": "librarylive-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Step 4: Deploy Frontend to Vercel

1. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/LibraryLive-Frontend.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → New Project
3. Import `LibraryLive-Frontend` repository
4. **Build Settings**:
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist/public`

5. **Environment Variables**:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
   
   VITE_API_URL=https://your-backend.vercel.app
   
   NODE_ENV=production
   ```

6. Click **Deploy**

---

## Part 3: Update Clerk Settings

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to your application
3. **Add Allowed Origins**:
   - `https://your-frontend.vercel.app`
   - `https://your-backend.vercel.app`
4. **Update Redirect URLs**:
   - Sign-in: `https://your-frontend.vercel.app`
   - Sign-out: `https://your-frontend.vercel.app`

---

## Part 4: Update CORS (Backend)

Update `server/index-prod.ts` or `server/app.ts` to allow your frontend domain:

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app',
  credentials: true
}));
```

Then redeploy backend.

---

## Testing

1. **Backend**: Visit `https://your-backend.vercel.app/api/rfid`
   - Should return mock RFID data

2. **Frontend**: Visit `https://your-frontend.vercel.app`
   - Should load the dashboard
   - Sign in should work
   - Data should load from backend

---

## Continuous Deployment

Both projects will auto-deploy on push to `main`:

**Backend**:
```bash
cd LibraryLive-Backend
git add .
git commit -m "Update API"
git push origin main
```

**Frontend**:
```bash
cd LibraryLive-Frontend
git add .
git commit -m "Update UI"
git push origin main
```

---

## Environment Variables Summary

### Backend (.env.backend)
```
DATABASE_URL=...
CLERK_SECRET_KEY=...
CLERK_PUBLISHABLE_KEY=...
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend (.env.frontend)
```
VITE_CLERK_PUBLISHABLE_KEY=...
VITE_API_URL=https://your-backend.vercel.app
NODE_ENV=production
```

---

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` in backend environment variables
- Check CORS configuration in `server/app.ts`
- Ensure backend `vercel.json` has CORS headers

### API Not Found
- Verify `VITE_API_URL` in frontend environment variables
- Check `vercel.json` rewrites in frontend
- Ensure backend is deployed and accessible

### Authentication Issues
- Verify Clerk dashboard has both URLs added
- Check Clerk API keys in both projects
- Ensure cookies are enabled

---

## File Structure

### Backend Repository
```
LibraryLive-Backend/
├── server/
├── shared/
├── vercel.json (from vercel.backend.json)
├── package.json
└── tsconfig.json
```

### Frontend Repository
```
LibraryLive-Frontend/
├── client/
├── shared/
├── public/
├── vercel.json (from vercel.frontend.json)
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```
