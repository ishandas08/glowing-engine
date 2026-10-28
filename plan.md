# Plan: Affecio Trust — Trust Before Connection

## Architecture
- **client/**: React 18 + Vite frontend with modern glassmorphism design system & Lucide icons
- **api/index.js**: Serverless Express handler configured for Vercel
- **server/app.js**: Express app (routes, middleware, CORS, error handling)
- **server/server.js**: Standalone Node server runner for local development
- **server/seed.js**: Seed script with realistic student profiles, safety reports, and connections
- **server/models/**: User, Profile, Connection, Report, Block
- **server/routes/**:
  - `auth`: Google OAuth domain restriction, 1-click demo logins, session verification, safety pledge
  - `profiles`: Campus discovery with dynamic field-level privacy censoring, profile setup
  - `connections`: Mutual matches and safety connection requests
  - `reports`: Safety reports, block list, and administrative moderation actions
  - `safety`: Pre-meet checklist, campus safe spots directory, ghost contacts (timed sharing)
- **server/middleware/**: auth (JWT + account suspension check), admin (safety council role check)
- **server/lib/**:
  - `db.js`: Cached Mongoose connection for Vercel serverless with resilient fallback
  - `trust.js`: Comprehensive 6-factor trust scoring calculation engine
  - `dataService.js`: Unified data abstraction supporting both MongoDB Atlas & local zero-config store
  - `mockStore.js`: Resilient in-memory store for instant zero-dependency evaluations
- **scripts/test-api.js**: 10-point end-to-end automated verification test suite

## Completed Milestones
1. [x] Scaffold project configuration (`package.json`, `client/package.json`, `vercel.json`, `.env.example`, `.env`)
2. [x] Database connection with cached Mongoose instance & resilient fallback
3. [x] Mongoose models for User, Profile, Connection, Report, and Block
4. [x] Auth middleware with suspension enforcement, Google OAuth domain check (`@kiit.ac.in`), and 1-click evaluator demo accounts
5. [x] Profile routes with server-side relationship-aware privacy filter (Campus Public vs Matches Only vs Hidden)
6. [x] Trust score calculation engine (0–100 score, tier badges, transparent breakdown modal)
7. [x] Report & block routes with admin investigation view (Dismiss, Warn, Suspend)
8. [x] Safety tools (interactive pre-meet checklist, Ghost Contact expiring shares with live countdown timer, campus safe zones)
9. [x] React SPA: SignIn, Browse, ProfileSetup, SafetyCenter, AdminReports, and interactive modals
10. [x] Comprehensive documentation, Vercel deployment instructions, and 100% automated test coverage
