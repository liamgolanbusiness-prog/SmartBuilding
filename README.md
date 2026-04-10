# VaadApp - Building Management System
## ועד בית - מערכת ניהול בניינים

A comprehensive building management application for Israeli apartment buildings, designed to solve payment tracking, maintenance requests, communication, and financial transparency challenges.

## 📋 Overview

VaadApp is a mobile-first platform that connects Va'ad (building committee) members with residents, streamlining:
- 💰 **Payment Management** - Automated tracking, reminders, and Israeli payment integrations (bit, credit cards, standing orders)
- 🔧 **Maintenance Tickets** - Report and track building issues
- 📢 **Communication** - Building-wide announcements with read receipts
- 📊 **Financial Transparency** - Real-time budget and expense tracking
- 🗳️ **Digital Voting** - Remote participation in building decisions
- 📄 **Document Management** - Centralized storage for contracts and bylaws

## 🏗️ Project Structure

```
vaad-app/
├── backend/              # Node.js + TypeScript API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth, validation
│   │   ├── services/     # Business logic
│   │   ├── config/       # Database, environment
│   │   └── db/           # Schema, migrations, seeds
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── mobile/               # React Native app (TO BE CREATED)
│   └── README.md
│
├── docs/                 # Documentation
│   ├── israeli_payments_integration.md
│   ├── technical_architecture.md
│   └── integrations_guide.md
│
├── docker-compose.yml    # Local development setup
└── README.md             # This file
```

## 🚀 Quick Start (Docker - Recommended)

### Prerequisites
- Docker Desktop
- Git

### Setup
```bash
# Clone repository
git clone <your-repo-url>
cd vaad-app

# Copy environment file
cp backend/.env.example backend/.env

# Start all services (PostgreSQL + Redis + API)
docker-compose up -d

# Wait for services to start, then seed database
docker-compose exec api npm run db:seed

# API is now running at http://localhost:3000
```

### Test It Works
```bash
# Health check
curl http://localhost:3000/health

# Send OTP (check console logs for OTP code in development)
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+972501234567"}'
```

## 🛠️ Development Setup (Manual)

### Backend Setup
See [backend/README.md](backend/README.md) for detailed instructions.

**Quick version:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials

# Setup database
createdb vaad_dev
psql vaad_dev < src/db/schema.sql
npm run db:seed

# Start development server
npm run dev
```

### Mobile App Setup
Coming soon! Will use React Native with Expo.

## 🧪 Test Data

After running `npm run db:seed`, you'll have:

**Building:**
- Name: בניין הדקלים
- Invite Code: `DEKEL2024`
- 50 apartments

**Test Users:**
- **Va'ad Admin**: +972501234567
- **Va'ad Member**: +972502345678  
- **Resident**: +972503456789

In development mode, OTP codes are printed to the console instead of being sent via SMS.

## 📱 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Request OTP code
- `POST /api/auth/verify-otp` - Login with OTP
- `POST /api/auth/refresh-token` - Get new access token
- `POST /api/auth/logout` - Invalidate refresh token

### Residents
- `GET /api/residents` - List all residents (Va'ad only)
- `GET /api/residents/me` - Current user profile
- `PUT /api/residents/me` - Update profile

### Coming Soon
- Payments API
- Tickets API
- Announcements API
- Votes API
- Expenses API
- Documents API

Full API documentation: [backend/README.md](backend/README.md)

## 🔐 Authentication Flow

1. User enters phone number
2. System sends 6-digit OTP via SMS (Twilio)
3. User enters OTP code
4. System verifies and returns JWT tokens
5. Mobile app stores tokens securely
6. Access token used for API requests (expires 1h)
7. Refresh token used to get new access token (expires 30d)

## 💳 Payment Integration (Israeli Market)

### Supported Payment Methods
1. **bit** - Instant P2P transfers (80% of Israelis use it)
2. **Standing Orders (הוראת קבע)** - Automatic monthly payments
3. **Credit Cards** - Via Tranzila/CardCom/Yaad Sarig
4. **Bank Transfer** - Manual fallback

See [docs/israeli_payments_integration.md](docs/israeli_payments_integration.md) for detailed integration guide.

## 🗄️ Database Schema

**Core Tables:**
- `buildings` - Building information
- `residents` - Users and their roles
- `payments` - Payment records and status
- `tickets` - Maintenance requests
- `announcements` - Building communications
- `votes` - Decision polls
- `expenses` - Building expenses

Full schema: [backend/src/db/schema.sql](backend/src/db/schema.sql)

## 📚 Documentation

- **[Israeli Payments Integration](docs/israeli_payments_integration.md)** - Complete guide to bit, credit cards, standing orders
- **[Technical Architecture](docs/technical_architecture.md)** - System design, database schema, API structure
- **[Integrations Guide](docs/integrations_guide.md)** - SMS, email, push notifications, file storage

## 🎯 Development Roadmap

### Phase 1: MVP (Months 1-3) ✅ IN PROGRESS
- [x] Backend API foundation
- [x] Authentication with OTP
- [x] Database schema
- [x] Docker development environment
- [ ] Payment tracking system
- [ ] Ticket management
- [ ] Basic announcements
- [ ] Mobile app (React Native)

### Phase 2: Core Features (Months 4-6)
- [ ] Credit card integration (Tranzila)
- [ ] bit Business integration
- [ ] Finance dashboard
- [ ] Document management
- [ ] Email notifications
- [ ] SMS reminders

### Phase 3: Advanced Features (Months 7-9)
- [ ] Digital voting system
- [ ] Contractor management
- [ ] Advanced analytics
- [ ] WhatsApp integration
- [ ] Multi-language support (Hebrew/Russian/Arabic/English)

## 🚢 Deployment

### Recommended Platforms
- **Railway.app** - Easy deployment, PostgreSQL included
- **Render.com** - Good free tier for testing
- **AWS** - Production-ready, more complex

Deployment guide: [backend/README.md#deployment](backend/README.md#deployment)

## 🔧 Tech Stack

**Backend:**
- Node.js 18+
- TypeScript
- Express.js
- PostgreSQL 15+
- Redis
- JWT authentication

**Mobile (Coming Soon):**
- React Native
- Expo
- TypeScript
- Redux/Zustand for state management

**Infrastructure:**
- Docker & Docker Compose
- AWS S3 for file storage
- Twilio for SMS
- SendGrid for email
- Firebase for push notifications

## 🧪 Testing

```bash
# Backend unit tests
cd backend
npm test

# Backend integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 🐛 Troubleshooting

**Docker containers won't start:**
```bash
docker-compose down
docker-compose up -d --build
```

**Database connection issues:**
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres
```

**API not responding:**
```bash
# Check API logs
docker-compose logs api

# Restart API container
docker-compose restart api
```

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Support

- 📧 Email: support@vaad-app.co.il
- 💬 GitHub Issues: [Report bugs or request features](issues)
- 📖 Documentation: [docs/](docs/)

## 🎉 Getting Help

New to the project? Start here:
1. Read [backend/README.md](backend/README.md) for backend setup
2. Review [docs/technical_architecture.md](docs/technical_architecture.md) for system overview
3. Check [docs/israeli_payments_integration.md](docs/israeli_payments_integration.md) for payment integration
4. Join our development discussions in Issues

---

**Made with ❤️ for Israeli building communities**
