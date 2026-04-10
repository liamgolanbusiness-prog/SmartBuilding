# Israeli Payment Integration Guide for Building Management App

## Payment Landscape in Israel

### Primary Payment Methods (Priority Order)

#### 1. **bit (ביט)** - MOST IMPORTANT
- **What it is**: Israel's instant P2P payment system owned by all major banks
- **Market penetration**: 80%+ of Israeli adults
- **Why critical**: Residents already use it, instant transfers, no fees
- **Integration options**:
  - **bit Business API**: Official integration for collecting payments
  - **bit Payment Request**: Generate payment requests with specific amounts
  - **Phone number-based**: Send payment request to resident's phone number
  - **Status**: Real-time payment confirmation webhooks

**Implementation**:
```
1. Register as bit Business merchant
2. Get API credentials from your bank
3. Integration flow:
   - Create payment request via API
   - Send link/QR to resident's phone
   - Resident approves in bit app
   - Receive webhook confirmation
   - Auto-update payment status in your system
```

**Pros**: 
- Zero transaction fees for receiver
- Instant settlement
- Everyone has it
- No credit card needed
- Bank-level security

**Cons**:
- Requires Israeli bank account
- Integration slightly complex
- No recurring payments (residents must approve each time)

---

#### 2. **Standing Order (הוראת קבע)** - IDEAL FOR MONTHLY FEES
- **What it is**: Direct debit authorization from resident's bank account
- **Best for**: Monthly maintenance fees (דמי ניהול)
- **How it works**: One-time authorization, automatic monthly charges

**Implementation**:
```
1. Resident fills out bank standing order form (physical or digital)
2. Form sent to their bank with your building account details
3. Bank automatically transfers fixed amount monthly
4. You receive payment notification from your bank
5. Match payment to resident via reference number
```

**Pros**:
- Set and forget - no manual payments
- Very common in Israel for monthly bills
- No fees
- Guaranteed payment (bank handles it)

**Cons**:
- Requires physical/digital form signing
- Takes 1-2 billing cycles to activate
- Can only be cancelled by resident at their bank
- Fixed amount (not flexible)

**Your Implementation**:
- Generate pre-filled standing order forms in the app
- Include building bank account + reference number
- Allow residents to download/email to their bank
- Track which residents have active standing orders

---

#### 3. **Credit Card Processing** - BACKUP OPTION
**Providers to integrate**:

##### **Tranzila (טרנזילה)**
- Israeli payment gateway, very established
- Supports all Israeli credit cards
- Tokenization for saving cards
- Recurring billing support
- Hebrew interface
- API documentation in Hebrew/English

##### **CardCom (קארד-קום)**
- Another major Israeli gateway
- Good for small businesses
- Lower fees than some competitors
- Simple integration

##### **Yaad Sarig (יעד שרג)**
- Popular for small merchants
- Easy setup
- Good support in Hebrew

**Credit Card Integration Flow**:
```
1. Resident enters card details (or uses saved card)
2. Your backend sends to gateway API
3. Gateway processes with Israeli banks
4. Receives approval/decline
5. If approved, charge goes through
6. Save token for future recurring payments
7. Send receipt to resident
```

**Recurring Billing**:
- Save encrypted card token
- Set up automatic monthly charges
- Send notification 3 days before charge
- Auto-retry if card declines
- Update resident if payment fails

**Costs**:
- Setup fee: ₪500-2000 one-time
- Transaction fee: 1.5-2.5% + ₪0.50-1.50 per transaction
- Monthly fee: ₪50-200

---

#### 4. **Bank Transfer (העברה בנקאית)** - MANUAL FALLBACK
- **What it is**: Resident manually transfers via their bank app
- **When to use**: Elderly residents, special assessments, one-time payments
- **How it works**:
  - Provide building bank account number
  - Resident transfers manually
  - They include their apartment number in reference field
  - You manually reconcile

**Your Implementation**:
- Display bank details in payment screen
- Generate unique reference number per payment
- Allow manual payment upload from bank statement
- Semi-automated reconciliation matching

---

#### 5. **PayBox / Pepper Pay** - MODERN ALTERNATIVES
- **PayBox**: Israeli payment app (owned by Isracard)
- **Pepper Pay**: Bank Leumi's payment solution
- Both work like bit but less universal
- Consider as secondary options

---

## Recommended Payment Architecture

### For Monthly Maintenance Fees (דמי ניהול):

**Tier 1 - Primary (80% of residents)**:
1. Standing Order (הוראת קבע) - automatic monthly
2. Saved credit card - recurring billing

**Tier 2 - One-time monthly (15%)**:
1. bit payment request (sent automatically on 1st of month)
2. Credit card one-time payment via app

**Tier 3 - Manual (5%)**:
1. Bank transfer with reference number
2. Cash/check (recorded manually by Va'ad)

### For Special Assessments / One-time Charges:

**Tier 1**:
1. bit payment request (with specific amount)
2. Credit card payment

**Tier 2**:
1. Bank transfer
2. Split payments (multiple months)

---

## Technical Implementation

### Database Schema for Payments

```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY,
  resident_id UUID REFERENCES residents(id),
  method_type VARCHAR(50), -- 'standing_order', 'saved_card', 'bit'
  is_primary BOOLEAN DEFAULT false,
  
  -- For standing orders
  standing_order_bank VARCHAR(100),
  standing_order_active_date DATE,
  standing_order_amount DECIMAL(10,2),
  
  -- For saved cards (tokenized)
  card_token VARCHAR(255), -- from payment gateway
  card_last_4 VARCHAR(4),
  card_expiry VARCHAR(7),
  card_brand VARCHAR(20),
  
  -- For bit
  bit_phone_number VARCHAR(20),
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE payments (
  id UUID PRIMARY KEY,
  resident_id UUID REFERENCES residents(id),
  payment_type VARCHAR(50), -- 'monthly_fee', 'special_assessment', 'fine'
  amount DECIMAL(10,2),
  due_date DATE,
  payment_date DATE,
  status VARCHAR(20), -- 'pending', 'paid', 'overdue', 'failed'
  
  payment_method VARCHAR(50), -- 'standing_order', 'credit_card', 'bit', 'bank_transfer'
  transaction_id VARCHAR(255), -- from gateway/bank
  
  -- Receipt
  receipt_url VARCHAR(500),
  receipt_sent_at TIMESTAMP,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE payment_reminders (
  id UUID PRIMARY KEY,
  payment_id UUID REFERENCES payments(id),
  sent_at TIMESTAMP,
  reminder_type VARCHAR(50), -- 'before_due', 'on_due', 'overdue_3days', 'overdue_7days'
  channel VARCHAR(20), -- 'email', 'sms', 'push', 'whatsapp'
);
```

### Payment Processing Flow

```
MONTHLY FEE GENERATION (Runs on 25th of month):
1. Generate payment records for all apartments
2. Set due_date = 1st of next month
3. Set amount based on apartment size/rules
4. Create payment records with status='pending'

AUTOMATIC PAYMENT ATTEMPTS (Runs on 1st):
1. Query all pending payments where due_date = today
2. For each payment:
   a. Check resident's primary payment method
   b. If standing_order: Mark as 'awaiting_bank' (will reconcile from bank statement)
   c. If saved_card: Attempt charge via gateway API
   d. If bit: Send payment request to phone number
   e. Update status based on result

PAYMENT CONFIRMATION:
- Credit card: Webhook from gateway → update status to 'paid'
- bit: Webhook from bit → update status to 'paid'
- Standing order: Manual reconciliation from bank statement
- Bank transfer: Manual or semi-auto matching

REMINDER SYSTEM:
- 3 days before due: Friendly reminder (email + push)
- On due date: "Payment due today" (SMS + email + push)
- 3 days overdue: First overdue notice (SMS + email)
- 7 days overdue: Second notice + call from Va'ad
- 14 days overdue: Formal letter + possible late fee

RECEIPT GENERATION:
- On payment confirmation → Generate PDF receipt
- Email receipt immediately
- Store in documents section
- Make available for download
```

---

## Integration Providers Comparison

| Provider | Setup Complexity | Fees | Best For | Notes |
|----------|-----------------|------|----------|-------|
| **bit Business** | Medium | ₪0 | P2P, instant | Requires bank relationship |
| **Standing Order** | Low | ₪0 | Recurring monthly | Most reliable |
| **Tranzila** | Medium | 1.8% + ₪1 | Credit cards | Hebrew support |
| **CardCom** | Low | 2.2% + ₪0.80 | Small buildings | Easy setup |
| **Yaad Sarig** | Low | 2.5% | Backup option | Higher fees |

---

## Recommended Implementation Order

### Phase 1 - MVP (First 2 months):
1. ✅ Manual bank transfer tracking
2. ✅ CSV import from bank statements
3. ✅ Manual reconciliation interface
4. ✅ Receipt generation (PDF)

### Phase 2 - Semi-Automated (Month 3-4):
1. ✅ Credit card integration (Tranzila)
2. ✅ Saved card tokenization
3. ✅ One-time payments via app
4. ✅ Automatic reminders

### Phase 3 - Fully Automated (Month 5-6):
1. ✅ bit Business integration
2. ✅ Recurring billing via saved cards
3. ✅ Standing order form generation
4. ✅ Webhook processing

### Phase 4 - Advanced (Month 7+):
1. ✅ Payment splitting (multiple months)
2. ✅ Installment plans
3. ✅ Late fee automation
4. ✅ Refund processing

---

## Code Example: bit Payment Request

```javascript
// Backend API endpoint: POST /api/payments/create-bit-payment

const createBitPaymentRequest = async (paymentId) => {
  const payment = await db.payments.findById(paymentId);
  const resident = await db.residents.findById(payment.resident_id);
  
  // Call bit Business API
  const bitResponse = await fetch('https://api.bit.business/v1/payment-requests', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.BIT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipient_phone: resident.phone_number,
      amount: payment.amount,
      description: `דמי ניהול ${building.name} - ${formatMonth(payment.due_date)}`,
      reference_number: payment.id,
      callback_url: `${process.env.API_URL}/webhooks/bit-payment-confirmed`
    })
  });
  
  const { payment_request_id, qr_code_url, deep_link } = await bitResponse.json();
  
  // Save to database
  await db.payments.update(payment.id, {
    bit_request_id: payment_request_id,
    bit_qr_code: qr_code_url,
    bit_deep_link: deep_link
  });
  
  // Send notification to resident
  await sendPushNotification(resident.id, {
    title: 'תשלום חדש ממתין',
    body: `דמי ניהול לחודש ${formatMonth(payment.due_date)} - ₪${payment.amount}`,
    action: 'open_bit_app',
    deep_link: deep_link
  });
  
  return { success: true, payment_request_id };
};

// Webhook handler: POST /webhooks/bit-payment-confirmed
const handleBitWebhook = async (req, res) => {
  const { payment_request_id, status, transaction_id } = req.body;
  
  // Verify webhook signature
  if (!verifyBitSignature(req.headers['x-bit-signature'], req.body)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const payment = await db.payments.findOne({ bit_request_id: payment_request_id });
  
  if (status === 'completed') {
    await db.payments.update(payment.id, {
      status: 'paid',
      payment_date: new Date(),
      transaction_id: transaction_id
    });
    
    // Generate receipt
    const receiptUrl = await generateReceipt(payment.id);
    
    // Send confirmation to resident
    await sendEmail(payment.resident.email, {
      subject: 'אישור תשלום - דמי ניהול',
      template: 'payment_confirmation',
      data: { payment, receiptUrl }
    });
  }
  
  res.json({ success: true });
};
```

---

## Security Considerations

### PCI Compliance (for credit cards):
- ❌ NEVER store actual credit card numbers
- ✅ Use tokenization from payment gateway
- ✅ All payment pages must be HTTPS
- ✅ Use gateway's hosted payment page (iframe) for card entry
- ✅ Store only: last 4 digits, expiry month/year, token

### Data Protection:
- Encrypt payment tokens at rest
- Use environment variables for API keys
- Implement rate limiting on payment endpoints
- Log all payment attempts for audit
- Two-factor auth for Va'ad members accessing payment data

### Israeli Regulations:
- Follow Privacy Protection Law (חוק הגנת הפרטיות)
- Keep payment records for 7 years (tax law requirement)
- Provide itemized receipts (חשבונית מס)
- Support VAT calculation if applicable

---

## Cost Analysis for 50-Apartment Building

### Monthly Costs:

**Payment Processing**:
- Standing orders: ₪0 (free)
- bit payments: ₪0 (free for receiver)
- Credit card (assume 20% use cards): 
  - 10 payments × ₪500 average × 2% = ₪100/month
  
**Gateway Fees**:
- Monthly platform fee: ₪150-200
- SMS reminders (30 residents × 2 SMS): ₪60
- Email service: ₪50

**Total monthly cost**: ~₪300-400
**Per apartment**: ₪6-8/month

### One-time Setup:
- Payment gateway setup: ₪500-1500
- bit Business registration: ₪0-500
- Integration development: Included in app development

**ROI**: 
- Reduces Va'ad treasurer time: 5-10 hours/month → 1-2 hours/month
- Improves collection rate: 70% → 90%+ paying on time
- Eliminates need for manual bank reconciliation
