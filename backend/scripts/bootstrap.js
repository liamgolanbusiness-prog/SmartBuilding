// Runs once at container startup BEFORE the server.
// - Ensures the SQLite schema is applied
// - Seeds a fresh database with demo data (building + 3 core users + the
//   rich mock content from extra-seed.js) so the deployed instance is
//   immediately usable from a phone.
//
// Idempotent: if the `buildings` table already has rows, nothing is re-seeded.

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'vaad.sqlite');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---- Schema ----
const schemaPath = path.join(__dirname, '..', 'src', 'db', 'schema.sqlite.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);
console.log('✅ Schema applied');

// ---- Seed (only if empty) ----
const { c: buildingCount } = db.prepare('SELECT COUNT(*) c FROM buildings').get();
if (buildingCount > 0) {
  console.log(`ℹ️  Database already has ${buildingCount} building(s) — skipping seed.`);
  db.close();
  return;
}

console.log('🌱 Empty database — seeding core data...');
const uuid = () => crypto.randomUUID();

const buildingId = uuid();
db.prepare(
  `INSERT INTO buildings (id, name, address, city, total_apartments, invite_code, bank_name, bank_account_number)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
).run(
  buildingId,
  'בניין הדקלים',
  'רחוב הרצל 15',
  'תל אביב',
  50,
  'DEKEL2024',
  'בנק הפועלים',
  '12-345-678901'
);

const insertResident = db.prepare(
  `INSERT INTO residents (id, building_id, phone_number, phone_verified, full_name, apartment_number, role)
   VALUES (?, ?, ?, 1, ?, ?, ?)`
);

// Core users — matches src/db/seed.ts
const coreResidents = [
  { phone: '+972501234567', name: 'דוד כהן',      apt: '1',  role: 'vaad_admin' },
  { phone: '+972502345678', name: 'שרה לוי',      apt: '5',  role: 'vaad_member' },
  { phone: '+972503456789', name: 'משה אברהם',    apt: '10', role: 'resident' },
  { phone: '+972504567890', name: 'רחל ישראלי',   apt: '15', role: 'resident' },
  { phone: '+972505678901', name: 'יוסף דוידוב',  apt: '20', role: 'resident' },
];
for (const r of coreResidents) {
  insertResident.run(uuid(), buildingId, r.phone, r.name, r.apt, r.role);
}
console.log(`✅ Created ${coreResidents.length} core residents`);

// A few starter payments for every plain resident
const plainResidents = db
  .prepare("SELECT id FROM residents WHERE building_id = ? AND role = 'resident'")
  .all(buildingId);
const insertPayment = db.prepare(
  `INSERT INTO payments (id, building_id, resident_id, payment_type, description, amount, due_date, status)
   VALUES (?, ?, ?, 'monthly_fee', ?, 450.00, date('now'), 'pending')`
);
for (const r of plainResidents) {
  insertPayment.run(uuid(), buildingId, r.id, 'דמי ניהול - חודש נוכחי');
}

// Close our handle before extra-seed opens its own
db.close();

// Delegate to the existing rich seed script
console.log('🌱 Running extra-seed.js for rich mock data...');
try {
  require('./extra-seed.js');
  console.log('✅ Rich seed complete');
} catch (err) {
  console.error('⚠️  extra-seed failed (continuing anyway):', err && err.message);
}

console.log('\n🎉 Bootstrap finished. Demo credentials:');
console.log('  Admin:    +972501234567');
console.log('  Member:   +972502345678');
console.log('  Resident: +972503456789');
console.log('  Invite:   DEKEL2024\n');
