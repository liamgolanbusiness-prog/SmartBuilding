# Lobbix
## ועד שקוף. בניין רגוע.

**Lobbix** is a transparent, mobile-first building-committee management platform for Israeli condominiums (בית משותף). It solves the number-one pain point of every ועד בית: residents accusing committees of mishandling money. Every action the committee takes — creating a payment rule, recording an expense, uploading a receipt — is logged in a transparency log that every resident can read.

🌐 **Live site**: [lobbix.co.il](https://lobbix.co.il)
👤 **Built by**: Liam Golan, Israel (עוסק פטור)
📧 **Contact**: liam@lobbix.co.il

---

## 🌟 What's inside

- 💰 **Financial dashboard** — real-time building budget, collection rates, 6-month trend charts, per-category breakdowns
- 📢 **Announcements + polls** — posts with categories, attached polls, automatic quorum calculation (51%/66%/75% per Israeli condominium law)
- 🔧 **Maintenance tickets** — residents open tickets with photo attachments; full open→resolved lifecycle
- 🧾 **Expense tracking** — every expense with a receipt, category, notes; CSV export for the accountant
- 🔁 **Recurring maintenance** — define periodic tasks (elevator, water tanks, extinguishers); get automatic reminders
- 📁 **Document vault** — insurance policies, contracts, bylaws, engineering plans — accessible to every resident
- 🔍 **Transparency audit log** — every committee action is recorded automatically in a log visible to all residents, cannot be deleted
- 🧰 **Contractor directory** — rated list of plumbers, electricians, service providers with phone/notes
- 👥 **Resident directory** — find neighbors by apartment, invite new residents via invite code
- 🚨 **Emergency hotline** — one-tap call for building contact, MDA 101, police 100, fire 102, electric 103
- 🔐 **Passwordless login** — OTP via SMS, optional Google sign-in
- 📲 **Installable PWA** — works offline, add-to-home-screen, full RTL Hebrew + English
- 🛡️ **Full legal compliance** — Israeli Privacy Protection Law (5741-1981), GDPR, 7-year financial retention, 72-hour breach notification

## 🏗️ Project structure

```
lobbix/
├── backend/                   # Node.js + TypeScript API + PWA frontend
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # auth, validate, audit, errorHandler
│   │   ├── services/          # SMS, notifications
│   │   ├── config/            # Database (SQLite shim → Postgres)
│   │   └── db/                # Schema, migrations, seeds
│   ├── public/
│   │   ├── index.html         # Main PWA (served at /app)
│   │   ├── landing.html       # Marketing landing page (served at /)
│   │   ├── app.js             # SPA client
│   │   ├── style.css          # All app styles
│   │   ├── sw.js              # Service worker (offline + PWA)
│   │   ├── manifest.webmanifest
│   │   └── icon-192.svg, icon-512.svg
│   └── package.json
├── mobile/                    # (reserved for Capacitor wrap)
├── docs/                      # Integration + architecture docs
└── README.md
```

## 🚀 Quick start (local dev)

```bash
cd backend
npm install
cp .env.example .env          # edit the .env values
npm run dev                    # starts with nodemon at http://localhost:3000
```

Then open:
- **http://localhost:3000** — marketing landing page
- **http://localhost:3000/app** — the PWA (log in with seeded users)

### Seeded test users

When `DEMO_MODE=true` (the default), three accounts are available:

| Role | Phone | OTP |
|---|---|---|
| **Super Admin** + Vaad Admin | `+972501234567` | `123456` |
| **Vaad Member** (committee) | `+972502345678` | `123456` |
| **Regular Resident** | `+972503456789` | `123456` |

The OTP is printed to the server console. The `123456` code is accepted only when `DEMO_MODE=true`.

## 🌍 Environment modes

Lobbix uses a `DEMO_MODE` environment variable to separate demo features from production:

- `DEMO_MODE=true` (default, for local dev + staging):
  - The "Continue with Google (demo)" button is visible on the login screen
  - Seeded test users are listed on the marketing stage panel
  - The `/api/auth/google-demo` endpoint is active
- `DEMO_MODE=false` (production):
  - All demo-only UI is hidden via a body CSS class
  - The demo Google endpoint returns 404

The SPA fetches `/api/config` on boot and respects whatever the server returns.

## 📐 Tech stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: SQLite (dev) → PostgreSQL (production, via managed Supabase/Neon/Railway)
- **Auth**: JWT + refresh tokens, OTP via Twilio, optional Google OAuth
- **SMS**: Twilio
- **Email**: SendGrid
- **Payments**: Tranzila / Cardcom (Israeli sliqa)
- **Tax receipts**: EZcount / GreenInvoice (עוסק פטור: קבלה only, no VAT)
- **Push**: Firebase Cloud Messaging (Android) + APNs (iOS, via Capacitor wrap)
- **Monitoring**: Sentry
- **Hosting**: Railway / Render / Fly.io (backend), Supabase (database)
- **Frontend**: Vanilla HTML + CSS + JS (no framework, no build step), PWA with Service Worker

## 📜 Legal & compliance

Lobbix is operated by **Liam Golan** (עוסק פטור, ת.ז. 325314755, נצח ישראל 21, הוד השרון).

- Prices do not include VAT (עוסק פטור)
- Only receipts (קבלה) are issued, not tax invoices (חשבוניות מס)
- Full ToS and Privacy Policy available in the app at `/app#legal`
- Compliant with:
  - Israeli Privacy Protection Law, 5741-1981
  - Privacy Protection (Information Security) Regulations, 5777-2017
  - GDPR (for EEA users)

See `backend/public/app.js` → `renderTermsHebrew`/`renderPrivacyHebrew` for the full legal text.

## 🤝 Contributing

This is currently a solo project. Issues and PRs welcome via [github.com/liamgolanbusiness-prog/SmartBuilding](https://github.com/liamgolanbusiness-prog/SmartBuilding).

## 📄 License

MIT © 2026 Liam Golan
