# Village Portfolio - End-to-End Deployment Guide (Free Tier)

Last updated: April 5, 2026

This guide is written for beginners and gives you a complete, practical deployment path for your current project.

Important: Free-tier limits change often. Always verify current pricing and limits on each provider before final go-live.

---

## 1. What You Are Deploying

You have a full-stack MERN app:
- Frontend: React (Create React App) in client
- Backend: Node.js + Express in server
- Database: MongoDB
- Media storage: Cloudinary

Target production architecture:
- Browser -> Frontend host (Vercel/Netlify/Render/Cloudflare)
- Frontend -> Backend API host (Render/Koyeb/etc)
- Backend -> MongoDB Atlas
- Backend -> Cloudinary

---

## 2. Critical Pre-Deployment Security Fixes (Must Do First)

Before you deploy, fix these from your current codebase:

1) Rotate exposed secrets immediately
- Your repository currently includes real-looking credentials in some files.
- Rotate all of these now in provider dashboards:
  - MongoDB password/user
  - Cloudinary API key/secret
  - JWT secret
  - Admin password

2) Stop hardcoded secret fallbacks in source
- Files currently contain sensitive fallback values:
  - server/src/config/config.js
  - server/src/config/cloudinary.js
- In production, read only from environment variables.

3) Fix CORS for production domains
- Current backend CORS in server/src/index.js is locked to localhost.
- Add production frontend domain allow-list.

Recommended CORS pattern:

- Add env var on server:
  - CLIENT_ORIGINS=https://your-frontend-domain.vercel.app,https://your-custom-domain.com

- Parse and use this allow-list in backend CORS.

4) Confirm .env files are not committed
- Keep secrets only in platform environment variables.
- Never push real values to GitHub.

---

## 3. Free-Tier Deployment Plans (All Practical Options)

## Plan A (Recommended): Vercel + Render + MongoDB Atlas + Cloudinary

Why recommended:
- Best DX for React frontend
- Render works well with Express API and your existing render.yaml
- Fully workable on free tiers for low-to-medium traffic

Estimated cost:
- $0 initially (subject to provider limits)

Tradeoffs:
- Render free service can sleep when inactive (cold start delay)

---

## Plan B: Netlify + Render + MongoDB Atlas + Cloudinary

Why choose:
- Strong frontend hosting and forms ecosystem
- Easy static deploy + CI/CD from GitHub

Estimated cost:
- $0 initially

Tradeoffs:
- Need SPA redirect config for React Router

---

## Plan C: Render Static Site + Render Web Service + MongoDB Atlas + Cloudinary

Why choose:
- Single hosting provider for frontend and backend
- Simple project management

Estimated cost:
- $0 initially

Tradeoffs:
- Render free static + web are okay, but web sleeps on free

---

## Plan D: Cloudflare Pages + Render + MongoDB Atlas + Cloudinary

Why choose:
- Excellent global edge performance for frontend
- Generous free static hosting

Estimated cost:
- $0 initially

Tradeoffs:
- Slightly more setup learning if you are new

---

## Plan E: Vercel/Netlify + Koyeb + MongoDB Atlas + Cloudinary

Why choose:
- Alternative to Render for backend
- Good if Render region/performance is not ideal for you

Estimated cost:
- $0 initially (check active free limits)

Tradeoffs:
- Free-tier policies and quotas can change

---

## 4. Common Prerequisites (For Any Plan)

Create these accounts first:
- GitHub
- MongoDB Atlas
- Cloudinary
- One frontend host: Vercel or Netlify or Render or Cloudflare Pages
- One backend host: Render (recommended) or Koyeb

Local tools:
- Node.js LTS (18+ recommended)
- npm
- Git

Repository checklist:
- Root repo pushed to GitHub
- client and server folders present
- Build passes locally:
  - In client: npm run build
- API health route exists: /api/health (already present)

---

## 5. Environment Variables You Need

## Server (backend host)

Set these in your backend platform environment panel:
- NODE_ENV=production
- PORT=10000 (or provider default port variable if required)
- MONGODB_URI=your_atlas_connection_string
- JWT_SECRET=long_random_secret
- JWT_EXPIRES_IN=30d
- CLOUDINARY_CLOUD_NAME=your_cloud_name
- CLOUDINARY_API_KEY=your_cloudinary_api_key
- CLOUDINARY_API_SECRET=your_cloudinary_api_secret
- ADMIN_EMAIL=your_admin_email
- ADMIN_PASSWORD=strong_admin_password
- ADMIN_NAME=Admin
- CLIENT_ORIGINS=https://frontend-domain-1,https://frontend-domain-2

Notes:
- Use strong random values
- Never reuse development secrets

## Client (frontend host)

Set these in frontend environment panel:
- REACT_APP_API_URL=https://your-api-domain.com/api
- REACT_APP_API_TIMEOUT=30000
- REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
- REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
- REACT_APP_CLOUDINARY_FOLDER=village_portfolio
- REACT_APP_GA_TRACKING_ID=optional
- REACT_APP_TOKEN_KEY=village_portfolio_token
- REACT_APP_USER_KEY=village_portfolio_user
- REACT_APP_CONTACT_EMAIL=your_contact_email

Optional UI/category envs from client/example.env can also be added.

---

## 6. End-to-End Deployment Steps (Plan A: Vercel + Render)

This is the full beginner-friendly path.

## Step 1: Prepare MongoDB Atlas (Free)

1. Create a free M0 cluster.
2. Create database user:
   - username: app user
   - password: strong password
3. Network access:
   - add 0.0.0.0/0 for simplicity (beginner option)
   - later tighten security if possible
4. Get connection string:
   - use SRV URI
   - replace placeholder password
5. Save this as MONGODB_URI for backend host.

## Step 2: Prepare Cloudinary (Free)

1. Create cloud account.
2. Copy cloud name, API key, API secret.
3. Create upload preset if your app uses it from client env.
4. Save these for backend and frontend env panels.

## Step 3: Deploy Backend on Render

1. Open Render dashboard -> New Web Service.
2. Connect GitHub repo.
3. Configure:
   - Root Directory: server
   - Runtime: Node
   - Build Command: npm install
   - Start Command: npm start
   - Health Check Path: /api/health
4. Add all backend environment variables listed above.
5. Deploy service.
6. Verify:
   - Open https://your-render-api-domain/api/health
   - Expect healthy JSON response.

## Step 4: Create Production Admin User

You can run this from local machine against production DB:

- Set local env temporarily:
  - MONGODB_URI=production_uri
  - ADMIN_EMAIL=your_admin_email
  - ADMIN_PASSWORD=your_admin_password
  - ADMIN_NAME=Admin

- Run:
  - cd server
  - node src/scripts/createAdmin.js

Expected output:
- Connected to MongoDB
- Admin user created successfully OR already exists

## Step 5: Deploy Frontend on Vercel

1. Open Vercel -> New Project.
2. Import GitHub repository.
3. Configure frontend project:
   - Root Directory: client
   - Build Command: npm run build
   - Output Directory: build
4. Add frontend environment variables (especially REACT_APP_API_URL).
5. Deploy.

## Step 6: Enable SPA Routing (React Router)

Your current client/vercel.json is empty. For React Router refresh support, use rewrite to index.html.

Set client/vercel.json to:

{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

Then redeploy frontend.

## Step 7: Connect Backend CORS to Frontend Domain

In backend, allow your deployed frontend domain(s) via CLIENT_ORIGINS env.

After updating CORS logic and env, redeploy backend.

## Step 8: Smoke Test (Must Pass)

Frontend checks:
- Home page loads
- Routes /gallery /videos /updates load with refresh
- No CORS errors in browser console

Backend checks:
- /api/health returns healthy
- Auth login works
- Admin dashboard loads
- Create/update/delete gallery/video/update works

Media checks:
- Image upload reaches Cloudinary
- Media URLs are stored and load correctly

---

## 7. Detailed Steps for Other Free-Tier Plans

## Plan B: Netlify + Render

Frontend on Netlify:
1. New site from Git.
2. Base directory: client
3. Build command: npm run build
4. Publish directory: build
5. Add env vars (same as Vercel).

React Router fallback:
- Add file client/public/_redirects with:
  - /* /index.html 200

Backend:
- Same Render backend steps as Plan A.

---

## Plan C: Render Static + Render Web Service

Frontend static service:
1. New Static Site on Render.
2. Root directory: client
3. Build command: npm install && npm run build
4. Publish directory: build
5. Add frontend env vars.

Backend web service:
- Same as Plan A backend steps.

Routing:
- Configure Render static site rewrite for SPA to /index.html.

---

## Plan D: Cloudflare Pages + Render

Frontend:
1. Create Cloudflare Pages project from Git.
2. Framework preset: Create React App (or custom)
3. Build command: npm run build
4. Build output directory: build
5. Add frontend env vars.
6. Configure SPA fallback to index.html in Pages routing settings.

Backend:
- Same as Plan A backend steps on Render.

---

## Plan E: Vercel/Netlify + Koyeb

Backend on Koyeb:
1. Create Web Service from GitHub.
2. Root dir: server
3. Build command: npm install
4. Start command: npm start
5. Add backend env vars.
6. Verify /api/health.

Frontend:
- Deploy on Vercel or Netlify exactly as in Plan A/B.

---

## 8. CI/CD Flow (Free)

Simple and beginner-safe Git flow:
- main branch: production
- dev branch: active development

Deploy behavior:
- Merge dev -> main triggers auto-deploy on host(s)

Recommended protections:
- Require PR review before merge to main
- Require successful build checks

Minimal free CI with GitHub Actions:
- Frontend: run npm ci and npm run build in client
- Backend: run npm ci in server and optional tests

---

## 9. Custom Domain + HTTPS

All listed frontend hosts provide free HTTPS.

Steps:
1. Buy domain from any registrar.
2. Add custom domain in frontend host dashboard.
3. Update DNS records as host instructs.
4. Wait for certificate provisioning.
5. Update backend CORS CLIENT_ORIGINS with custom domain.
6. Update frontend REACT_APP_API_URL if backend custom domain is used.

---

## 10. Monitoring and Maintenance (Free-Friendly)

Basic monitoring checklist:
- Health endpoint monitor every 5 minutes
- Error logs in provider dashboard
- Track failed login spikes
- Track API response latency

Maintenance checklist (weekly):
- Check host usage limits
- Check MongoDB Atlas storage growth
- Check Cloudinary quota
- Rotate secrets every 3-6 months
- Review dependency updates and security advisories

---

## 11. Rollback Plan (Very Important)

If production breaks:
1. Revert last commit on main.
2. Trigger redeploy.
3. Confirm /api/health and frontend smoke test.
4. If DB migration issue, restore backup/snapshot.

Quick rollback principle:
- Keep deploys small and frequent
- Tag stable releases in Git

---

## 12. Common Issues and Fixes

Issue: CORS blocked in browser
- Cause: frontend domain not allowed in backend CORS
- Fix: add deployed frontend domain to CLIENT_ORIGINS and redeploy backend

Issue: Frontend routes show 404 on refresh
- Cause: missing SPA rewrite/fallback
- Fix: configure vercel.json or _redirects or provider rewrite rule

Issue: API returns 500 after deploy
- Cause: missing env vars
- Fix: verify all backend env vars and redeploy

Issue: Login fails in production but works locally
- Cause: JWT secret mismatch, DB user issue, or wrong API URL
- Fix: verify JWT_SECRET, MONGODB_URI, REACT_APP_API_URL

Issue: Upload fails
- Cause: Cloudinary credentials or preset misconfigured
- Fix: verify cloud name/key/secret/preset and backend logs

Issue: First request is slow
- Cause: free-tier backend cold start
- Fix: expected behavior on many free plans

---

## 13. Final Production Go-Live Checklist

Security:
- Secrets rotated
- No real credentials in repository
- CORS restricted to real frontend domains
- Strong admin password

Backend:
- /api/health is healthy
- Logs show no startup errors
- CRUD and auth working

Frontend:
- All pages load
- Route refresh works
- API calls point to production URL
- Mobile responsive checks pass

Operations:
- Domain and HTTPS active
- Monitoring in place
- Rollback process tested

---

## 14. Best First Choice for Your Project

Start with Plan A:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Media: Cloudinary

Reason:
- Matches your current project setup and existing files best
- Easiest learning curve for your first deployment
- Reliable free-tier starting point

---

## 15. What To Do Next (Action Order)

1. Rotate all exposed secrets first.
2. Remove hardcoded secrets from backend fallback code.
3. Add production CORS allow-list via env.
4. Deploy backend on Render and verify /api/health.
5. Deploy frontend on Vercel with proper API URL.
6. Add SPA rewrite in client/vercel.json and redeploy.
7. Run full smoke test and admin CRUD test.
8. Connect custom domain and tighten CORS.

---

If you want, I can also prepare a second file named deployment-checklist.md with a copy-paste runbook you can tick during the actual deployment session.