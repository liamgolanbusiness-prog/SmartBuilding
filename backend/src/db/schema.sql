-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Buildings table
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  total_apartments INTEGER NOT NULL,
  
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_branch VARCHAR(20),
  
  default_currency VARCHAR(3) DEFAULT 'ILS',
  default_language VARCHAR(5) DEFAULT 'he',
  timezone VARCHAR(50) DEFAULT 'Asia/Jerusalem',
  
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Residents (users) table
CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  phone_verified BOOLEAN DEFAULT false,
  email VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  
  full_name VARCHAR(255) NOT NULL,
  profile_photo_url VARCHAR(500),
  preferred_language VARCHAR(5) DEFAULT 'he',
  
  apartment_number VARCHAR(20) NOT NULL,
  is_owner BOOLEAN DEFAULT true,
  is_tenant BOOLEAN DEFAULT false,
  
  role VARCHAR(50) DEFAULT 'resident',
  
  notifications_enabled BOOLEAN DEFAULT true,
  notification_channels JSONB DEFAULT '{"push": true, "email": true, "sms": false}',
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(building_id, apartment_number)
);

CREATE INDEX idx_residents_building ON residents(building_id);
CREATE INDEX idx_residents_phone ON residents(phone_number);
CREATE INDEX idx_residents_role ON residents(role);

-- OTP codes table (for authentication)
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_otp_phone ON otp_codes(phone_number);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_resident ON refresh_tokens(resident_id);

-- Payment methods table
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  
  method_type VARCHAR(50) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  
  standing_order_bank VARCHAR(100),
  standing_order_active_date DATE,
  standing_order_amount DECIMAL(10,2),
  
  card_token VARCHAR(255),
  card_last_4 VARCHAR(4),
  card_expiry_month INTEGER,
  card_expiry_year INTEGER,
  card_brand VARCHAR(20),
  
  bit_phone_number VARCHAR(20),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_resident ON payment_methods(resident_id);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  
  payment_type VARCHAR(50) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',
  
  due_date DATE NOT NULL,
  payment_date DATE,
  
  status VARCHAR(20) DEFAULT 'pending',
  
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  gateway_response JSONB,
  
  receipt_number VARCHAR(50) UNIQUE,
  receipt_url VARCHAR(500),
  receipt_sent_at TIMESTAMP,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_building ON payments(building_id);
CREATE INDEX idx_payments_resident ON payments(resident_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);

-- Tickets table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  created_by_resident_id UUID REFERENCES residents(id),
  
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  location VARCHAR(100),
  
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(20) DEFAULT 'open',
  
  assigned_to_vaad_member_id UUID REFERENCES residents(id),
  
  photo_urls TEXT[],
  
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  resolution_photo_urls TEXT[],
  
  is_duplicate BOOLEAN DEFAULT false,
  parent_ticket_id UUID REFERENCES tickets(id),
  duplicate_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tickets_building ON tickets(building_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_by ON tickets(created_by_resident_id);
CREATE INDEX idx_tickets_category ON tickets(category);

-- Ticket comments table
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID REFERENCES residents(id),
  
  content TEXT NOT NULL,
  attachment_urls TEXT[],
  
  is_internal BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id);

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  created_by_id UUID REFERENCES residents(id),
  
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  
  target_apartments TEXT[],
  target_floors INTEGER[],
  
  translations JSONB DEFAULT '{}',
  
  send_push BOOLEAN DEFAULT true,
  send_email BOOLEAN DEFAULT true,
  send_sms BOOLEAN DEFAULT false,
  
  scheduled_for TIMESTAMP,
  published_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  is_pinned BOOLEAN DEFAULT false,
  
  attachment_urls TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_announcements_building ON announcements(building_id);
CREATE INDEX idx_announcements_published ON announcements(published_at);

-- Announcement reads table
CREATE TABLE announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(announcement_id, resident_id)
);

CREATE INDEX idx_announcement_reads_announcement ON announcement_reads(announcement_id);
CREATE INDEX idx_announcement_reads_resident ON announcement_reads(resident_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
