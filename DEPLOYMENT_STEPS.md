# Quick Deployment Instructions

## Backend Deployment (Deploy This First!)

### Step 1: Commit and Push Changes
```bash
git add .
git commit -m "Configure Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import repository: `bharat-krishna-verma/BookBeacon`
3. **Project Name**: `librarylive-backend`
4. **Framework**: Other
5. **Root Directory**: Leave as `.` (root)
6. **Build Command**: Leave empty (no build needed for backend)
7. **Output Directory**: Leave empty
8. **Install Command**: `npm install`

### Step 3: Add Environment Variables
Add these in Vercel dashboard (get values from your local `.env` file):
```
DATABASE_URL=your_actual_database_url
CLERK_SECRET_KEY=your_actual_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_actual_clerk_publishable_key
NODE_ENV=production
```

### Step 4: Deploy
Click "Deploy" and wait for completion.

### Step 5: Note Your Backend URL
After deployment, copy your backend URL (e.g., `https://librarylive-backend.vercel.app`)

---

## Frontend Deployment (Deploy After Backend!)

### Step 1: Update Frontend Configuration
Edit `vercel.frontend.json` line 7 with your actual backend URL:
```json
"destination": "https://YOUR-BACKEND-URL.vercel.app/api/:path*"
```

Commit and push:
```bash
git add vercel.frontend.json
git commit -m "Update frontend with backend URL"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import **same repository**: `bharat-krishna-verma/BookBeacon`
3. **Project Name**: `librarylive-frontend`
4. **Framework**: Vite
5. **Root Directory**: Leave as `.` (root)
6. **Build Command**: `npm run build:frontend`
7. **Output Directory**: `dist/public`
8. **Install Command**: `npm install`

### Step 3: Add Environment Variables
```
VITE_CLERK_PUBLISHABLE_KEY=your_actual_clerk_publishable_key
NODE_ENV=production
```

### Step 4: Deploy
Click "Deploy" and wait for completion.

---

## Final Configuration

### Update Backend CORS
1. Go to backend Vercel project → Settings → Environment Variables
2. Add: `FRONTEND_URL=https://your-frontend-url.vercel.app`
3. Redeploy backend (Deployments → ⋯ → Redeploy)

### Update Clerk Dashboard
1. Go to https://dashboard.clerk.com
2. Add both URLs to Allowed Origins:
   - `https://your-backend-url.vercel.app`
   - `https://your-frontend-url.vercel.app`

---

## Testing
- Backend: Visit `https://your-backend-url.vercel.app/api/rfid`
- Frontend: Visit `https://your-frontend-url.vercel.app`

## Architecture Notes

The backend uses Vercel's serverless functions:
- API routes are handled by `/api/index.js`
- Express app is initialized in the serverless function
- No build step required - Vercel handles the serverless function automatically

The frontend is a static Vite build:
- Built to `dist/public`
- API calls are proxied to the backend via Vercel rewrites
- SPA routing handled by fallback to `index.html`
