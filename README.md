# Naav Bins

Naav Bins is an AI-powered waste management and reward platform designed to make recycling more engaging, efficient, and community-driven. The app lets users scan waste items, classify them using machine learning, identify the correct bin, and earn rewards in the form of wallet credits and eco points.

## Overview

The platform combines:
- AI-based waste recognition
- interactive smart-bin guidance
- digital wallet and redemption system
- user dashboard and leaderboard
- admin monitoring for operational insights

This project is built as a full-stack web application using a React frontend and a Node.js/Express backend, with Firebase and Supabase powering authentication and app data.

## Key Features

### AI Waste Recognition
- Real-time waste classification using TensorFlow.js and Teachable Machine
- Supports categories such as Plastic and Organic
- Helps users decide the correct bin before disposal

### Smart Bin Experience
- QR-based presence validation before scan submission
- Waste type detection and guided segregation
- Bin suggestions and user-friendly disposal flow

### Rewards and Wallet System
- Earn rewards for recycling activity
- Example reward logic:
  - Plastic: ₹10 + 50 Eco Points
  - Organic: ₹7 + 20 Eco Points
- Track wallet balance, redemption history, and eco-point activity
- Redeem points or wallet balance for rewards and vouchers

### Dashboard and Analytics
- Personal dashboard with activity logs
- Waste distribution insights
- Earnings trend charts using Recharts
- Leaderboard for eco-conscious users

### Admin Console
- Overview of total users, distributed funds, and impact metrics
- User management and searchable profile lists
- Monitoring of wallet status and user activity

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Recharts
- Lucide React
- React Webcam
- Leaflet + React Leaflet
- Axios

### Backend
- Node.js
- Express.js

### Authentication and Data
- Firebase Admin SDK
- Firebase Firestore
- Supabase
- JWT and bcryptjs

### AI / ML
- TensorFlow.js
- Teachable Machine

## Project Structure

```text
naav-bins/
├── client/
│   └── smartbin/
│       ├── public/
│       ├── src/
│       ├── index.html
│       ├── package.json
│       ├── vite.config.js
│       ├── tailwind.config.js
│       └── postcss.config.js
├── server/
│   ├── index.js
│   ├── package.json
│   └── serviceAccountKey.json
├── package.json
├── README.md
└── .gitignore
```

## Prerequisites

Before running the project locally, make sure you have:
- Node.js 18 or newer
- npm
- Firebase project setup
- Supabase project setup
- A Teachable Machine model URL (for AI classification)

## Setup Instructions

### 1) Install backend dependencies

```bash
cd server
npm install
```

### 2) Configure Firebase and Supabase

The backend expects Firebase credentials and Supabase configuration.

#### Option A: Use Firebase service account JSON
Create a file named `server/serviceAccountKey.json` with your Firebase Admin SDK credentials.

#### Option B: Use environment variable
Set the following environment variable in your shell or `.env` file:

```bash
FIREBASE_CREDS='{"type":"service_account", ... }'
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
PORT=5000
```

### 3) Start the backend

```bash
cd server
node index.js
```

The server should start successfully and connect to Firebase and Supabase.

### 4) Install frontend dependencies

```bash
cd client/smartbin
npm install
```

### 5) Start the frontend

```bash
cd client/smartbin
npm run dev
```

Then open:

```text
http://localhost:5173
```

## AI Model Configuration

The app uses a Teachable Machine model URL in the frontend scanner logic.

Open the scanner component and replace the model URL with your own imported model:

```js
const URL = "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/";
```

This model should classify the waste into labels such as:
- Plastic
- Organic

## Admin Access

To access the admin dashboard:
1. Register a new user in the app
2. Open your Firebase Firestore database
3. Go to the `users` collection
4. Update the user role from `user` to `admin`
5. Log out and log back in

## Usage Flow

1. User registers or logs in
2. User scans waste via the app
3. AI identifies the waste category
4. System directs the user to the correct bin
5. User earns wallet credit and eco points
6. Wallet and redemption history are updated
7. Admin monitors user activity and platform stats

## Future Improvements

- Hardware integration for automated bin lid opening
- Expanded waste categories and classification accuracy
- Leaderboard and gamified recycling challenges
- Stripe or Razorpay integration for payout processing
- Location-based smart bin analytics

## License

This project is currently distributed without a formal license declaration.

## Notes

This repository is a prototype / demo application focused on waste segregation, digital rewards, and environmental awareness. It is suitable for hackathon, startup MVP, and campus project use cases.
