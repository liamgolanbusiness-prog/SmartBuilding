// Add richer mock data to make the app screens look alive.
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '..', 'data', 'vaad.sqlite');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const uuid = () => crypto.randomUUID();

const building = db.prepare('SELECT id FROM buildings LIMIT 1').get();
if (!building) { console.error('No building. Run seed first.'); process.exit(1); }
const buildingId = building.id;

// ---------- Residents ----------
const existingRes = db.prepare('SELECT COUNT(*) c FROM residents WHERE building_id = ?').get(buildingId).c;
console.log('Current residents:', existingRes);

const extraResidents = [
  { phone: '+972506111111', name: 'יעל שפירא', apt: '2', role: 'resident' },
  { phone: '+972506222222', name: 'Michael Goldberg', apt: '3', role: 'resident' },
  { phone: '+972506333333', name: 'תמר אוחנה', apt: '7', role: 'treasurer' },
  { phone: '+972506444444', name: 'אבי בן דוד', apt: '8', role: 'resident' },
  { phone: '+972506555555', name: 'Sarah Klein', apt: '11', role: 'resident' },
  { phone: '+972506666666', name: 'יוסי אלוני', apt: '12', role: 'resident' },
  { phone: '+972506777777', name: 'נועה גרינברג', apt: '14', role: 'resident' },
  { phone: '+972506888888', name: 'רון כץ', apt: '16', role: 'vaad_member' },
  { phone: '+972506999999', name: 'אורלי מזרחי', apt: '18', role: 'resident' },
  { phone: '+972507000000', name: 'Daniel Levy', apt: '22', role: 'resident' },
];

const insertRes = db.prepare(`
  INSERT OR IGNORE INTO residents (id, building_id, phone_number, phone_verified, full_name, apartment_number, role)
  VALUES (?, ?, ?, 1, ?, ?, ?)
`);
let addedR = 0;
for (const r of extraResidents) {
  try { insertRes.run(uuid(), buildingId, r.phone, r.name, r.apt, r.role); addedR++; } catch (e) {}
}
console.log('Added residents:', addedR);

// ---------- Announcements ----------
const vaadAdmin = db.prepare("SELECT id FROM residents WHERE building_id = ? AND role = 'vaad_admin' LIMIT 1").get(buildingId);
const adminId = vaadAdmin?.id;

const announcements = [
  { title: 'Monthly Va\'ad Meeting — April', content: 'The monthly va\'ad meeting will be held on Wednesday at 20:00 in the lobby. All residents are welcome to attend. Agenda: 2026 budget, lobby renovation, garden landscaping.', category: 'event', pinned: 1 },
  { title: '🚨 Water shutoff Friday 9:00–14:00', content: 'The municipality will perform maintenance on the main line. Please store water in advance. Hot water may be affected throughout the day.', category: 'urgent', pinned: 1 },
  { title: 'Elevator service Tuesday', content: 'The technician will perform the quarterly safety inspection and oil change on Tuesday between 10:00 and 13:00. Please use the stairs during this window.', category: 'maintenance', pinned: 0 },
  { title: 'חג פסח שמח לכל הדיירים 🌸', content: 'הוועד מאחל לכל הדיירים חג פסח כשר ושמח. בחג הראשון לא תהיה איסוף אשפה, אנא תכננו בהתאם.', category: 'general', pinned: 0 },
  { title: 'Rooftop yoga every Sunday 7:30 AM', content: 'Join neighbors for a free yoga session on the rooftop. Bring your own mat. Led by Noa from apartment 14. All levels welcome!', category: 'event', pinned: 0 },
  { title: 'New package locker installed', content: 'A secure parcel locker has been installed near the mailboxes. Delivery companies will be informed gradually. Access code will be sent privately.', category: 'general', pinned: 0 },
  { title: 'Roof waterproofing — Phase 2', content: 'Phase 2 of the roof waterproofing will begin next Monday and last approximately 10 days. Expect noise between 8:00–16:00. Thank you for your patience.', category: 'maintenance', pinned: 0 },
];

const insertAnn = db.prepare(`
  INSERT INTO announcements (id, building_id, created_by_id, title, content, category, is_pinned, published_at, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?))
`);

const existingAnn = db.prepare('SELECT COUNT(*) c FROM announcements WHERE building_id = ?').get(buildingId).c;
if (existingAnn < 5) {
  announcements.forEach((a, i) => {
    const off = '-' + (i * 2 + 1) + ' hours';
    try { insertAnn.run(uuid(), buildingId, adminId, a.title, a.content, a.category, a.pinned, off, off); } catch (e) { console.log(e.message); }
  });
  console.log('Added', announcements.length, 'announcements');
}

// ---------- Tickets ----------
const residents = db.prepare('SELECT id, full_name, apartment_number FROM residents WHERE building_id = ?').all(buildingId);
const tickets = [
  { title: 'Elevator stuck on 3rd floor', desc: 'The main elevator has been stuck between floors 3 and 4 for the past hour. Cannot reach the technician line.', cat: 'elevator', pri: 'urgent', st: 'open', loc: 'Main elevator' },
  { title: 'Leaking pipe in basement parking', desc: 'Water is dripping near parking spot #12. There is a small puddle forming and it seems to be coming from the ceiling.', cat: 'plumbing', pri: 'high', st: 'in_progress', loc: 'Basement, spot 12' },
  { title: 'Lobby lights flickering', desc: 'Two of the ceiling lights in the main lobby have been flickering for the past 2 days, especially in the evening.', cat: 'electrical', pri: 'normal', st: 'open', loc: 'Lobby' },
  { title: 'Stairwell needs cleaning', desc: 'The stairwell between floors 5 and 7 has not been cleaned this week. Dust and some trash are accumulating.', cat: 'cleaning', pri: 'low', st: 'resolved', loc: 'Floors 5-7 stairwell' },
  { title: 'Intercom not working — Apt 8', desc: 'Visitors cannot buzz me from the entrance. The system rings but the unlock button has no effect.', cat: 'electrical', pri: 'normal', st: 'open', loc: 'Apartment 8 intercom' },
  { title: 'Garage door sensor issue', desc: 'The garage door sometimes closes on cars. Seems like the safety sensor is misaligned or broken.', cat: 'other', pri: 'high', st: 'in_progress', loc: 'Parking garage' },
  { title: 'Mold in storage room', desc: 'Noticed black mold forming on the wall of my personal storage unit in the basement.', cat: 'other', pri: 'normal', st: 'open', loc: 'Basement storage' },
  { title: 'Hot water not working', desc: 'No hot water since this morning in apartment 11. Cold water is fine. Boiler may need resetting.', cat: 'plumbing', pri: 'high', st: 'resolved', loc: 'Apartment 11' },
];

const insertTicket = db.prepare(`
  INSERT INTO tickets (id, building_id, created_by_resident_id, title, description, category, priority, status, location, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?))
`);
const existingTic = db.prepare('SELECT COUNT(*) c FROM tickets WHERE building_id = ?').get(buildingId).c;
if (existingTic < 5) {
  tickets.forEach((t, i) => {
    const author = residents[i % residents.length];
    const off = '-' + (i + 1) * 3 + ' hours';
    try { insertTicket.run(uuid(), buildingId, author.id, t.title, t.desc, t.cat, t.pri, t.st, t.loc, off, off); } catch (e) {}
  });
  console.log('Added', tickets.length, 'tickets');
}

// ---------- Payments ----------
const paymentTypes = [
  { type: 'vaad_monthly', desc: 'Monthly Vaad fee — April 2026', amount: 450 },
  { type: 'vaad_monthly', desc: 'Monthly Vaad fee — March 2026', amount: 450 },
  { type: 'vaad_monthly', desc: 'Monthly Vaad fee — February 2026', amount: 450 },
  { type: 'repair', desc: 'Elevator repair special fee', amount: 180 },
  { type: 'insurance', desc: 'Annual building insurance', amount: 320 },
  { type: 'utility', desc: 'Shared electricity Q1', amount: 95 },
];

const insertPay = db.prepare(`
  INSERT INTO payments (id, building_id, resident_id, payment_type, description, amount, currency, due_date, payment_date, status, created_at)
  VALUES (?, ?, ?, ?, ?, ?, 'ILS', ?, ?, ?, datetime('now', ?))
`);
const existingPay = db.prepare('SELECT COUNT(*) c FROM payments WHERE building_id = ?').get(buildingId).c;
if (existingPay < 6) {
  residents.slice(0, 8).forEach((r, i) => {
    paymentTypes.forEach((p, j) => {
      const status = j === 0 ? 'pending' : j === 1 ? 'paid' : j === 2 ? 'paid' : j === 3 ? 'pending' : j === 4 ? 'paid' : 'pending';
      const due = `2026-${String(Math.max(1, 4 - j)).padStart(2, '0')}-01`;
      const paid = status === 'paid' ? `2026-${String(Math.max(1, 4 - j)).padStart(2, '0')}-05` : null;
      try { insertPay.run(uuid(), buildingId, r.id, p.type, p.desc, p.amount, due, paid, status, '-' + (i * 5 + j) + ' days'); } catch (e) {}
    });
  });
  console.log('Added payments');
}

console.log('\n✅ Extra seed complete');
console.log('Residents:', db.prepare('SELECT COUNT(*) c FROM residents').get().c);
console.log('Announcements:', db.prepare('SELECT COUNT(*) c FROM announcements').get().c);
console.log('Tickets:', db.prepare('SELECT COUNT(*) c FROM tickets').get().c);
console.log('Payments:', db.prepare('SELECT COUNT(*) c FROM payments').get().c);
db.close();
