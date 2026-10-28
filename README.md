# Affecio Trust — Trust Before Connection

> **Affecio Hacks ’26 Challenge**: Improve online safety, privacy, and authenticity in a dating and social discovery platform for college students.

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel%20Serverless-black?logo=vercel)](https://vercel.com)
[![React + Vite](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?logo=react)](https://vitejs.dev)
[![Node + Express](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)](https://expressjs.com)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47a248?logo=mongodb)](https://mongodb.com)

---

## Overview

Traditional campus discovery and dating platforms suffer from catfishing, fake profiles, unsolicited harassment, and non-consensual contact sharing. **Affecio Trust** shifts the paradigm from *"connect first, regret later"* to **"Trust Before Connection"**:

1. **100% Institutional Authenticity**: Strictly restricted to verified university emails (`@kiit.ac.in`). External personal accounts (`@gmail.com`) are rejected at the gate.
2. **Granular Field-Level Privacy Matrix**: Students maintain complete sovereign control over their data. Every field (bio, department, year, interests, photos, and social handles) can be individually configured as **Campus Public**, **Mutual Matches Only**, or **Completely Hidden**.
3. **Transparent Trust Signals**: A verifiable trust score (0–100) calculated from institutional verification, profile authenticity, account tenure, peer endorsements, and community misconduct history.
4. **Ghost Contacts (Expiring Information)**: Share sensitive contact details (WhatsApp, Phone, Instagram) protected by timed read-time expiration (15 mins, 1 hour, or 24 hours).
5. **Meet Safely Protocol**: An interactive pre-meetup digital safety checklist and a curated directory of monitored, well-lit campus safe zones.
6. **Campus Safety Moderation Board**: Institutional moderation queue allowing campus safety officers to investigate reports, issue official conduct warnings, and suspend bad actors.

---

## System Architecture

```
                                      +-------------------------------+
                                      |      Vercel Edge Network      |
                                      +---------------+---------------+
                                                      |
                             +------------------------+------------------------+
                             |                                                 |
                             v                                                 v
                  +---------------------+                           +--------------------+
                  |    Client (SPA)     |                           | Serverless API     |
                  | React 18 + Vite     |                           | Express.js Handler |
                  +----------+----------+                           +---------+----------+
                             |                                                |
                             |               REST API Requests                |
                             +----------------------------------------------->+
                                                                              |
                                                    +-------------------------+-------------------------+
                                                    |                         |                         |
                                                    v                         v                         v
                                         +--------------------+    +--------------------+    +--------------------+
                                         |   MongoDB Atlas    |    |    Google OAuth    |    |  Cloudinary Media  |
                                         |   Cached Mongoose  |    |  Domain Restricted |    |  Direct Photo CDN  |
                                         +--------------------+    +--------------------+    +--------------------+
```

---

## Project Structure

```
affecio-trust/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Navbar, TrustModal, ReportModal, ContactShareModal
│   │   ├── pages/              # SignIn, Browse, ProfileSetup, SafetyCenter, AdminReports
│   │   ├── App.jsx             # SPA Router & Auth State
│   │   ├── main.jsx            # Entrypoint
│   │   └── index.css           # Modern campus design system & utilities
│   ├── package.json
│   └── vite.config.js
├── api/
│   └── index.js                # Serverless Express handler for Vercel
├── server/
│   ├── app.js                  # Express application & CORS configuration
│   ├── server.js               # Standalone server runner for local development
│   ├── seed.js                 # Realistic seed database script
│   ├── models/                 # Mongoose Schemas: User, Profile, Connection, Report, Block
│   ├── routes/                 # auth, profiles, connections, reports, safety
│   ├── middleware/             # auth.js (JWT + suspension check), admin.js
│   └── lib/
│       ├── db.js               # Cached Mongoose connection + resilient fallback
│       ├── trust.js            # Transparent Trust Score calculation engine
│       ├── dataService.js      # Resilient unified data access layer
│       └── mockStore.js        # Offline in-memory store for instant zero-config judging
├── scripts/
│   └── test-api.js             # Automated 10-point verification test suite
├── vercel.json                 # Vercel serverless build and routing configuration
├── .env.example                # Documented environment template
├── plan.md                     # Architecture specification
└── README.md
```

---

## Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** v18+ (tested on v24)
- **npm** v9+

### 2. Installation
Clone repository and install dependencies:
```bash
# In the root project directory:
npm install
cd client && npm install && cd ..
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Default `.env` values are pre-configured with:
- `PORT=3000`
- `ALLOWED_EMAIL_DOMAIN=kiit.ac.in`
- `JWT_SECRET=affecio-trust-super-secret-jwt-key-2026`
- `CLIENT_URL=http://localhost:5173`

> [!TIP]
> **Resilient Zero-Config Mode**: If a local MongoDB instance or Atlas connection is not active, the backend automatically activates **In-Memory Resilient Mode**. You can test 100% of the platform without configuring external services!

### 4. Run Verification Suite
Run the automated end-to-end verification test suite:
```bash
npm test
# Or:
node scripts/test-api.js
```

### 5. Start Development Servers
In terminal 1 (Start Backend Server):
```bash
npm run server
```
*Backend runs at `http://localhost:3000`*

In terminal 2 (Start React Frontend):
```bash
npm run client
```
*Frontend runs at `http://localhost:5173`*

---

## 1-Click Fast Campus Demo Logins

For evaluators, judges, and developers reviewing the platform without setting up Google Cloud Console credentials, three pre-seeded accounts are accessible with 1-click on the Sign-In page:

| Account | Role | Trust Score | Features to Evaluate |
|---|---|---|---|
| **Ananya Sharma** | 3rd Year CS Student | **92 / 100** | Mutual match with Rohan Verma, active Ghost Contact, privacy matrix set to mixed levels. |
| **Rohan Verma** | 2nd Year IT Student | **80 / 100** | Mutual match with Ananya (unlocked social links), robotics interests. |
| **Dr. Sarah Mukherjee** | Campus Safety Officer | **Admin** | Full access to **Campus Safety Moderation Board**, review pending reports, issue warnings, and suspend accounts. |

---

## Production Deployment on Vercel

### Step 1: Push to GitHub / Git Provider
Push this repository to GitHub or GitLab.

### Step 2: Configure MongoDB Atlas
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Free M0 cluster.
3. Under **Database Access**, create a user with read/write privileges.
4. Under **Network Access**, add an IP Access entry:
   - **IP Address**: `0.0.0.0/0` (Allow access from anywhere). This is required for Vercel's serverless functions which rotate dynamic outbound IP addresses.
5. Under **Clusters > Connect**, copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/affecio-trust?retryWrites=true&w=majority
   ```

### Step 3: Configure Google Cloud OAuth 2.0
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and configure the **OAuth consent screen**.
3. Under **Credentials > Create Credentials > OAuth Client ID**:
   - Application type: **Web Application**
   - Authorized JavaScript origins:
     - `http://localhost:5173` (Local dev)
     - `https://your-production-app.vercel.app` (Vercel domain)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback`
     - `https://your-production-app.vercel.app/api/auth/google/callback`
4. Copy the **Client ID** and **Client Secret**.

### Step 4: Deploy to Vercel
1. In the Vercel Dashboard, click **Add New > Project** and import your repository.
2. In the **Environment Variables** section, configure:
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A secure 32+ character random secret
   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
   - `ALLOWED_EMAIL_DOMAIN`: `kiit.ac.in` (or your campus domain)
   - `CLIENT_URL`: `https://your-production-app.vercel.app`
3. Click **Deploy**. Vercel will automatically build the static React frontend from `client/` and route `/api/*` to the serverless Express function in `api/index.js`.

---

## Trust Score Calculation Algorithm

Trust is calculated dynamically across 6 verifiable dimensions (0–100 total):

| Factor | Points | Verifiable Criteria |
|---|---|---|
| **Institutional Email** | `+30 pts` | Verified `@kiit.ac.in` domain authenticated via Google ID token. |
| **Profile Completeness** | Up to `+35 pts` | Real name (+5), Bio > 10 chars (+10), 2+ interests (+5), Academic year (+5), Department (+5), Profile photo (+5). |
| **Account Tenure** | Up to `+15 pts` | 1 point per 2 days of good standing (calculated from account creation). |
| **Peer Endorsements** | Up to `+15 pts` | `+5 pts` per mutual accepted connection on campus. |
| **Safety Code Pledge** | `+5 pts` | Digitally signed campus anti-harassment pledge. |
| **Misconduct Penalties** | `-20 pts each` | Heavy deduction for verified reports reviewed by the safety board. |

Profiles receive a transparent grade and badge:
- **Campus Ambassador** (`90–100`): Emerald badge
- **Highly Trusted Peer** (`75–89`): Indigo badge
- **Verified Student** (`60–74`): Blue badge
- **Under Review** (`<60` or active reports): Amber alert badge

---

## API Reference

### Authentication
- `POST /api/auth/google`: Verify Google ID token, enforce institutional domain, issue JWT.
- `POST /api/auth/demo-login`: 1-click test sign-in with pre-seeded campus roles.
- `GET /api/auth/me`: Authenticated user session and role verification.
- `POST /api/auth/safety-pledge`: Sign the anti-harassment pledge.

### Profiles & Privacy
- `GET /api/profiles`: Browse campus peers with dynamic field-level privacy censoring.
- `GET /api/profiles/me`: View authenticated user's own profile and trust breakdown.
- `PUT /api/profiles/me`: Update profile details and 3-tier privacy matrix.
- `GET /api/profiles/:userId`: View peer profile with relationship-aware field filters.

### Connections
- `GET /api/connections`: List mutual matches and pending requests.
- `POST /api/connections/request`: Send connection request with optional safety note.
- `DELETE /api/connections/:targetUserId`: Disconnect from peer and re-lock match-only fields.

### Safety Tools
- `GET /api/safety/checklist`: Interactive pre-meetup checklist and campus safe zone directory.
- `POST /api/safety/contact-share`: Generate timed contact share (15m, 1h, 24h).
- `GET /api/safety/contact-share/:userId`: Access contact info with real-time countdown timer.
- `DELETE /api/safety/contact-share`: Instantly revoke active contact share.

### Moderation & Reports
- `POST /api/reports`: Submit confidential report with category and evidence.
- `GET /api/reports`: Admin view of pending reports with target trust signals.
- `PATCH /api/reports/:id`: Admin action (dismiss, formal warning, account suspension).
- `POST /api/reports/block`: Block peer and immediately sever all connections.

---

## License & Attribution

Built for the **Affecio Hacks ’26** hackathon challenge: *Trust Before Connection — Improve online safety, privacy, and authenticity*. Developed with React, Node.js, Mongoose, and Vercel Serverless.
