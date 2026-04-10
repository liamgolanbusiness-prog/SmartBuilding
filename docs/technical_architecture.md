# Building Management App - Technical Architecture Specification

## Technology Stack Recommendation

### Frontend
- **Mobile App**: React Native (single codebase for iOS + Android)
- **Web App**: React.js with Next.js
- **State Management**: Redux Toolkit or Zustand
- **UI Framework**: React Native Paper or NativeBase (material design)
- **Right-to-Left Support**: react-native-rtl for Hebrew/Arabic

### Backend
- **API Server**: Node.js with Express or Fastify
- **Alternative**: Python with FastAPI (if team prefers Python)
- **Real-time**: Socket.io for live notifications
- **Task Queue**: Bull (Redis-based) for background jobs

### Database
- **Primary Database**: PostgreSQL 15+
  - Relational data (residents, payments, tickets)
  - JSONB for flexible metadata
  - Full-text search capabilities
  - PostGIS extension for location data (future: map features)

- **Cache Layer**: Redis
  - Session management
  - Real-time data (live vote counts, online users)
  - Rate limiting
  - Task queue

- **File Storage**: AWS S3 or Backblaze B2
  - Document uploads (contracts, receipts)
  - Photos (ticket attachments, profile pictures)
  - Generated PDFs (receipts, reports)

### Infrastructure
- **Hosting**: 
  - **Recommended**: Railway.app or Render.com (easy Israeli deployment)
  - **Alternative**: AWS (more complex but scalable)
  - **Budget Option**: DigitalOcean Droplet

- **CDN**: Cloudflare (free tier sufficient)
- **Email**: SendGrid or Amazon SES
- **SMS**: Twilio or Israeli provider (SMS4Free, InfoBip)
- **Push Notifications**: Firebase Cloud Messaging (FCM)

### Development Tools
- **Version Control**: Git + GitHub/GitLab
- **CI/CD**: GitHub Actions or GitLab CI
- **API Documentation**: Swagger/OpenAPI
- **Error Tracking**: Sentry
- **Analytics**: Mixpanel or PostHog (self-hosted)

---

## Database Schema Design

### Core Tables

```sql
-- Buildings
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  total_apartments INTEGER NOT NULL,
  
  -- Bank details for payments
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_branch VARCHAR(20),
  
  -- Settings
  default_currency VARCHAR(3) DEFAULT 'ILS',
  default_language VARCHAR(5) DEFAULT 'he',
  timezone VARCHAR(50) DEFAULT 'Asia/Jerusalem',
  
  -- Building code for invites
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Residents (users)
CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  
  -- Authentication
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  phone_verified BOOLEAN DEFAULT false,
  email VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  
  -- Profile
  full_name VARCHAR(255) NOT NULL,
  profile_photo_url VARCHAR(500),
  preferred_language VARCHAR(5) DEFAULT 'he',
  
  -- Apartment info
  apartment_number VARCHAR(20) NOT NULL,
  is_owner BOOLEAN DEFAULT true,
  is_tenant BOOLEAN DEFAULT false,
  
  -- Roles
  role VARCHAR(50) DEFAULT 'resident', -- 'resident', 'vaad_member', 'vaad_admin', 'treasurer'
  
  -- Notification preferences
  notifications_enabled BOOLEAN DEFAULT true,
  notification_channels JSONB DEFAULT '{"push": true, "email": true, "sms": false}',
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(building_id, apartment_number)
);

CREATE INDEX idx_residents_building ON residents(building_id);
CREATE INDEX idx_residents_phone ON residents(phone_number);

-- Payment Methods
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  
  method_type VARCHAR(50) NOT NULL, -- 'standing_order', 'saved_card', 'bit'
  is_primary BOOLEAN DEFAULT false,
  
  -- Standing order details
  standing_order_bank VARCHAR(100),
  standing_order_active_date DATE,
  standing_order_amount DECIMAL(10,2),
  
  -- Credit card (tokenized)
  card_token VARCHAR(255), -- from payment gateway
  card_last_4 VARCHAR(4),
  card_expiry_month INTEGER,
  card_expiry_year INTEGER,
  card_brand VARCHAR(20), -- 'visa', 'mastercard', 'isracard'
  
  -- bit
  bit_phone_number VARCHAR(20),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  resident_id UUID REFERENCES residents(id),
  
  -- Payment details
  payment_type VARCHAR(50) NOT NULL, -- 'monthly_fee', 'special_assessment', 'late_fee', 'refund'
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',
  
  -- Dates
  due_date DATE NOT NULL,
  payment_date DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'failed', 'refunded'
  
  -- Payment processing
  payment_method VARCHAR(50), -- 'standing_order', 'credit_card', 'bit', 'bank_transfer', 'cash'
  transaction_id VARCHAR(255),
  gateway_response JSONB,
  
  -- Receipt
  receipt_number VARCHAR(50) UNIQUE,
  receipt_url VARCHAR(500),
  receipt_sent_at TIMESTAMP,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_resident ON payments(resident_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);

-- Tickets (maintenance requests)
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  created_by_resident_id UUID REFERENCES residents(id),
  
  -- Ticket details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'elevator', 'plumbing', 'electrical', 'cleaning', 'security', 'other'
  location VARCHAR(100), -- 'lobby', 'stairwell', 'parking', 'apt_X'
  
  -- Priority & Status
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'waiting_approval', 'resolved', 'closed'
  
  -- Assignment
  assigned_to_vaad_member_id UUID REFERENCES residents(id),
  assigned_to_contractor_id UUID REFERENCES contractors(id),
  
  -- Attachments
  photo_urls TEXT[], -- array of S3 URLs
  
  -- Resolution
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  resolution_photo_urls TEXT[],
  
  -- Deduplication
  is_duplicate BOOLEAN DEFAULT false,
  parent_ticket_id UUID REFERENCES tickets(id),
  duplicate_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tickets_building ON tickets(building_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_by ON tickets(created_by_resident_id);

-- Ticket Comments
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID REFERENCES residents(id),
  
  content TEXT NOT NULL,
  attachment_urls TEXT[],
  
  is_internal BOOLEAN DEFAULT false, -- only visible to Va'ad
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  created_by_id UUID REFERENCES residents(id),
  
  -- Content
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'emergency', 'maintenance', 'event', 'financial', 'general'
  
  -- Targeting
  target_apartments TEXT[], -- null = all, or ['1', '2', '3'] for specific
  target_floors INTEGER[], -- null = all floors
  
  -- Multi-language support
  translations JSONB DEFAULT '{}', -- {he: {...}, ru: {...}, ar: {...}, en: {...}}
  
  -- Delivery
  send_push BOOLEAN DEFAULT true,
  send_email BOOLEAN DEFAULT true,
  send_sms BOOLEAN DEFAULT false,
  
  -- Scheduling
  scheduled_for TIMESTAMP,
  published_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Pinned to top
  is_pinned BOOLEAN DEFAULT false,
  
  -- Attachments
  attachment_urls TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Announcement Read Receipts
CREATE TABLE announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(announcement_id, resident_id)
);

-- Votes (polls)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  created_by_id UUID REFERENCES residents(id),
  
  -- Vote details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  vote_type VARCHAR(20) DEFAULT 'single_choice', -- 'single_choice', 'multiple_choice', 'ranking'
  
  -- Options
  options JSONB NOT NULL, -- [{id: 1, text: 'Option A'}, {id: 2, text: 'Option B'}]
  
  -- Rules
  requires_quorum BOOLEAN DEFAULT true,
  quorum_percentage INTEGER DEFAULT 50, -- 50% of residents must vote
  is_anonymous BOOLEAN DEFAULT false,
  
  -- Weighting (for special cases)
  weight_by_apartment_size BOOLEAN DEFAULT false,
  
  -- Timing
  opens_at TIMESTAMP DEFAULT NOW(),
  closes_at TIMESTAMP NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'open', -- 'draft', 'open', 'closed', 'passed', 'failed'
  
  -- Results
  total_votes INTEGER DEFAULT 0,
  results JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vote Responses
CREATE TABLE vote_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID REFERENCES votes(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  
  selected_option_ids INTEGER[], -- [1] for single choice, [1,3] for multiple
  ranking INTEGER[], -- [2,1,3] for ranked choice
  
  voted_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(vote_id, resident_id)
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  
  -- Expense details
  description VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'elevator', 'cleaning', 'security', 'repairs', 'utilities', 'insurance', 'other'
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',
  
  -- Date
  expense_date DATE NOT NULL,
  
  -- Vendor
  vendor_name VARCHAR(255),
  contractor_id UUID REFERENCES contractors(id),
  
  -- Approval workflow
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'rejected'
  approved_by_id UUID REFERENCES residents(id),
  approved_at TIMESTAMP,
  
  -- Payment
  paid_at TIMESTAMP,
  payment_method VARCHAR(50),
  
  -- Documentation
  receipt_url VARCHAR(500),
  invoice_number VARCHAR(100),
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_expenses_building ON expenses(building_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- Contractors
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  
  -- Contractor details
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  specialty VARCHAR(100) NOT NULL, -- 'elevator', 'plumber', 'electrician', 'cleaner', 'locksmith'
  
  -- Contact
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  
  -- Rating
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contractor Reviews
CREATE TABLE contractor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id),
  reviewed_by_id UUID REFERENCES residents(id),
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  uploaded_by_id UUID REFERENCES residents(id),
  
  -- Document details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'contract', 'bylaw', 'meeting_minutes', 'insurance', 'permit', 'other'
  
  -- File
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER, -- bytes
  file_type VARCHAR(50), -- 'pdf', 'docx', 'image'
  
  -- Access control
  is_public BOOLEAN DEFAULT true, -- false = only Va'ad can see
  
  -- Versioning
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES documents(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  
  -- Content
  type VARCHAR(50) NOT NULL, -- 'payment_due', 'ticket_update', 'announcement', 'vote_open', etc.
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  
  -- Action
  action_type VARCHAR(50), -- 'open_payment', 'open_ticket', 'open_announcement'
  action_data JSONB,
  
  -- Delivery
  channels VARCHAR(50)[], -- ['push', 'email', 'sms']
  sent_at TIMESTAMP,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_resident ON notifications(resident_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  user_id UUID REFERENCES residents(id),
  
  -- Action
  action VARCHAR(100) NOT NULL, -- 'payment_created', 'ticket_resolved', 'vote_cast', etc.
  entity_type VARCHAR(50), -- 'payment', 'ticket', 'vote'
  entity_id UUID,
  
  -- Details
  old_data JSONB,
  new_data JSONB,
  
  -- Request metadata
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_building ON audit_log(building_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
```

---

## API Structure

### Authentication Endpoints

```
POST   /api/auth/send-otp
POST   /api/auth/verify-otp
POST   /api/auth/refresh-token
POST   /api/auth/logout
```

### Residents

```
GET    /api/residents              # List all residents (Va'ad only)
GET    /api/residents/:id          # Get resident profile
PUT    /api/residents/:id          # Update profile
DELETE /api/residents/:id          # Deactivate resident (Va'ad only)
GET    /api/residents/me           # Current user profile
PUT    /api/residents/me/settings  # Update notification settings
```

### Payments

```
GET    /api/payments                    # List payments
GET    /api/payments/:id                # Get payment details
POST   /api/payments                    # Create payment (Va'ad only)
PUT    /api/payments/:id                # Update payment
POST   /api/payments/:id/pay            # Process payment
GET    /api/payments/:id/receipt        # Download receipt PDF
POST   /api/payments/reconcile          # Bulk reconcile from bank (Va'ad only)
GET    /api/payments/stats              # Payment statistics
POST   /api/payments/:id/send-reminder  # Send payment reminder
```

### Tickets

```
GET    /api/tickets           # List tickets
GET    /api/tickets/:id       # Get ticket details
POST   /api/tickets           # Create ticket
PUT    /api/tickets/:id       # Update ticket
DELETE /api/tickets/:id       # Delete ticket (Va'ad only)
POST   /api/tickets/:id/comments        # Add comment
GET    /api/tickets/:id/comments        # Get comments
PUT    /api/tickets/:id/assign          # Assign to contractor
PUT    /api/tickets/:id/resolve         # Mark as resolved
POST   /api/tickets/:id/mark-duplicate  # Mark as duplicate
```

### Announcements

```
GET    /api/announcements           # List announcements
GET    /api/announcements/:id       # Get announcement
POST   /api/announcements           # Create (Va'ad only)
PUT    /api/announcements/:id       # Update (Va'ad only)
DELETE /api/announcements/:id       # Delete (Va'ad only)
POST   /api/announcements/:id/read  # Mark as read
GET    /api/announcements/:id/readers  # Who read it (Va'ad only)
```

### Votes

```
GET    /api/votes           # List votes
GET    /api/votes/:id       # Get vote details
POST   /api/votes           # Create vote (Va'ad only)
PUT    /api/votes/:id       # Update vote (Va'ad only)
DELETE /api/votes/:id       # Delete vote (Va'ad only)
POST   /api/votes/:id/cast  # Cast vote
GET    /api/votes/:id/results  # Get results
PUT    /api/votes/:id/close    # Close vote (Va'ad only)
```

### Expenses

```
GET    /api/expenses           # List expenses
GET    /api/expenses/:id       # Get expense
POST   /api/expenses           # Create expense (Va'ad only)
PUT    /api/expenses/:id       # Update expense
DELETE /api/expenses/:id       # Delete expense (Va'ad only)
POST   /api/expenses/:id/approve  # Approve expense (Va'ad only)
GET    /api/expenses/stats     # Expense statistics
GET    /api/expenses/export    # Export to Excel
```

### Documents

```
GET    /api/documents           # List documents
GET    /api/documents/:id       # Get document
POST   /api/documents           # Upload document
PUT    /api/documents/:id       # Update metadata
DELETE /api/documents/:id       # Delete document
GET    /api/documents/:id/download  # Download file
```

### Reports

```
GET    /api/reports/monthly-summary     # Monthly financial summary
GET    /api/reports/payment-status      # Payment status report
GET    /api/reports/expense-breakdown   # Expense breakdown
GET    /api/reports/annual              # Annual report
POST   /api/reports/custom              # Custom report builder
```

---

## Real-time Features (WebSocket)

```javascript
// Client connects
socket.emit('join_building', { buildingId: '...' });

// Events from server
socket.on('new_announcement', (data) => { /* Show notification */ });
socket.on('ticket_updated', (data) => { /* Refresh ticket view */ });
socket.on('vote_result_updated', (data) => { /* Update live vote count */ });
socket.on('payment_confirmed', (data) => { /* Update payment status */ });

// Events from client
socket.emit('mark_announcement_read', { announcementId: '...' });
```

---

## Security Implementation

### Authentication Flow

```
1. User enters phone number
2. Backend generates 6-digit OTP, stores in Redis (expires 5 min)
3. Send OTP via SMS (Twilio/SMS4Free)
4. User enters OTP
5. Backend verifies OTP
6. Generate JWT access token (expires 1 hour)
7. Generate refresh token (expires 30 days)
8. Return both tokens
9. Client stores tokens in secure storage
10. Client includes access token in Authorization header
11. When access token expires, use refresh token to get new access token
```

### Authorization Middleware

```javascript
const authorize = (roles = []) => {
  return (req, res, next) => {
    // Verify JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Check role
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Usage
app.post('/api/announcements', 
  authorize(['vaad_member', 'vaad_admin']), 
  createAnnouncement
);
```

### Data Access Control

```javascript
// Residents can only see their own data
const getPayments = async (req, res) => {
  const { role, id, buildingId } = req.user;
  
  let query = { building_id: buildingId };
  
  // If not Va'ad, filter to only their payments
  if (!['vaad_member', 'vaad_admin', 'treasurer'].includes(role)) {
    query.resident_id = id;
  }
  
  const payments = await db.payments.find(query);
  res.json(payments);
};
```

---

## File Upload Strategy

### Direct Upload to S3 (Recommended)

```javascript
// 1. Frontend requests signed URL
const response = await fetch('/api/uploads/get-signed-url', {
  method: 'POST',
  body: JSON.stringify({
    fileName: 'ticket-photo.jpg',
    fileType: 'image/jpeg',
    context: 'ticket_attachment'
  })
});

const { uploadUrl, fileUrl } = await response.json();

// 2. Frontend uploads directly to S3
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': 'image/jpeg' }
});

// 3. Frontend includes fileUrl in ticket creation
await fetch('/api/tickets', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Broken elevator',
    photo_urls: [fileUrl]
  })
});
```

### Image Processing Pipeline

```
Upload → S3 → Lambda/Function → 
  - Generate thumbnail (200x200)
  - Resize for display (1200px max width)
  - Strip EXIF data (privacy)
  - Store variants in S3
```

---

## Background Jobs (Bull Queue)

```javascript
// Payment reminder job
queue.add('send-payment-reminders', null, {
  repeat: { cron: '0 8 * * *' } // Daily at 8 AM
});

// Job processor
queue.process('send-payment-reminders', async (job) => {
  const overduePayments = await db.payments.find({
    status: 'overdue',
    due_date: { $lt: new Date() }
  });
  
  for (const payment of overduePayments) {
    await sendPaymentReminder(payment);
  }
});

// Other scheduled jobs
- Generate monthly payment records (1st of month)
- Close expired votes (hourly)
- Send digest emails (weekly)
- Archive old announcements (monthly)
- Generate monthly reports (1st of month)
```

---

## Deployment Architecture

### Production Setup (Railway/Render)

```
┌─────────────────┐
│   CloudFlare    │ CDN + DDoS protection
└────────┬────────┘
         │
┌────────┴────────┐
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───┴───┐ ┌───┴───┐
│ API   │ │ API   │  Node.js servers (auto-scaling)
│ #1    │ │ #2    │
└───┬───┘ └───┬───┘
    │         │
    └────┬────┘
         │
    ┌────┴────────┐
    │             │
┌───┴───┐  ┌──────┴──────┐
│ Redis │  │  PostgreSQL │
└───────┘  └─────────────┘
```

### Environment Variables

```env
# App
NODE_ENV=production
PORT=3000
APP_URL=https://vaad-app.co.il

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://user:pass@host:6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=30d

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=vaad-uploads
AWS_REGION=eu-west-1

# Payments
TRANZILA_TERMINAL_ID=...
TRANZILA_API_KEY=...
BIT_BUSINESS_API_KEY=...

# Communications
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+972...
SENDGRID_API_KEY=...
FIREBASE_SERVER_KEY=...

# Monitoring
SENTRY_DSN=...
```

---

## Performance Optimization

### Database Indexing
- All foreign keys indexed
- Composite indexes on frequently queried combinations
- Full-text search on ticket descriptions, announcements

### Caching Strategy
```
- User sessions: Redis (TTL 1 hour)
- Building settings: Redis (TTL 1 day)
- Announcement list: Redis (invalidate on create/update)
- Payment stats: Redis (TTL 10 minutes)
```

### API Response Times Target
- GET requests: < 200ms
- POST/PUT requests: < 500ms
- File uploads: < 2s (depends on size)
- PDF generation: < 1s

---

## Monitoring & Alerts

### Key Metrics to Track
- API response time (p50, p95, p99)
- Error rate
- Payment success rate
- OTP delivery rate
- Database connection pool usage
- Active users (daily, weekly, monthly)
- Feature usage (tickets created, votes cast, etc.)

### Alerts
- API error rate > 5% → Slack alert
- Payment gateway down → SMS to Va'ad admin
- Database CPU > 80% → Scale up
- Disk space < 10% → Alert

---

## Cost Estimation (Monthly)

### For 50-apartment building:

**Infrastructure**:
- Railway/Render: $20-50 (starter tier)
- PostgreSQL: Included or $10
- Redis: Included or $10
- S3 storage (10GB): $0.23
- Cloudflare: $0 (free tier)

**Services**:
- Twilio SMS (300 messages): $15
- SendGrid (10k emails): $0 (free tier)
- Firebase push: $0 (free tier)

**Payments**:
- Credit card processing: ~$100 (20% × 50 × $500 × 2%)
- Payment gateway: $150

**Total**: ~$300-400/month
**Per apartment**: $6-8/month

---

This architecture supports:
- ✅ 50-200 apartments per building
- ✅ Multiple buildings on same instance
- ✅ Real-time features
- ✅ Scalable to thousands of users
- ✅ Israeli payment ecosystem
- ✅ Multi-language support
- ✅ Mobile-first experience
