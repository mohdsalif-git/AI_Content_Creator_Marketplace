# GENRA / CREATORA Architecture Map

## Backend (Node + Express + MongoDB + Socket.IO)

### Entry Points
- `server/index.js` - Main Express app with Socket.IO, exports `app`, `server`, `io`, `startServer()`
- `server/index.mjs` - Re-exports from index.js (for ES module compatibility)
- `server/src/server.ts` - TypeScript wrapper re-exporting the same

### Configuration
- `server/config/db.js` - MongoDB connection with retry logic, event listeners, connection pooling
- `server/constants/index.js` - Enums: TOOLS, CORE_TOOLS, SKILLS, CORE_SKILLS, SPECIALIZATIONS, WORKFLOW_STEPS, USER_ROLES, SUBMISSION_STATUSES, PROJECT_STATUSES

### Models (Mongoose)
| Model | File | Key Fields | Indexes |
|-------|------|------------|---------|
| User | `models/User.js` | email (unique), passwordHash, googleId (sparse), name, role | email, googleId |
| RefreshToken | `models/RefreshToken.js` | userId, tokenHash, expiresAt | userId, tokenHash, TTL on expiresAt |
| CreatorProfile | `models/CreatorProfile.js` | userId, displayName, handle, specialization, tools[], skills[], rights{}, workflow[], portfolio[], formats[], stats{} | userId, specialization, tools.name, skills, text index |
| Project | `models/Project.js` | title, description, budget, deadline, status, brandId, brandName, tags[] | status, brandId |
| Brief | `models/Brief.js` | brandId, title, contentType, style[], aspectRatio[], platform, usage, rights{}, requiredTools[], assetCount, budget, budgetNum, deadline, description, status | brandId |
| Submission | `models/Submission.js` | briefId, creatorId, brandId, status, progress, notes | briefId, creatorId, brandId, status |
| Conversation | `models/Conversation.js` | participants[], lastMessage, lastMessageAt | - |
| Message | `models/Message.js` | conversationId, senderId, content, mediaUrl, read | conversationId |
| GenerationJob | `models/GenerationJob.js` | userId, type, prompt, aspectRatio, style, duration, imageUrl, status, resultUrl, error, provider, providerTaskId, metadata{} | userId, status |
| PasswordReset | `models/PasswordReset.js` | userId, tokenHash, expiresAt | userId, tokenHash, TTL on expiresAt |

### Middleware
- `middleware/auth.js` - `requireAuth` (Bearer token verification), `optionalAuth`
- `middleware/errorHandler.js` - Centralized error handling for Zod, Mongoose, JWT errors
- `middleware/rateLimiter.js` - `loginLimiter` (20/15min), `forgotPasswordLimiter` (10/15min), `apiLimiter` (300/15min)

### Routes (all prefixed with `/api` and without)
| Route | Auth | Controller |
|-------|------|------------|
| `/auth/*` | Public (login/register) / Protected (me, logout, refresh) | `auth.routes.js` |
| `/creators` | Protected | `creator.routes.js` |
| `/projects` | **Public** | `project.routes.js` |
| `/briefs` | Protected | `brief.routes.js` |
| `/dashboard` | Protected | `dashboard.routes.js` |
| `/ai-studio` | Protected | `aiStudio.routes.js` |

### Controllers
- `auth.controller.js` - register, login, googleLogin, forgotPassword, resetPassword, refresh, logout, me
- `creator.controller.js` - listCreators (with filters: q, specialization, tools, skills, rights, verifiedOnly, page, limit), getCreatorById
- `project.controller.js` - listProjects, getProjectById (public)
- `brief.controller.js` - createBrief, listBriefs, getBriefById, matchCreators, sendBrief
- `dashboard.controller.js` - getDashboardProjects (groups: activeBriefs, applications, inProgress, completed)
- `aiStudio.controller.js` - generateImage, generateVideo, getJobs, getJobById, generateContent (legacy)

### Validators (Zod)
- `validators/auth.validator.js` - register, login, forgotPassword, resetPassword, googleAuth schemas
- `validators/brief.validator.js` - createBrief, sendBrief schemas
- `validators/aiStudio.validator.js` - generateImage, generateVideo schemas

### Services
- `services/media/seedance.adapter.ts` - `SeedanceAdapter` class with `generateImage()`, `generateVideo()`, `pollTaskStatus()`, `downloadToUploads()`, `handleProviderError()`
- Mock mode when `MEDIA_MOCK=true` or no API key

### Utilities
- `utils/jwt.js` - generate/verify access & refresh tokens, hashToken (SHA256), generateRandomToken
- `utils/argon2.js` - hashPassword (Argon2id, 16-byte salt), verifyPassword

### Socket.IO (in index.js)
- Handshake reads `userId` from query/auth
- Joins `user:${userId}` room
- Handles `join` event for arbitrary rooms
- No auth validation on connection

### Seed Script
- `seed.js` - Creates 5 brands, 5 creators with profiles, 5 projects, 3 briefs, 4 submissions, 2 conversations with messages, 3 generation jobs
- Idempotent: clears all collections first
- Uses `Demo@12345` as default password

---

## Frontend (React + TypeScript + Tailwind + Vite)

### Entry
- `client/src/main.tsx` - React 18 root
- `client/src/App.tsx` - Main app with routing, auth state, pages

### Routing (Custom hash/history in `useRoute()`)
| Path | Page | Auth Required |
|------|------|---------------|
| `/` | HomePage | No |
| `/projects`, `/projects/:id` | ProjectsPage | **No (Public)** |
| `/creators` | CreatorsPage | Yes |
| `/creators/:id` | CreatorProfile | Yes |
| `/briefs/new` | BriefBuilder | Yes |
| `/briefs` | BriefsPage | Yes |
| `/briefs/:id` | BriefDetail | Yes |
| `/dashboard` | DashboardPage | Yes |
| `/studio`, `/studio/history` | Studio | Yes |
| `/signin` | AuthPages (signin) | No |
| `/create-account` | AuthPages (signup) | No |
| `/forgot-password` | AuthPages (forgot) | No |

### Auth State (`client/src/auth.ts`)
- `getAccessToken()` / `setAccessToken()` / `clearAuth()` - localStorage
- `isAuthenticated()` - checks localStorage
- `getUser()` / `saveUser()` - localStorage JSON
- `signOutDemoUser()` - clears localStorage + calls API logout

### API Client (`client/src/services/api.ts`)
- Base URL from `VITE_API_URL` or `/api`
- Auto-attaches Bearer token from localStorage
- `credentials: 'include'` for httpOnly refresh cookie
- **401 Refresh Logic**: Single-flight refresh with subscriber queue
- Endpoints: auth, creators, projects, briefs, dashboard, aiStudio

### Pages
- `HomePage.tsx` - Landing with hero, features, creator cards
- `ProjectsPage.tsx` - Public projects list from API
- `CreatorsPage.tsx` - Filterable creator list with API integration
- `CreatorProfile.tsx` - Full creator detail with portfolio
- `BriefBuilder.tsx` - Multi-step brief creation wizard
- `BriefsPage.tsx` - Brand's brief library
- `BriefDetail.tsx` - Brief view with match results, send modal
- `DashboardPage.tsx` - 4-section dashboard from API
- `Studio.tsx` - AI Studio with tabs (Create/Image/Video/Motion/Edit/History/Presets/Workflow/Projects), Socket.IO client for real-time updates
- `AuthPages.tsx` - Sign in, sign up, forgot/reset password, Google OAuth mock

### Data
- `data/assets.ts` - Video URLs, gradient posters
- `data/studioData.ts` - Studio models, presets, history, projects

---

## Environment Variables

### Required (from `.env.example`)
| Variable | Used In |
|----------|---------|
| PORT | server/index.js |
| NODE_ENV | server/index.js, db.js |
| CLIENT_ORIGIN | server/index.js (CORS) |
| MONGODB_URI | server/config/db.js |
| JWT_ACCESS_SECRET | server/utils/jwt.js |
| JWT_REFRESH_SECRET | server/utils/jwt.js |
| JWT_ACCESS_EXPIRES_IN | server/utils/jwt.js |
| JWT_REFRESH_EXPIRES_IN | server/utils/jwt.js |
| GOOGLE_CLIENT_ID | server/controllers/auth.controller.js |
| SEEDANCE_API_KEY | server/src/services/media/seedance.adapter.ts |
| SEEDANCE_BASE_URL | server/src/services/media/seedance.adapter.ts |
| SEEDREAM_IMAGE_MODEL | server/src/services/media/seedance.adapter.ts |
| SEEDANCE_VIDEO_MODEL | server/src/services/media/seedance.adapter.ts |
| MEDIA_MOCK | server/src/services/media/seedance.adapter.ts |

### Frontend
- `VITE_API_URL` - client/src/services/api.ts (defaults to `/api`)

---

## Dead / Duplicated / Inconsistent Items

### Duplicate Route Registrations
- `/api/auth` AND `/auth` both mount `authRoutes`
- `/api/creators` AND `/creators` both mount `creatorRoutes`
- `/api/projects` AND `/projects` both mount `projectRoutes`
- `/api/briefs` AND `/briefs` both mount `briefRoutes`
- `/api/dashboard` AND `/dashboard` both mount `dashboardRoutes`
- `/api/ai-studio` AND `/ai-studio` both mount `aiStudioRoutes`

### Inconsistent API Paths
- Frontend `api.ts` uses `/auth/login` but backend has both `/api/auth/login` and `/auth/login`
- Vite proxy forwards `/api/*` to `localhost:4000`, so frontend calls should use `/api/...`
- Some frontend calls may hit non-prefixed routes directly

### Socket.IO Auth Gap
- Server: `io.on('connection')` reads `userId` from query/auth but **does not verify JWT**
- Client: `Studio.tsx` connects with `query: { userId: currentUser.id }` - no token validation
- Any user can join any `user:${id}` room

### Duplicate Seed Files
- `server/seed.js`, `server/seed.mjs`, `server/seed-data.mjs` - all similar

### Model/Controller Mismatches
- `Submission` model references `CreatorProfile` for `creatorId` but `sendBrief` creates submission with `creatorId` from `CreatorProfile`
- `Dashboard` queries `Submission` but doesn't filter by current user (shows ALL submissions)

### Frontend Hardcoded Fallbacks
- `CreatorsPage.tsx` has hardcoded `creators` array as fallback
- `BriefDetail.tsx` has hardcoded `fallbackMatches`
- `App.tsx` has hardcoded `creators` and `briefs` arrays
- These shadow API data when API fails

### Missing Validators
- No validator for `project.routes` query params
- No validator for `dashboard` routes
- No validator for `creator` filter params (uses raw `req.query`)

### Inconsistent Status Enums
- `Brief.status` enum has mixed case: `['Published', 'In review', 'Draft', 'Awarded', 'published', 'in-review', 'draft', 'awarded']`
- `Submission.status` uses `SUBMISSION_STATUSES = ['sent', 'applied', 'in_progress', 'completed']`
- `Project.status` uses `PROJECT_STATUSES = ['open', 'in_progress', 'completed', 'archived']`

### No IDOR Protection
- `getBriefById` - any authenticated user can read any brief
- `getCreatorById` - any authenticated user can read any creator profile
- `sendBrief` - doesn't verify brief belongs to requesting user
- `getJobById` - correctly filters by `userId` ✓
- `dashboard` - returns ALL submissions, not filtered by user

### CORS Configuration Issues
- Server CORS allows `origin.startsWith('http://localhost:')` - too permissive
- Socket.IO CORS: `origin: (origin, callback) => callback(null, true)` - **allows all origins with credentials**

### Rate Limiting Gaps
- No rate limit on `/briefs` creation
- No rate limit on `/briefs/:id/match`
- No rate limit on `/creators` listing
- `apiLimiter` defined but not applied

### Missing Helmet Config
- `contentSecurityPolicy: false` - disables CSP
- No `crossOriginEmbedderPolicy`, `crossOriginOpenerPolicy` configs

### No Body Size Limit on All Routes
- `express.json({ limit: '10mb' })` applied globally - OK but could be tighter

### Password Reset Token Exposure
- Development: logs full reset URL to console with token in plaintext
- Token is 32 bytes hex - good entropy

### Google OAuth Fallback
- If verification fails, falls back to **decoding JWT without verification** (base64 decode)
- Creates users with mock data - security risk in production

### Refresh Token Rotation
- New refresh token issued on login/register/googleLogin
- Old tokens NOT revoked on new login (accumulate in DB)
- Logout deletes only the provided token
- No refresh token reuse detection

### Frontend Auth Redirect
- `useRoute()` redirects to `/signin` and stores destination in `sessionStorage`
- After login, navigates to stored destination
- But: no check for valid token on protected routes (relies on API 401)

### Memory Leaks in Frontend
- `Studio.tsx` Socket.IO: new connection on every render if `currentUser.id` changes
- `CreatorsPage.tsx` effect cleanup sets `active = false` but doesn't cancel in-flight fetch
- `DashboardPage.tsx` similar pattern

### Race Conditions
- `CreatorsPage.tsx`: rapid filter changes trigger multiple concurrent fetches, no abort controller
- `Studio.tsx`: polling interval + socket events can both update state

### Empty State Text
- Frontend expects "No creators match your requirements." but API returns empty array
- `CreatorsPage.tsx` shows `filtered.length` but empty state not explicitly handled in UI

---

## Deployment Notes

### Vercel
- `server/index.mjs` exports `app` for Vercel serverless
- `vercel.json` not found - needed for rewrites
- Socket.IO **cannot work** in Vercel serverless (no persistent connections)
- Background jobs (`setImmediate` in aiStudio.controller) will be killed after response

### Production Concerns
- `ecosystem.config.cjs` uses PM2 - not compatible with Vercel
- Local file writes in `downloadToUploads()` - ephemeral on Vercel
- No health check endpoint for load balancers (has `/health` but not standard)