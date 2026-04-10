# Third-Party Integrations & Services Guide

## Essential Integrations for MVP

### 1. SMS Provider (OTP & Notifications)

#### **Recommended: Twilio**
- **Why**: International reach, reliable, good API
- **Cost**: $0.05 per SMS to Israel
- **Setup**:
  ```javascript
  const twilio = require('twilio');
  const client = twilio(accountSid, authToken);
  
  await client.messages.create({
    body: `קוד האימות שלך: ${otpCode}`,
    from: '+972...',  // Your Twilio number
    to: resident.phone_number
  });
  ```

#### **Alternative: Israeli SMS Providers**

**SMS4Free** (פרי SMS)
- Israeli company, cheaper for local SMS
- Cost: ~₪0.15 per SMS
- Better Hebrew support
- https://www.sms4free.co.il

**InfoBip**
- Used by many Israeli companies
- Good deliverability
- https://www.infobip.com

---

### 2. Email Service

#### **Recommended: SendGrid**
- **Free tier**: 100 emails/day
- **Pro tier**: $15/month for 40k emails
- **Features**:
  - Email templates
  - Tracking (opens, clicks)
  - Unsubscribe management
  - Hebrew RTL support

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: resident.email,
  from: 'no-reply@vaad-app.co.il',
  subject: 'אישור תשלום',
  templateId: 'd-...',  // SendGrid template ID
  dynamicTemplateData: {
    resident_name: resident.full_name,
    amount: payment.amount,
    receipt_url: payment.receipt_url
  }
});
```

#### **Alternative: Amazon SES**
- Cheaper for high volume ($0.10 per 1,000 emails)
- More complex setup
- Need to verify domain

---

### 3. Push Notifications

#### **Firebase Cloud Messaging (FCM)**
- **Free** (no limits)
- Works on iOS and Android
- Reliable delivery

**Setup**:
1. Create Firebase project
2. Add Firebase SDK to mobile app
3. Get device tokens when user logs in
4. Send notifications from backend

```javascript
const admin = require('firebase-admin');

await admin.messaging().send({
  token: resident.fcm_token,
  notification: {
    title: 'תשלום חדש ממתין',
    body: `דמי ניהול לחודש ${month} - ₪${amount}`
  },
  data: {
    action: 'open_payment',
    payment_id: payment.id
  },
  android: {
    priority: 'high'
  },
  apns: {
    payload: {
      aps: {
        sound: 'default',
        badge: 1
      }
    }
  }
});
```

---

### 4. File Storage

#### **Amazon S3**
- Industry standard
- $0.023 per GB/month
- Highly reliable
- Integration with CloudFront CDN

**Setup**:
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Generate signed URL for direct upload
const uploadUrl = s3.getSignedUrl('putObject', {
  Bucket: 'vaad-uploads',
  Key: `tickets/${ticketId}/${fileName}`,
  Expires: 300, // 5 minutes
  ContentType: 'image/jpeg'
});
```

#### **Alternative: Backblaze B2**
- $0.005 per GB/month (1/4 the price of S3)
- S3-compatible API
- Good for cost-conscious startups

---

### 5. WhatsApp Integration (Optional but Popular)

#### **Twilio WhatsApp API**
- Send announcements via WhatsApp
- Receive replies
- Cost: $0.005 per message

```javascript
await client.messages.create({
  from: 'whatsapp:+972...',
  to: `whatsapp:${resident.phone_number}`,
  body: announcement.content
});
```

**Flow**:
1. Resident opts in to WhatsApp notifications
2. Building announcements sent to WhatsApp
3. Residents can reply with keywords ("PAYMENT", "TICKETS")
4. Bot responds with relevant info

---

### 6. PDF Generation

#### **Recommended: PDFKit (Node.js)**
- Generate receipts, reports
- Hebrew RTL support with proper configuration

```javascript
const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateReceipt = (payment) => {
  const doc = new PDFDocument({ lang: 'he' });
  
  // Right-to-left
  doc.font('path/to/hebrew-font.ttf');
  
  doc.fontSize(20).text('קבלה', { align: 'right' });
  doc.fontSize(12).text(`מספר קבלה: ${payment.receipt_number}`, { align: 'right' });
  doc.text(`תאריך: ${formatDate(payment.payment_date)}`, { align: 'right' });
  doc.text(`שם: ${payment.resident.full_name}`, { align: 'right' });
  doc.text(`דירה: ${payment.resident.apartment_number}`, { align: 'right' });
  doc.text(`סכום: ₪${payment.amount}`, { align: 'right' });
  
  // Save to S3
  const stream = doc.pipe(fs.createWriteStream('/tmp/receipt.pdf'));
  doc.end();
  
  return stream;
};
```

#### **Alternative: Puppeteer**
- Render HTML to PDF
- More flexible for complex layouts
- Heavier (requires headless Chrome)

---

## Payment Gateway Integrations (Detailed)

### Tranzila Integration

**Step 1: Register**
- Go to https://www.tranzila.com
- Register business account
- Get Terminal ID and API password

**Step 2: Implement Payment Flow**

```javascript
const crypto = require('crypto');

// Create payment request
const createTranzilaPayment = async (payment) => {
  const params = {
    supplier: process.env.TRANZILA_TERMINAL_ID,
    sum: payment.amount,
    currency: 1, // ILS
    cred_type: 1, // Regular credit
    lang: 'il',
    
    // Customer details
    contact: payment.resident.full_name,
    email: payment.resident.email,
    phone: payment.resident.phone_number,
    
    // Custom fields
    user1: payment.id, // Your payment ID
    user2: payment.resident.apartment_number,
    
    // Return URL
    success_url: `${process.env.APP_URL}/payment-success`,
    fail_url: `${process.env.APP_URL}/payment-failed`,
    notify_url: `${process.env.API_URL}/webhooks/tranzila`
  };
  
  // Generate signature
  const signature = crypto
    .createHash('md5')
    .update(`${params.supplier}${params.sum}${process.env.TRANZILA_API_PASSWORD}`)
    .digest('hex');
  
  params.signature = signature;
  
  // Redirect user to Tranzila
  const url = `https://direct.tranzila.com/${params.supplier}?${new URLSearchParams(params)}`;
  return url;
};

// Handle webhook (payment confirmation)
app.post('/webhooks/tranzila', async (req, res) => {
  const { Response, ConfirmationCode, user1 } = req.body;
  
  if (Response === '000') {
    // Payment successful
    await db.payments.update(user1, {
      status: 'paid',
      payment_date: new Date(),
      transaction_id: ConfirmationCode
    });
    
    // Generate receipt
    await generateAndSendReceipt(user1);
  }
  
  res.send('OK');
});
```

**Step 3: Tokenization (for saved cards)**

```javascript
// Create token for future charges
const createCardToken = async (cardDetails) => {
  const response = await axios.post('https://api.tranzila.com/v1/tokens', {
    supplier: process.env.TRANZILA_TERMINAL_ID,
    ccno: cardDetails.number,
    expmonth: cardDetails.expiry_month,
    expyear: cardDetails.expiry_year,
    cvv: cardDetails.cvv
  });
  
  return response.data.token;
};

// Charge saved card
const chargeSavedCard = async (payment, cardToken) => {
  const response = await axios.post('https://api.tranzila.com/v1/charge', {
    supplier: process.env.TRANZILA_TERMINAL_ID,
    token: cardToken,
    sum: payment.amount,
    currency: 1
  });
  
  return response.data;
};
```

---

### bit Business Integration

**Step 1: Register**
- Contact your bank to activate bit Business
- Get API credentials
- Set up webhook URL

**Step 2: Create Payment Request**

```javascript
const createBitPayment = async (payment, resident) => {
  const response = await axios.post('https://api.bit.business/v1/payment-requests', {
    merchant_id: process.env.BIT_MERCHANT_ID,
    amount: payment.amount,
    description: `דמי ניהול ${building.name}`,
    recipient_phone: resident.phone_number,
    reference_number: payment.id,
    callback_url: `${process.env.API_URL}/webhooks/bit`
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.BIT_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  return {
    request_id: response.data.id,
    deep_link: response.data.deep_link, // Opens bit app
    qr_code: response.data.qr_code_url
  };
};

// Webhook handler
app.post('/webhooks/bit', async (req, res) => {
  const { request_id, status, transaction_id } = req.body;
  
  // Verify webhook signature
  const signature = req.headers['x-bit-signature'];
  if (!verifyBitSignature(signature, req.body)) {
    return res.status(401).send('Invalid signature');
  }
  
  if (status === 'completed') {
    const payment = await db.payments.findOne({ 
      bit_request_id: request_id 
    });
    
    await db.payments.update(payment.id, {
      status: 'paid',
      payment_date: new Date(),
      transaction_id
    });
    
    await generateAndSendReceipt(payment.id);
  }
  
  res.send('OK');
});
```

---

## Analytics & Monitoring

### 1. **Sentry** (Error Tracking)
- Free for up to 5k events/month
- Catches bugs in production
- Shows exactly what went wrong

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Catches all unhandled errors
app.use(Sentry.Handlers.errorHandler());
```

### 2. **Mixpanel or PostHog** (Product Analytics)
- Track user behavior
- See which features are used
- Measure engagement

```javascript
const mixpanel = require('mixpanel').init(process.env.MIXPANEL_TOKEN);

// Track events
mixpanel.track('Payment Created', {
  distinct_id: resident.id,
  amount: payment.amount,
  method: 'credit_card',
  building_id: building.id
});

// User properties
mixpanel.people.set(resident.id, {
  $name: resident.full_name,
  $phone: resident.phone_number,
  apartment: resident.apartment_number,
  role: resident.role
});
```

---

## Calendar Integration (Future)

### Google Calendar API
- Export building events to residents' calendars
- Meeting reminders

```javascript
const { google } = require('googleapis');

const calendar = google.calendar('v3');

// Create event
await calendar.events.insert({
  auth: oauth2Client,
  calendarId: 'primary',
  resource: {
    summary: 'אסיפת דיירים',
    description: 'אסיפה כללית שנתית',
    start: { dateTime: '2024-03-15T19:00:00+02:00' },
    end: { dateTime: '2024-03-15T21:00:00+02:00' },
    attendees: residents.map(r => ({ email: r.email }))
  }
});
```

---

## WhatsApp Business Platform (Advanced)

### Meta WhatsApp Business API
- More powerful than Twilio WhatsApp
- Interactive buttons, lists
- Better for customer service

**Use cases**:
- "Press 1 to pay, 2 to report issue, 3 to speak with Va'ad"
- Send payment reminder with "Pay Now" button
- Quick replies for common questions

**Cost**: 
- Free for first 1,000 conversations/month
- $0.01-0.05 per conversation after

---

## Israeli-Specific Services

### 1. **Postal Code API** (מיקוד)
- Get address details from postal code
- https://data.gov.il/dataset/mictavim

### 2. **Israeli Bank Holidays**
- Don't send reminders on Shabbat/holidays
- https://www.hebcal.com/home/195/jewish-calendar-rest-api

```javascript
const isWorkingDay = async (date) => {
  const response = await axios.get(`https://www.hebcal.com/hebcal?cfg=json&v=1&year=${date.getFullYear()}&month=${date.getMonth()+1}`);
  
  const holidays = response.data.items.filter(item => 
    item.category === 'holiday' && 
    new Date(item.date).toDateString() === date.toDateString()
  );
  
  const isShabbat = date.getDay() === 6;
  
  return !isShabbat && holidays.length === 0;
};

// Use when scheduling reminders
const scheduleReminder = async (payment) => {
  let reminderDate = new Date(payment.due_date);
  reminderDate.setDate(reminderDate.getDate() - 3);
  
  // Skip Shabbat/holidays
  while (!(await isWorkingDay(reminderDate))) {
    reminderDate.setDate(reminderDate.getDate() - 1);
  }
  
  queue.add('send-reminder', { paymentId: payment.id }, {
    delay: reminderDate - new Date()
  });
};
```

### 3. **Israeli ID Validation**
- Validate Teudat Zehut (identity number)

```javascript
const validateIsraeliID = (id) => {
  id = String(id).trim().padStart(9, '0');
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = Number(id[i]) * ((i % 2) + 1);
    sum += digit > 9 ? digit - 9 : digit;
  }
  
  return sum % 10 === 0;
};
```

---

## Backup & Disaster Recovery

### Database Backups
```javascript
// Daily automated backups to S3
const backupDatabase = async () => {
  const timestamp = new Date().toISOString();
  const filename = `backup-${timestamp}.sql`;
  
  // pg_dump
  const { exec } = require('child_process');
  exec(`pg_dump ${process.env.DATABASE_URL} > /tmp/${filename}`, async (error) => {
    if (error) {
      console.error('Backup failed:', error);
      return;
    }
    
    // Upload to S3
    await s3.upload({
      Bucket: 'vaad-backups',
      Key: filename,
      Body: fs.createReadStream(`/tmp/${filename}`)
    }).promise();
    
    console.log('Backup successful:', filename);
  });
};

// Run daily at 3 AM
cron.schedule('0 3 * * *', backupDatabase);
```

### Retention Policy
- Keep daily backups for 7 days
- Keep weekly backups for 1 month
- Keep monthly backups for 1 year

---

## Security Services

### 1. **Cloudflare**
- DDoS protection (free)
- SSL certificate (free)
- CDN (free)
- Rate limiting
- Bot protection

### 2. **Let's Encrypt SSL**
- Free SSL certificates
- Auto-renewal
- Works with all hosting providers

### 3. **reCAPTCHA v3**
- Protect login from bots
- Invisible to users
- Free from Google

```javascript
const verifyRecaptcha = async (token) => {
  const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', {
    secret: process.env.RECAPTCHA_SECRET,
    response: token
  });
  
  return response.data.success && response.data.score > 0.5;
};
```

---

## Cost Summary (All Integrations)

### Essential (MVP):
- Twilio SMS: $15/month (300 SMS)
- SendGrid: $0 (free tier)
- Firebase FCM: $0 (free)
- S3 storage: $5/month
- Sentry: $0 (free tier)
- **Total: ~$20/month**

### Full Featured:
- Add: Payment gateway: $150
- Add: WhatsApp: $10
- Add: Mixpanel: $0 (free tier)
- **Total: ~$180/month**

### Per building (50 apartments):
- $3-4 per month infrastructure
- Add payment processing costs (variable)

---

## Integration Testing Checklist

Before launch, test:
- ✅ OTP delivery (SMS arrives within 30 seconds)
- ✅ Email delivery (receipts, announcements)
- ✅ Push notifications (iOS and Android)
- ✅ Payment flow (credit card, bit)
- ✅ Webhook handling (payment confirmations)
- ✅ File uploads (photos, documents)
- ✅ PDF generation (receipts, reports)
- ✅ Hebrew RTL rendering (all emails, PDFs)
- ✅ Error tracking (Sentry catches errors)
- ✅ Backup/restore database
- ✅ Load testing (50 concurrent users)

---

This completes the integration specification. All these services work well together and are proven in production by thousands of apps.
