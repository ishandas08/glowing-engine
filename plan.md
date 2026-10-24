# Plan

## Architecture
- client/: React + Vite frontend
- api/index.js: exports Express app for Vercel serverless
- server/app.js: Express app (routes, middleware)
- server/models/: User, Profile, Report, Block
- server/routes/: auth, profiles, reports, blocks, safety
- server/middleware/: auth, admin, validate
- server/lib/db.js: cached Mongoose connection

## Order of work
1. Scaffold project + config (package.json, vercel.json, .env.example)
2. Database connection (cached)
3. Mongoose models
4. Auth middleware + Google OAuth restricted domain + JWT
5. Profile routes + privacy controls
6. Trust score calculation
7. Report & block routes + admin view
8. Safety tools (meet-safe checklist, expiring contact shares)
9. React pages: sign-in, profile setup, browse, admin
10. README + Vercel setup docs
