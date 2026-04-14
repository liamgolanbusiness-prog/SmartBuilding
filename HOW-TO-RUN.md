# Lobbix — How to Run & Test

## ✨ What's built

A complete, beautiful, mobile-first building-management app (ועד בית) with:

- **Beautiful iPhone-framed mockup** on desktop + native mobile view on phones
- **Phone + OTP login** (no passwords) with 6-digit input
- **Home dashboard**: greeting, building card, 4 quick actions, balance card, payment
  activity bar chart (6 months), committee insights (admin-only), latest news & tickets
- **Announcements**: category filter chips (all / urgent / maintenance / event / general),
  pinned items, vaad-only create sheet with title/category/content
- **Tickets**: status filter chips, create-sheet with priority & category, ticket detail
  page with description/meta/status actions
- **Payments**: dark gradient balance card, status filters (all/pending/paid), list of
  every payment with amount and due date
- **Residents directory**: search, 2-column grid of avatar cards with role badges
- **Profile**: avatar, role/apt badges, building info, preferences (dark mode, RTL Hebrew,
  notifications, email), account actions (about, help, share code, logout)
- **Notifications panel** (bell icon): pulls open tickets + pinned/urgent announcements
- **Dark mode + RTL Hebrew** toggles — persisted to localStorage
- **Animated counters**, pull-to-refresh, toasts, smooth transitions
- **Role-based UI**: admin insights & create-announcement button only visible to vaad
- **Rich seed data**: 15 residents, 8 announcements, 10 tickets, 51 payments

## 🚀 Running it

The backend is already running on port **3000** (via `npm run dev` / nodemon in
`backend/`). If it stops:

```bash
cd backend
npm install   # first time only
npm run dev
```

Then open: **http://localhost:3000**

The desktop view shows a marketing panel + iPhone mockup. On real phones (or when you
shrink the browser window under 420px), the phone frame collapses into true fullscreen
mobile — exactly like a downloaded app.

### Try it in mobile view

- In Chrome: press `F12` → click the device toolbar icon → choose iPhone 14 Pro
- Or just resize the browser window narrower than 900px
- On the desktop stage, the right-side toolbar has **iPhone 14 / Pixel 7 / Fullscreen**
  buttons to preview specific devices

## 🔑 Test users (click to autofill on the stage)

| Role        | Phone              | What they see                                     |
| ----------- | ------------------ | ------------------------------------------------- |
| Vaad admin  | `+972501234567`    | Full admin view + insights + create announcements |
| Vaad member | `+972502345678`    | Same as admin                                     |
| Resident    | `+972503456789`    | Resident-only view (no create announcement)       |

After you click "Send verification code", the OTP prints to the backend server console.
Copy it into the 6-digit input.

> Tip: when logged out, you can click any seeded user in the left-side hint panel to
> auto-send an OTP for that number.

## 🎨 Features to try

1. **Toggle dark mode**: tap *Me* (profile) → toggle "Dark mode"
2. **RTL Hebrew**: tap *Me* → toggle "Hebrew (RTL)" — UI flips right-to-left
3. **Filter announcements**: tap *News* → click "🚨 Urgent" chip
4. **Open a ticket**: tap *Tickets* → tap any card → see detail view
5. **Update ticket status**: on the detail page, tap one of the status buttons
6. **Create a ticket**: tap the `+` icon top-right in *Tickets*
7. **Create an announcement** (admin only): tap `+` in *News*
8. **Quick actions**: on *Home*, tap "Report issue" — jumps to tickets & opens form
9. **Notifications**: tap the bell icon top-right of home
10. **Payment chart**: scroll down on *Home* to see the 6-month bar chart
11. **Resident search**: tap *Home* → quick-action "Directory" → type a name

## 🗂 File map

```
backend/
├── public/
│   ├── index.html     ← App shell, phone frame, all views
│   ├── style.css      ← Modern design tokens, dark mode, RTL, animations
│   └── app.js         ← SPA router, all features, chart, notifications, PTR
├── src/
│   ├── server.ts      ← Express + Socket.IO, serves public/ as web UI
│   ├── config/database.ts    ← SQLite shim mimicking pg API
│   ├── routes/        ← auth, residents, tickets, payments, announcements
│   └── db/
│       ├── schema.sqlite.sql
│       └── seed.ts    ← Initial seed (building, users)
└── scripts/
    └── extra-seed.js  ← Adds 10 residents, 8 announcements, 8 tickets, 48 payments
```

To re-seed with rich data anytime:

```bash
cd backend
node scripts/extra-seed.js
```

## 🧪 Data model

- **1 building**: "בניין הדקלים", 50 apts, invite code `DEKEL2024`
- **15 residents**: mix of Hebrew + English names, roles (admin / member / treasurer / resident)
- **8 announcements**: across 4 categories, 2 pinned
- **10 tickets**: across 5 categories, mixed priority and status
- **51 payments**: spread across 6 months, paid / pending mix

Everything persists in `backend/data/vaad.sqlite`.

## ✅ Verified working

- Login flow (OTP) ✓
- Home dashboard with live stats ✓
- 5 tab routes (Home / News / Tickets / Pay / Me) ✓
- Filter chips on 3 views ✓
- Create ticket & announcement ✓
- Ticket detail + status update ✓
- Notifications panel ✓
- Dark mode + RTL toggle (persists) ✓
- Role-based admin widgets ✓
- Resident search ✓
- 6-month payment chart ✓
- Logout + fresh login ✓

Enjoy! 🎉
