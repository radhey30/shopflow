# ShopFlow

A full-stack E-Commerce app built with the MERN stack + TypeScript.

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite + Zustand
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (Access + Refresh token pattern)

## Getting Started

### Backend
cd backend
npm install
npm run dev

### Frontend
cd frontend
npm install
npm run dev

## Environment Variables
Create a `.env` file in `/backend` with:
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development