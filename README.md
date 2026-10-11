# ♻️ SmartBin — AI-Powered Smart Waste Management & Rewards Platform

SmartBin is a full-stack smart waste management platform that incentivizes responsible recycling through artificial intelligence and a real-time reward system. The platform addresses one of urban waste management's core challenges — the lack of motivation for citizens to segregate waste at the point of disposal.

The workflow is straightforward. A user locates a nearby smart bin through an in-app map, scans the QR code attached to the bin, and holds their waste item in front of the camera. A machine learning model trained on Teachable Machine instantly classifies the waste into one of six categories — Plastic, Metal, Paper and Cardboard, Organic, Glass, or Other Trash — and credits the user's wallet with a monetary reward along with eco-points. These points and funds can be redeemed for real-world benefits such as transport passes and entertainment vouchers.

The platform also includes a personal dashboard with earnings charts and activity logs, a leaderboard to encourage community participation, and an admin portal for monitoring platform-wide impact metrics such as total funds distributed and estimated CO₂ savings.

---

## 🌐 Live Application

| Component | Link |
|---|---|
| **SmartBin Frontend** | https://smart-bin-red.vercel.app |
| **Backend API** | https://sm-fe78a1f00f944cae95802987df054d40.ecs.ap-south-1.on.aws |
| **GitHub Repository** | https://github.com/ayush8771/smart-bin |

---

## ✨ Key Features

### 🤖 1. AI-Powered Waste Classification

SmartBin uses machine learning to help users identify and segregate waste correctly.

- Image classification using TensorFlow.js and Teachable Machine.
- Camera-based waste recognition.
- Supports six waste categories:
  - 🧴 Plastic
  - 🔩 Metal
  - 📦 Paper and Cardboard
  - 🌿 Organic
  - 🫙 Glass
  - 🗑️ Other Trash
- Provides a technology-driven approach to waste segregation.

### 🗺️ 2. Smart-Bin Location Discovery

Users can discover nearby smart bins through an interactive map.

- Displays smart-bin locations geographically.
- Retrieves bin information from the backend API.
- Shows bin names, coordinates, and status information.
- Helps users identify convenient waste disposal locations.

### 📷 3. QR-Based Waste Disposal Workflow

The platform connects waste recognition with the smart-bin experience.

1. Locate a nearby smart bin using the application map.
2. Scan the QR code attached to the selected bin.
3. Capture the waste item using the camera.
4. Allow the machine learning model to classify the waste.
5. Submit the waste-related activity through the application.
6. Receive the applicable wallet reward and eco-points.

### 🎁 4. Digital Wallet and Rewards

SmartBin encourages sustainable behaviour through a digital incentive system.

- Monetary wallet credits for eligible recycling activities.
- Eco-points accumulation.
- Wallet balance tracking.
- Reward redemption functionality.
- Redemption history and activity tracking.
- Potential real-world benefits, including transport passes and entertainment vouchers.

### 📊 5. Personalized User Dashboard

The dashboard provides users with an overview of their recycling activities and rewards.

Features include:

- Wallet balance.
- Accumulated eco-points.
- CO₂ savings information.
- Earnings trend charts.
- Waste distribution analytics.
- Recycling activity logs.
- Quick access to the smart-bin map.
- Navigation to the community leaderboard.

### 🏆 6. Community Leaderboard

The leaderboard encourages participation and friendly competition.

- Displays user rankings.
- Highlights recycling contributions.
- Encourages sustainable habits.
- Promotes community participation in responsible waste management.

### 🛡️ 7. Admin Portal

The administration interface provides tools for monitoring platform activity.

- User management.
- User information and account monitoring.
- Platform activity insights.
- Total funds distributed.
- Environmental impact metrics.
- Estimated CO₂ savings.

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | Component-based user interface |
| Vite | Development server and production build |
| Tailwind CSS | Styling and responsive layouts |
| React Router | Client-side navigation |
| Axios | HTTP requests to backend APIs |
| Lucide React | Icons |
| Recharts | Dashboard charts and analytics |
| React Webcam | Camera access |
| TensorFlow.js | Browser-based machine learning |
| Teachable Machine | Waste image classification |
| Leaflet | Interactive maps |
| React Leaflet | React integration for maps |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API and server |
| JSON Web Tokens (JWT) | Authentication tokens |
| bcryptjs | Password hashing |
| Firebase Admin SDK | Server-side Firebase integration |
| Supabase | Database and application data access |

### Cloud and Deployment

| Technology | Purpose |
|---|---|
| GitHub | Source code management |
| GitHub Actions | Backend build automation |
| Amazon ECR | Container image registry |
| Amazon ECS | Backend container hosting |
| Vercel | Frontend hosting and deployment |
| Firebase | Application authentication-related integration |
| Supabase | Database services |

---

## 🏗️ System Architecture

SmartBin follows a client-server architecture in which the frontend communicates with the backend through HTTP REST API requests.

```text
                      ┌─────────────────────────┐
                      │      SmartBin User      │
                      └────────────┬────────────┘
                                   │
                                   ▼
                      ┌─────────────────────────┐
                      │      React + Vite       │
                      │   Frontend on Vercel    │
                      └────────────┬────────────┘
                                   │
                             HTTPS Requests
                                   │
                                   ▼
                      ┌─────────────────────────┐
                      │    Node.js + Express    │
                      │   Backend on AWS ECS    │
                      └────────────┬────────────┘
                                   │
                         ┌─────────┴─────────┐
                         │                   │
                         ▼                   ▼
                ┌────────────────┐  ┌────────────────┐
                │ Firebase Admin │  │    Supabase    │
                │   Integration  │  │    Database    │
                └────────────────┘  └────────────────┘


                 Browser-Based AI Processing
                      ┌──────────────────────┐
                      │     TensorFlow.js    │
                      │  Teachable Machine   │
                      │   Image Classifier   │
                      └──────────────────────┘
```

### Application Workflow

1. The user accesses the SmartBin frontend.
2. The user registers or logs in.
3. The frontend communicates with the Express backend through REST APIs.
4. The user explores nearby smart-bin locations.
5. The user scans a bin's QR code and captures a waste image.
6. The machine learning model classifies the waste.
7. The application submits the relevant waste activity to the backend.
8. The platform processes the activity and applicable rewards.
9. The dashboard displays wallet information, eco-points, activity history, and impact metrics.

---

## 📁 Project Structure

```text
smart-bin/
│
├── client/
│   └── smartbin/
│       ├── public/
│       ├── src/
│       │   ├── api.js
│       │   ├── admin.jsx
│       │   ├── auth.jsx
│       │   ├── dashboard.jsx
│       │   ├── leaderboard.jsx
│       │   ├── scanner.jsx
│       │   └── smartbinmaps.jsx
│       ├── index.html
│       ├── package.json
│       ├── vite.config.js
│       └── ...
│
├── server/
│   ├── index.js
│   ├── Dockerfile
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy-backend.yml
│
├── .gitignore
└── README.md
```

*Note: This structure highlights the primary application files. Additional source files, configuration files, and assets may also be present.*

---

## ⚙️ Getting Started

Follow these instructions to run SmartBin locally.

### Prerequisites

Make sure you have the following:

- Node.js and npm installed.
- Git installed.
- A Firebase project with the required server-side configuration.
- A Supabase project with the required database configuration.
- A configured Teachable Machine model for waste classification.

### 1. Clone the Repository

```bash
git clone https://github.com/ayush8771/smart-bin.git
cd smart-bin
```

### 2. Configure the Backend

Navigate to the backend directory:

```bash
cd server
npm install
```

Configure the required environment variables for your local backend.

Example configuration:

```env
PORT=5000
JWT_SECRET=your-strong-random-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-key
FIREBASE_CREDS=your-firebase-service-account-json
```

Replace the example values with your actual configuration.

**Important:**

- `JWT_SECRET` must contain a strong, randomly generated secret.
- `SUPABASE_URL` must point to your Supabase project.
- `SUPABASE_ANON_KEY` must contain the appropriate Supabase key.
- `FIREBASE_CREDS` must contain valid Firebase service-account JSON in the format expected by the backend.

Use your project's existing configuration and required environment-variable names when setting up the backend.

Never commit actual secrets or service-account credentials to GitHub.

### 3. Start the Backend

From the `server` directory, run:

```bash
node index.js
```

The backend should start using the configured port and initialize the required services.

### 4. Configure the Frontend

Open a separate terminal and navigate to the frontend directory:

```bash
cd client/smartbin
npm install
```

Create a `.env` file inside `client/smartbin/`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

This configures the local frontend to communicate with the local backend.

For production, the frontend uses the configured AWS backend URL.

### 5. Start the Frontend

From the `client/smartbin` directory, run:

```bash
npm run dev
```

Vite will display the local development URL. By default, it is usually:

```text
http://localhost:5173
```

Open the displayed URL in your browser to access the application.

### 6. Build the Frontend for Production

To create an optimized production build, run:

```bash
npm run build
```

The generated production files are placed in the `dist` directory.

---

## 🔌 Backend API Reference

The backend exposes REST API endpoints for the application's core functionality.

| Endpoint | Method | Description |
|---|---|---|
| `/api/register` | POST | Register a user |
| `/api/login` | POST | Authenticate a user |
| `/api/dashboard` | GET | Retrieve dashboard information |
| `/api/add-waste` | POST | Submit waste-related activity |
| `/api/redeem` | POST | Redeem rewards |
| `/api/bins` | GET | Retrieve smart-bin information |
| `/api/leaderboard` | GET | Retrieve leaderboard information |
| `/api/admin/users` | GET | Retrieve user information for administration |

Protected endpoints may require an authentication token in the `x-access-token` request header.

### Example: Retrieve Smart-Bin Data

**Request**

```http
GET /api/bins
```

**Production endpoint**

```text
https://sm-fe78a1f00f944cae95802987df054d40.ecs.ap-south-1.on.aws/api/bins
```

The endpoint returns smart-bin information in JSON format.

---

## 🚀 Deployment

SmartBin's frontend and backend are deployed independently.

### Frontend Deployment — Vercel

The React application is hosted on Vercel.

**Production URL:**

https://smart-bin-red.vercel.app

The frontend uses the `VITE_API_BASE_URL` environment variable to identify the backend API.

### Backend Deployment — Amazon ECS

The Node.js and Express backend is hosted on Amazon ECS.

**Backend URL:**

https://sm-fe78a1f00f944cae95802987df054d40.ecs.ap-south-1.on.aws

The backend is containerized using Docker, and the image is stored in Amazon ECR.

### Continuous Integration

GitHub Actions automates the backend build-and-push workflow.

The workflow builds the backend Docker image and publishes it to Amazon ECR. Deployment to ECS is managed separately unless an automated ECS deployment step is configured.

### Environment Configuration

Production configuration and credentials are managed through the hosting platform's environment variables and cloud secrets.

Never expose backend credentials in frontend code or commit them to the repository.

---

## 🔒 Security Considerations

- Use a strong, randomly generated JWT secret.
- Hash user passwords before storing them.
- Keep Firebase service-account credentials private.
- Store backend secrets in environment variables or a secrets manager.
- Never expose server-side credentials through Vite environment variables.
- Restrict administrative functionality to authorized users.
- Validate incoming API requests.
- Handle errors without exposing sensitive implementation details.
- Configure CORS according to the deployment environment's requirements.
- Keep dependencies updated and review security advisories.

---

## 🔮 Future Enhancements

Potential future improvements include:

- IoT sensor integration for physical smart bins.
- Automated bin-fill-level monitoring.
- Real-time bin status updates.
- Expanded waste classification capabilities.
- Improved image classification accuracy.
- Location-aware recycling recommendations.
- More detailed environmental impact analytics.
- Additional reward and redemption integrations.
- Integration with municipal waste management systems.

---

## 🎯 Project Objective

SmartBin aims to make responsible waste disposal easier, smarter, and more rewarding.

By combining AI-powered waste classification, QR-based smart-bin interactions, interactive location discovery, and a digital rewards system, the platform encourages users to participate in sustainable waste management.

The long-term vision is to promote cleaner communities through accessible technology, environmental awareness, and incentives for responsible recycling.

---

## 📄 License

No formal open-source license has been declared for this project.

Until a license is added, reuse and redistribution remain subject to applicable copyright law.