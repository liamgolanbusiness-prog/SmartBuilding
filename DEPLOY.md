# Deploy the demo to test from your iPhone

The app is a mobile-first web app. To open it on a real iPhone, the backend
needs a public HTTPS URL. The fastest free path is **Render.com**.

## One-time Render setup (about 3 minutes)

1. **Sign in** at https://dashboard.render.com (free, GitHub auth works).
2. Click **New +** → **Blueprint**.
3. **Connect the repo** `liamgolanbusiness-prog/smartbuilding`.
4. When prompted for a branch, choose **`claude/enable-iphone-testing-ULTg6`**
   (or whatever branch has `render.yaml` at the root).
5. Render will detect `render.yaml`, show a single service called `vaad-demo`,
   and pre-fill everything. Click **Apply**.
6. First build takes ~3 minutes (Docker image + `tsc` + `npm install`). Watch
   the logs; you should see:
   ```
   ✅ Schema applied
   🌱 Empty database — seeding core data...
   ✅ Rich seed complete
   🚀 Server running on port 3000
   ```
7. Render gives you a URL like `https://vaad-demo-xxxx.onrender.com`.
   Open it on your iPhone in Safari.

That's it.

## Using it on the phone

1. Safari → paste the Render URL → the phone view loads (no desktop frame,
   full-screen native look).
2. Tap **Send verification code**. Because `DEMO_MODE=true` is set, the backend
   returns the 6-digit code directly in the API response; the frontend
   auto-fills it and logs you in. A toast shows the code too.
3. Test phone numbers (all pre-seeded):
   - **`+972501234567`** — Va'ad admin (full UI)
   - **`+972502345678`** — Va'ad member
   - **`+972503456789`** — Regular resident
4. Add it to the Home Screen (Share → Add to Home Screen) for a true app feel.

## What's running

- Single Docker web service built from `backend/Dockerfile`.
- SQLite database at `/app/data/vaad.sqlite`, bootstrapped + seeded on every
  cold start by `backend/scripts/bootstrap.js`.
- Free plan spins the service down after 15 min of inactivity; the first
  request after that takes ~30 s to wake up and the DB is re-seeded fresh.
  Any tickets/announcements you created during a session are lost on cold
  start — that's the trade-off for a free demo.

## ⚠️ About DEMO_MODE

The `DEMO_MODE=true` env var makes `/api/auth/send-otp` return the generated
OTP in its response body. This is great for sharing a demo link where users
don't have SMS or access to the server logs — but it means **anyone who
knows a phone number in the seed data can log in**. Do NOT set this flag on a
real production deployment. Flip it to `false` (or remove the env var) in the
Render dashboard when you wire up Twilio for real SMS.

## Alternative hosts

The Dockerfile is plain, so the same image also works on:

- **Fly.io** — `fly launch` in `backend/`, accept the Dockerfile, set
  `DEMO_MODE=true` via `fly secrets set`. Persistent volumes are free.
- **Railway.app** — New project → Deploy from GitHub → select `backend` as
  the root. Add `DEMO_MODE=true`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`.
- **Google Cloud Run** — `gcloud run deploy --source backend --set-env-vars DEMO_MODE=true,...`.

Just make sure `NODE_ENV`, `DEMO_MODE`, `JWT_SECRET`, and `REFRESH_TOKEN_SECRET`
are set on whatever host you pick.
