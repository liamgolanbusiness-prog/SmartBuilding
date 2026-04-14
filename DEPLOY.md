# Deploying Lobbix to Railway

Step-by-step guide to get Lobbix running at **lobbix.co.il** on Railway.

---

## Why the first build failed

Railway's Railpack auto-detection looks at the repo root for a
`package.json` to figure out how to build. But all your Node code
lives inside `backend/` — so Railpack couldn't figure it out and gave up.

**Fix**: the repo now has a `Dockerfile` and `railway.json` at the root
that explicitly tell Railway to use Docker for the build. Nothing in your
Railway dashboard needs changing — just trigger a new deploy.

---

## 🚀 Deploy in 5 steps

### 1. Push the fix
Already done by this commit. Railway will auto-deploy on push. If it doesn't,
click **"Deploy"** manually on the failed deployment in your Railway dashboard.

### 2. Set environment variables
In Railway: **SmartBuilding service → Variables** tab. Add these:

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Disables dev-only logging |
| `DEMO_MODE` | `false` | Hides the demo login button + seed users (production) |
| `PORT` | (auto-set by Railway) | Don't override |
| `API_URL` | `https://lobbix.co.il` | Used in some responses |
| `PUBLIC_URL` | `https://lobbix.co.il` | Used in SMS body + email links |
| `JWT_SECRET` | Run: `openssl rand -hex 32` | **Required** — auth will fail without it |
| `REFRESH_TOKEN_SECRET` | Run: `openssl rand -hex 32` | **Required** — different value from above |
| `JWT_EXPIRES_IN` | `1h` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRES_IN` | `30d` | Refresh token lifetime |
| `SESSION_SECRET` | Run: `openssl rand -hex 32` | Reserved for future cookie sessions |
| `DATA_DIR` | `/app/data` | Where SQLite stores its file (see volumes below) |

For full prod you'll also add later (each unlocks a feature):

| Variable | When you need it |
|---|---|
| `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_PHONE_NUMBER` | Real SMS OTP (A2P 10DLC required for Israel) |
| `SENDGRID_API_KEY` + `SENDGRID_FROM_EMAIL` | Transactional emails |
| `GOOGLE_OAUTH_CLIENT_ID` | Real Google sign-in |
| `TRANZILA_TERMINAL_ID` + `TRANZILA_API_KEY` | Payment processing |
| `EZCOUNT_API_KEY` + `EZCOUNT_VAT_EXEMPT=true` | Receipts (קבלה only, עוסק פטור mode) |
| `FIREBASE_*` | Push notifications for mobile wrap |
| `SENTRY_DSN` | Error monitoring |
| `DATABASE_URL` | Managed Postgres (skip the SQLite volume step below) |

### 3. Add a persistent volume (if staying on SQLite)

Railway's filesystem is **ephemeral by default** — SQLite files are wiped on
every deploy. You have two options:

#### Option A — Railway volume (easiest for MVP)
1. In Railway: **SmartBuilding → Settings → Volumes**
2. Click **"Add Volume"**
3. Mount path: `/app/data`
4. Size: 1 GB (free tier) is fine for a few thousand residents
5. Save and redeploy

The `DATA_DIR=/app/data` env var you set in step 2 tells the app to write there.

#### Option B — Managed Postgres (recommended for real production)
1. In Railway: **+ New → Database → Add PostgreSQL**
2. Railway injects `DATABASE_URL` into your service automatically
3. Remove the `DATA_DIR` env var (not needed)
4. You'll need to port the SQLite shim in `src/config/database.ts` back to
   the `pg` driver. That's a separate migration step — I have the original
   `schema.sql` ready when you want to do it.

**My recommendation for MVP**: stay on SQLite + Railway volume. It's simpler
and works for up to ~50 buildings. Switch to Postgres when you have paying
customers.

### 4. Connect your custom domain
1. In Railway: **SmartBuilding → Settings → Networking**
2. Click **"Custom Domain"**
3. Enter `lobbix.co.il` (or `www.lobbix.co.il`)
4. Railway gives you a CNAME target like `xyz.up.railway.app`
5. In your domain registrar's DNS panel, add:
   - `lobbix.co.il` (root) → ALIAS or ANAME → `xyz.up.railway.app`
   - OR `www.lobbix.co.il` → CNAME → `xyz.up.railway.app`
6. Wait 5–30 minutes for DNS propagation + Let's Encrypt certificate
7. Railway will show a green ✓ next to the domain when it's ready

Israeli domain registrars that sell `.co.il`:
- **domain.co.il** — supports CNAME but not ALIAS. Use `www.` subdomain.
- **isoc.org.il** (via reseller) — supports ALIAS.
- **Cloudflare** (you can transfer `.co.il` domains to Cloudflare now) —
  supports ANAME, global CDN, free SSL. Best option.

### 5. Verify

Once deployed + domain connected:

```bash
curl https://lobbix.co.il/health
# → {"status":"healthy","timestamp":"2026-04-14T...","environment":"production"}

curl https://lobbix.co.il/api/config
# → {"brand":"Lobbix","version":"1.1.0","demoMode":false,...}
```

Open in browser:
- **https://lobbix.co.il** → marketing landing page
- **https://lobbix.co.il/app** → the PWA (no demo button, no seed users shown)
- **https://lobbix.co.il/api/config** → JSON config with `demoMode: false`

---

## 🛑 Common deploy issues

### "Error creating build plan with Railpack"
You hit this before. Fixed by the new root `Dockerfile` + `railway.json`. If
it happens again, check that **both files exist at the repo root**, not inside
`backend/`.

### "better-sqlite3 native build failed"
The Dockerfile installs `python3 make g++` just for the build stage, then
removes them. If you see this error, check that the Alpine package install
line is still in the Dockerfile (line 12 area).

### "Cannot find module 'dist/server.js'"
The TypeScript build didn't run. Check Railway build logs for `npm run build`
output. The compile is quiet — if it errors, you'll see the exact TS error.

### Port binding timeout / "application failed to respond"
The app listens on `process.env.PORT` (Railway injects this). Don't hard-code
`PORT=3000` in Railway env vars — Railway sets this automatically and you
should leave it untouched.

### "Demo sign-in is disabled in this environment"
Intentional behavior when `DEMO_MODE=false`. Flip to `true` only if you want
the Google demo button active (not recommended for production).

### Data disappears after redeploy
You forgot the Railway volume OR didn't set `DATA_DIR=/app/data`. Step 3 above.

### "CORS blocked" in browser console
Your domain isn't in the CORS allowlist. The server allows `lobbix.co.il`
and `www.lobbix.co.il` in production — make sure you're visiting one of those,
not the `.up.railway.app` temp URL. If you need to test on the temp URL first,
temporarily set `NODE_ENV=development` or add the URL to the CORS origins in
`server.ts`.

---

## 🔐 Before you accept real users

Production readiness checklist:

- [ ] `DEMO_MODE=false` in Railway env vars
- [ ] `JWT_SECRET` and `REFRESH_TOKEN_SECRET` are both set to 64-byte random hex
- [ ] Custom domain `lobbix.co.il` connected with valid Let's Encrypt SSL
- [ ] Either a Railway volume mounted at `/app/data` OR a managed Postgres `DATABASE_URL`
- [ ] Twilio A2P 10DLC registration complete (takes 2-5 business days)
- [ ] Tranzila merchant account approved (takes 1-2 weeks)
- [ ] `SENTRY_DSN` set (free tier is fine for MVP)
- [ ] Test the full flow from the production URL: landing → /app → OTP → create building → add expense → view audit log
- [ ] Test from both a desktop browser AND a phone
- [ ] Test in Hebrew + English
- [ ] Verify Lighthouse accessibility score on the landing page (target ≥ 90)
- [ ] Confirm legal docs render with real owner info (Liam Golan, ת.ז. 325314755, etc.)

## 💸 Expected monthly cost (Railway only)

| Resource | Cost |
|---|---|
| Railway service (1 container, 512MB RAM, always-on) | $5 |
| Railway Postgres (if you switch from SQLite) | $5 |
| Railway volume 1GB (if you stay on SQLite) | Free |
| Custom domain SSL | Free (Let's Encrypt) |
| **Subtotal** | **$5–10/month** |

Plus separately:
- Twilio SMS to Israel: ~$0.08 × 3 OTPs/user/month × users
- Tranzila: 2.5% + ₪0.70 per transaction
- SendGrid: free up to 100 emails/day

---

## Need to redeploy after fixing something?

```bash
git add .
git commit -m "fix: whatever"
git push
# Railway auto-deploys on push to main
```

Or manually in the Railway dashboard: click the failed deployment → **"Redeploy"**.
