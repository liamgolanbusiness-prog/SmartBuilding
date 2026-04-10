-- SQLite-compatible version of schema.sql.
-- UUID -> TEXT PK (ids injected by database.ts shim)
-- JSONB -> TEXT, TIMESTAMP -> TEXT, arrays -> TEXT, no triggers/functions.

CREATE TABLE IF NOT EXISTS buildings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  total_apartments INTEGER NOT NULL,

  bank_name TEXT,
  bank_account_number TEXT,
  bank_branch TEXT,

  default_currency TEXT DEFAULT 'ILS',
  default_language TEXT DEFAULT 'he',
  timezone TEXT DEFAULT 'Asia/Jerusalem',

  invite_code TEXT UNIQUE NOT NULL,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS residents (
  id TEXT PRIMARY KEY,
  building_id TEXT REFERENCES buildings(id) ON DELETE CASCADE,

  phone_number TEXT UNIQUE NOT NULL,
  phone_verified INTEGER DEFAULT 0,
  email TEXT,
  email_verified INTEGER DEFAULT 0,

  full_name TEXT NOT NULL,
  profile_photo_url TEXT,
  preferred_language TEXT DEFAULT 'he',

  apartment_number TEXT,
  is_owner INTEGER DEFAULT 1,
  is_tenant INTEGER DEFAULT 0,

  role TEXT DEFAULT 'resident',

  notifications_enabled INTEGER DEFAULT 1,
  notification_channels TEXT DEFAULT '{"push": true, "email": true, "sms": false}',
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '07:00',

  is_active INTEGER DEFAULT 1,
  last_login_at TEXT,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  UNIQUE(building_id, apartment_number)
);

CREATE INDEX IF NOT EXISTS idx_residents_building ON residents(building_id);
CREATE INDEX IF NOT EXISTS idx_residents_phone ON residents(phone_number);
CREATE INDEX IF NOT EXISTS idx_residents_role ON residents(role);

CREATE TABLE IF NOT EXISTS otp_codes (
  id TEXT PRIMARY KEY,
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  verified INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone_number);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  resident_id TEXT REFERENCES residents(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_resident ON refresh_tokens(resident_id);

CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  resident_id TEXT REFERENCES residents(id) ON DELETE CASCADE,

  method_type TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,

  standing_order_bank TEXT,
  standing_order_active_date TEXT,
  standing_order_amount REAL,

  card_token TEXT,
  card_last_4 TEXT,
  card_expiry_month INTEGER,
  card_expiry_year INTEGER,
  card_brand TEXT,

  bit_phone_number TEXT,

  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_resident ON payment_methods(resident_id);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  building_id TEXT REFERENCES buildings(id) ON DELETE CASCADE,
  resident_id TEXT REFERENCES residents(id) ON DELETE CASCADE,

  payment_type TEXT NOT NULL,
  description TEXT,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'ILS',

  due_date TEXT NOT NULL,
  payment_date TEXT,

  status TEXT DEFAULT 'pending',

  payment_method TEXT,
  transaction_id TEXT,
  gateway_response TEXT,

  receipt_number TEXT UNIQUE,
  receipt_url TEXT,
  receipt_sent_at TEXT,

  metadata TEXT DEFAULT '{}',

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_building ON payments(building_id);
CREATE INDEX IF NOT EXISTS idx_payments_resident ON payments(resident_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);

CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  building_id TEXT REFERENCES buildings(id) ON DELETE CASCADE,
  created_by_resident_id TEXT REFERENCES residents(id),

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT,

  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'open',

  assigned_to_vaad_member_id TEXT REFERENCES residents(id),

  photo_urls TEXT,

  resolved_at TEXT,
  resolution_notes TEXT,
  resolution_photo_urls TEXT,

  is_duplicate INTEGER DEFAULT 0,
  parent_ticket_id TEXT REFERENCES tickets(id),
  duplicate_count INTEGER DEFAULT 0,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tickets_building ON tickets(building_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by_resident_id);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);

CREATE TABLE IF NOT EXISTS ticket_comments (
  id TEXT PRIMARY KEY,
  ticket_id TEXT REFERENCES tickets(id) ON DELETE CASCADE,
  author_id TEXT REFERENCES residents(id),

  content TEXT NOT NULL,
  attachment_urls TEXT,

  is_internal INTEGER DEFAULT 0,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON ticket_comments(ticket_id);

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  building_id TEXT REFERENCES buildings(id) ON DELETE CASCADE,
  created_by_id TEXT REFERENCES residents(id),

  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,

  target_apartments TEXT,
  target_floors TEXT,

  translations TEXT DEFAULT '{}',

  send_push INTEGER DEFAULT 1,
  send_email INTEGER DEFAULT 1,
  send_sms INTEGER DEFAULT 0,

  scheduled_for TEXT,
  published_at TEXT,
  expires_at TEXT,

  is_pinned INTEGER DEFAULT 0,

  attachment_urls TEXT,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_announcements_building ON announcements(building_id);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(published_at);

CREATE TABLE IF NOT EXISTS announcement_reads (
  id TEXT PRIMARY KEY,
  announcement_id TEXT REFERENCES announcements(id) ON DELETE CASCADE,
  resident_id TEXT REFERENCES residents(id) ON DELETE CASCADE,
  read_at TEXT DEFAULT (datetime('now')),

  UNIQUE(announcement_id, resident_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement ON announcement_reads(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_resident ON announcement_reads(resident_id);
