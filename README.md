# LibraryLive (BookBeacon)

A real-time library occupancy tracking system with RFID integration, featuring separate frontend and backend deployments.

## 📁 Project Structure

```
LibraryLive/
├── client/          # Frontend application (React + Vite)
├── server/          # Backend application (Express + PostgreSQL)
├── .git/            # Git repository
└── README.md        # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL database (Neon recommended)
- Clerk account for authentication
- Vercel account for deployment

### Local Development

#### 1. Clone the repository

```bash
git clone <your-repo-url>
cd LibraryLive
```

#### 2. Set up the Server

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database and Clerk credentials
npm run db:push
npm run dev
```

The server will start on `http://localhost:5000`

#### 3. Set up the Client

```bash
cd client
npm install
cp .env.example .env
# Edit .env with your Clerk publishable key and API URL
npm run dev
```

The client will start on `http://localhost:5173`

## 📦 Deployment

### Deploy to Vercel

This project is designed for separate deployments:

#### Backend Deployment

1. Create a new Vercel project for the backend
2. Set the root directory to `server`
3. Add environment variables from `server/.env.example`:
   - `DATABASE_URL`
   - `CLERK_SECRET_KEY`
   - `CLERK_PUBLISHABLE_KEY`
   - `FRONTEND_URL` (your frontend Vercel URL)
   - `NODE_ENV=production`
4. Deploy!

#### Frontend Deployment

1. Create a new Vercel project for the frontend
2. Set the root directory to `client`
3. Add environment variables from `client/.env.example`:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_URL` (your backend Vercel URL)
   - `NODE_ENV=production`
4. Deploy!

### Post-Deployment

1. Update `FRONTEND_URL` in your backend environment variables with the actual frontend URL
2. Update `VITE_API_URL` in your frontend environment variables with the actual backend URL
3. Redeploy both applications

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Radix UI
- **State Management**: TanStack Query
- **Authentication**: Clerk
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk SDK
- **WebSocket**: ws

## 📚 Features

- 🔐 Secure authentication with Clerk
- 📊 Real-time occupancy tracking
- 📈 Historical trends and analytics
- 🎨 Beautiful glassmorphic UI with dark mode
- 📱 Responsive design
- 🔄 Live data updates via WebSocket
- 🎯 RFID simulation for testing

## 🧪 Development Scripts

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check

### Server
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check
- `npm run db:push` - Push database schema
- `npm run db:seed` - Seed database with test data

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
