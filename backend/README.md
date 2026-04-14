# Lobbix Backend

**ועד שקוף. בניין רגוע.**

The Node.js + TypeScript backend for [Lobbix](https://lobbix.co.il), a transparent building-committee management platform for Israeli condominiums.

See the top-level `README.md` for full product overview, features, and tech stack.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+
- Redis (for caching and queues)
- Optional: Docker & Docker Compose

### Option 1: Local Setup

1. **Clone and Install**
```bash
cd backend
npm install
```

2. **Setup Environment Variables**
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. **Setup Database**
```bash
# Create database
createdb vaad_dev

# Run schema
psql vaad_dev < src/db/schema.sql

# Seed test data
npm run db:seed
```

4. **Start Development Server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Option 2: Docker Setup (Recommended)

1. **Start all services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- API Server (port 3000)

2. **Run migrations and seed**
```bash
docker-compose exec api npm run db:seed
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.ts  # Database connection
│   ├── controllers/     # Request handlers
│   │   └── auth.controller.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # Authentication
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── ticket.routes.ts
│   │   └── ...
│   ├── services/        # Business logic
│   │   └── sms.service.ts
│   ├── utils/           # Helper functions
│   ├── db/              # Database files
│   │   ├── schema.sql   # Database schema
│   │   └── seed.ts      # Test data
│   └── server.ts        # Main application
├── .env.example         # Environment template
├── package.json
└── tsconfig.json
```

## 🔐 Authentication Flow

1. User enters phone number
2. Backend sends 6-digit OTP via SMS
3. User enters OTP
4. Backend verifies OTP and returns JWT tokens
5. Client stores tokens and uses access token for API calls

**Test in Development:**
- OTP codes are printed to console instead of sent via SMS
- Use test phone numbers from seed data

## 📡 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout

### Residents
- `GET /api/residents` - List all residents (Va'ad only)
- `GET /api/residents/me` - Get current user profile
- `PUT /api/residents/me` - Update profile
- `GET /api/residents/:id` - Get specific resident

### Payments (TO BE IMPLEMENTED)
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `GET /api/payments/:id` - Get payment details
- `POST /api/payments/:id/pay` - Process payment

### Tickets (TO BE IMPLEMENTED)
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket details

### Announcements (TO BE IMPLEMENTED)
- `GET /api/announcements` - List announcements
- `POST /api/announcements` - Create announcement
- `GET /api/announcements/:id` - Get announcement

## 🧪 Testing the API

### 1. Send OTP
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+972501234567"}'
```

In development, check console for OTP code.

### 2. Verify OTP and Login
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+972501234567",
    "code": "123456"
  }'
```

Response will include `accessToken` and `refreshToken`.

### 3. Use Access Token
```bash
curl -X GET http://localhost:3000/api/residents/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## 🗄️ Database

### Schema Overview
- `buildings` - Building information
- `residents` - Users/residents
- `otp_codes` - OTP verification codes
- `refresh_tokens` - JWT refresh tokens
- `payments` - Payment records
- `payment_methods` - Saved payment methods
- `tickets` - Maintenance tickets
- `ticket_comments` - Ticket discussion
- `announcements` - Building announcements
- `announcement_reads` - Read receipts

### Running Migrations
```bash
npm run db:migrate
```

### Seeding Test Data
```bash
npm run db:seed
```

This creates:
- 1 test building (invite code: DEKEL2024)
- 1 Va'ad admin (+972501234567)
- 1 Va'ad member (+972502345678)
- 3 regular residents
- Test payments, tickets, and announcements

## 🔧 Configuration

### Required Environment Variables

**Database:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

**JWT:**
- `JWT_SECRET` - Secret for access tokens
- `JWT_EXPIRES_IN` - Access token expiry (e.g., "1h")
- `REFRESH_TOKEN_SECRET` - Secret for refresh tokens
- `REFRESH_TOKEN_EXPIRES_IN` - Refresh token expiry (e.g., "30d")

**SMS (Twilio):**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

**Email (SendGrid):**
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`

## 🚢 Deployment

### Railway (Recommended for MVP)

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and initialize:
```bash
railway login
railway init
```

3. Add PostgreSQL:
```bash
railway add --plugin postgresql
```

4. Add Redis:
```bash
railway add --plugin redis
```

5. Set environment variables in Railway dashboard

6. Deploy:
```bash
railway up
```

### Environment-Specific Setup

**Production Checklist:**
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS only
- [ ] Configure CORS for production domains
- [ ] Set up error monitoring (Sentry)
- [ ] Configure automated backups
- [ ] Set up health checks
- [ ] Enable rate limiting

## 📱 Next Steps

### Backend Development
1. Implement payment controller and integration with Tranzila
2. Implement ticket management system
3. Implement announcement broadcasting
4. Add voting system
5. Implement finance dashboard
6. Set up background jobs (Bull queues)
7. Add file upload (S3)
8. Implement push notifications

### Mobile App
See `/mobile` directory for React Native setup

### Testing
- Add unit tests (Jest)
- Add integration tests
- Add E2E tests (Supertest)

## 🐛 Troubleshooting

**Database connection fails:**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL is correct
- Ensure database exists: `psql -l`

**OTP not sending:**
- Check Twilio credentials
- Verify phone number format (+972...)
- In development, check console logs for OTP

**JWT errors:**
- Verify JWT_SECRET is set
- Check token hasn't expired
- Ensure Authorization header format: "Bearer TOKEN"

## 📚 Documentation

- [Israeli Payment Integration Guide](../docs/israeli_payments_integration.md)
- [Technical Architecture](../docs/technical_architecture.md)
- [Integration Services](../docs/integrations_guide.md)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

MIT
