const db = require('better-sqlite3')('data/vaad.sqlite');
const crypto = require('crypto');
const uuid = () => crypto.randomUUID();

// Wipe all data
['poll_votes','polls','otp_codes','payments','tickets','announcements','payment_rules','expenses','maintenance_tasks','residents','buildings'].forEach(t => {
  try { db.exec('DELETE FROM ' + t); } catch(e) {}
});
console.log('All data wiped');

// Create building: 10 floors, 38 apartments
const bldId = uuid();
db.prepare(`INSERT INTO buildings (id, name, address, city, total_apartments, total_floors, invite_code)
  VALUES (?, 'מגדלי הים התיכון', 'שדרות בן גוריון 42', 'תל אביב', 38, 10, 'SEA2026')`).run(bldId);
console.log('Building created: מגדלי הים התיכון');

// 38 residents with Israeli names
const names = [
  'דוד כהן','שרה לוי','יוסי אברהם','מיכל ברק','אבי גולן','רונית שמיר','עמית פרץ','נועה דנינו',
  'גיל מזרחי','ליאור בן-דוד','תמר שלום','אסף כרמי','ענת אלון','רועי חדד','דניאלה ביטון','עידו נחמני',
  'אורלי אזולאי','בועז שטיין','הילה סויסה','אלי מלכה','קרן טל','אריק חן','שלי גבע','יונתן עוז',
  'מאיה ארד','ניר ששון','רוני פלד','סיגל שגב','אדם קדוש','ליאת הררי','מוטי שפירא','עינב בר-לב',
  'גלעד רוזן','שירלי נוימן','יניב מורג','אורנה סלע','דור צור','אפרת גלעד'
];

for (let i = 0; i < 38; i++) {
  const apt = i + 1;
  const floor = Math.ceil(apt / 4); // ~4 apts per floor
  const role = i === 0 ? 'vaad_admin' : i === 1 ? 'vaad_member' : 'resident';
  const phone = '+9725' + String(1000000 + i).padStart(8, '0');
  const isSuperAdmin = i === 0 ? 1 : 0;
  db.prepare(`INSERT INTO residents (id, building_id, phone_number, phone_verified, full_name, apartment_number, floor, role, is_active, is_super_admin)
    VALUES (?, ?, ?, 1, ?, ?, ?, ?, 1, ?)`).run(uuid(), bldId, phone, names[i], String(apt), floor, role, isSuperAdmin);
}
console.log('38 residents created');

// OTPs for all (valid 7 days)
db.prepare('SELECT phone_number FROM residents').all().forEach(r => {
  db.prepare("INSERT INTO otp_codes (id, phone_number, code, expires_at) VALUES (?, ?, '123456', datetime('now','+7 day'))").run(uuid(), r.phone_number);
});
console.log('OTPs seeded');

// 8 announcements
const adminId = db.prepare("SELECT id FROM residents WHERE role = 'vaad_admin'").get().id;
const anns = [
  { title: 'ברוכים הבאים למגדלי הים התיכון!', cat: 'general', pin: 1, days: 30,
    body: 'שלום לכל דיירי מגדלי הים התיכון! אנחנו שמחים להשיק את מערכת הניהול החדשה של הבניין. כאן תוכלו לעקוב אחר הודעות, לדווח על תקלות, לשלם דמי ועד ולהכיר את השכנים.' },
  { title: '🚨 הפסקת חשמל מתוכננת — יום שלישי', cat: 'urgent', pin: 1, days: 25,
    body: 'ביום שלישי הקרוב (15/04) בין השעות 08:00-14:00 תתבצע הפסקת חשמל מתוכננת בקומות 1-5 לצורך שדרוג לוח החשמל הראשי. אנא הכינו פנסים.' },
  { title: 'תיקון מעלית מס׳ 2 — עדכון', cat: 'maintenance', pin: 0, days: 20,
    body: 'חלק החילוף למעלית 2 הגיע. הטכנאי צפוי להגיע ביום ראשון בבוקר. המעלית תהיה מושבתת כ-4 שעות.' },
  { title: '🎉 ערב שכנים — יום חמישי בלובי', cat: 'event', pin: 0, days: 15,
    body: 'מוזמנים לערב שכנים ביום חמישי הקרוב בשעה 19:00 בלובי הבניין! נגיש פיצות, שתייה ומוזיקה. הביאו את המשפחות.' },
  { title: 'עדכון תקציב שנתי 2026', cat: 'general', pin: 0, days: 12,
    body: 'סיכום תקציב: הכנסות השנה ₪684,000 מדמי ועד. הוצאות עיקריות: תחזוקה (42%), ניקיון (18%), ביטוח (15%), חשמל (12%), קרן חירום (13%). יתרה: ₪23,500.' },
  { title: 'ניקוי מערכת ביוב — הודעה מוקדמת', cat: 'maintenance', pin: 0, days: 8,
    body: 'ביום שני (20/04) בין 06:00-10:00 צוות ביוב ינקה את המערכת הראשית. אל תשתמשו בכיורים/שירותים באותן שעות.' },
  { title: 'טורניר שחמט בין-קומתי', cat: 'event', pin: 0, days: 5,
    body: 'מי מצטרף? טורניר שחמט בין קומות הבניין! ההרשמה פתוחה עד סוף השבוע. פרס ראשון: פטור מדמי ועד לחודש!' },
  { title: 'פרוטוקול אסיפת דיירים — מרץ 2026', cat: 'general', pin: 0, days: 2,
    body: 'פרוטוקול ישיבה מס׳ 14: אושר תקציב שדרוג מעלית 2 (₪85,000), הוחלט על ניקיון יומי, נבחר ספק חדש לגינון.' },
];
anns.forEach(a => {
  db.prepare(`INSERT INTO announcements (id, building_id, title, content, category, is_pinned, created_by_id, published_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'), datetime('now', '-' || ? || ' days'))`)
    .run(uuid(), bldId, a.title, a.body, a.cat, a.pin, adminId, a.days, a.days);
});
console.log('8 announcements created');

// Poll on the event announcement
const eventAnn = db.prepare("SELECT id FROM announcements WHERE title LIKE '%ערב שכנים%'").get();
if (eventAnn) {
  const pollId = uuid();
  db.prepare(`INSERT INTO polls (id, building_id, announcement_id, created_by_id, question, options, expires_at, created_at)
    VALUES (?, ?, ?, ?, 'האם תגיעו לערב השכנים?', '["בטוח מגיע/ה!","אולי","לא הפעם"]', datetime('now','+7 days'), datetime('now','-2 days'))`)
    .run(pollId, bldId, eventAnn.id, adminId);
  const allRes = db.prepare('SELECT id FROM residents').all();
  [0,0,0,0,0,1,1,2,0,0,1,0,0,2,0,0,1,0,0,0,2,1,0,0].forEach((c, idx) => {
    if (idx < allRes.length) {
      db.prepare('INSERT INTO poll_votes (id, poll_id, resident_id, option_index) VALUES (?, ?, ?, ?)').run(uuid(), pollId, allRes[idx].id, c);
    }
  });
  console.log('Poll created with 24 votes');
}

// 12 tickets
const ticketData = [
  ['נזילה בחדר מדרגות קומה 3','plumbing','open','high','יש נזילה מהתקרה ליד דלת דירה 9.'],
  ['תאורה שבורה בחניון','electrical','open','high','שתי נורות לא עובדות בקומה -1 של החניון.'],
  ['מעלית 1 עושה רעש','elevator','in_progress','high','משמיעה רעש חריקה בעלייה מקומה 5.'],
  ['דלת כניסה לא נסגרת','general','in_progress','medium','הדלת הראשית לא נסגרת עד הסוף.'],
  ['ניקיון לא תקין בלובי','cleaning','resolved','medium','הלובי לא נוקה ביום רביעי. נפתר.'],
  ['רעש ממזגן מרכזי','electrical','open','medium','רעש חזק מהמזגן בגג. מפריע לקומה 10.'],
  ['גינה — השקיה לא עובדת','general','open','low','מערכת ההשקיה בגינה הקדמית מושבתת.'],
  ['חלון שבור בחדר מדרגות','general','in_progress','medium','חלון שבור בקומה 7. רוח ומים נכנסים.'],
  ['ריח ביוב בקומה 2','plumbing','open','high','ריח חזק של ביוב ליד דירות 5-8.'],
  ['מנעול תיבות דואר','general','resolved','low','מנעול תיבת דואר 15 שבור. הוחלף.'],
  ['הצפה בחניון','plumbing','resolved','medium','הצפה קלה בחניון אחרי הגשם. ניקוז נוקה.'],
  ['אינטרקום לא עובד','electrical','open','medium','האינטרקום של דירות 20-24 לא עובד.'],
];
const resIds = db.prepare('SELECT id FROM residents').all();
ticketData.forEach((td, i) => {
  db.prepare(`INSERT INTO tickets (id, building_id, title, description, category, status, priority, created_by_resident_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))`)
    .run(uuid(), bldId, td[0], td[4], td[1], td[2], td[3], resIds[(2 + i) % resIds.length].id, 20 - i * 2);
});
console.log('12 tickets created');

// Payments: April (25 paid, 13 pending) + March (all paid)
const allResidents = db.prepare('SELECT id FROM residents').all();
allResidents.forEach((r, i) => {
  const status = i < 25 ? 'paid' : 'pending';
  const paidAt = status === 'paid' ? `datetime('now', '-${i % 10} days')` : 'NULL';
  db.prepare(`INSERT INTO payments (id, building_id, resident_id, payment_type, description, amount, currency, due_date, status, payment_date)
    VALUES (?, ?, ?, 'monthly', 'דמי ועד — אפריל 2026', 450, 'ILS', '2026-04-01', ?, ${paidAt})`)
    .run(uuid(), bldId, r.id, status);
  db.prepare(`INSERT INTO payments (id, building_id, resident_id, payment_type, description, amount, currency, due_date, status, payment_date)
    VALUES (?, ?, ?, 'monthly', 'דמי ועד — מרץ 2026', 450, 'ILS', '2026-03-01', 'paid', datetime('now', '-35 days'))`)
    .run(uuid(), bldId, r.id);
});
console.log('76 payments created');

// 7 expenses
[
  ['תיקון מעלית 2 — חלק חילוף', 3200, 'maintenance', '2026-04-05'],
  ['ניקיון חודשי — מרץ', 4800, 'cleaning', '2026-03-30'],
  ['ביטוח בניין — רבעון 2', 12500, 'insurance', '2026-04-01'],
  ['חשמל רכוש משותף', 2100, 'utility', '2026-03-28'],
  ['ציוד ניקיון ומים', 680, 'supplies', '2026-04-03'],
  ['גינון חודשי', 1800, 'maintenance', '2026-04-07'],
  ['תיקון אינטרקום', 950, 'maintenance', '2026-04-10'],
].forEach(e => {
  db.prepare(`INSERT INTO expenses (id, building_id, title, amount, currency, category, expense_date, created_by_id)
    VALUES (?, ?, ?, ?, 'ILS', ?, ?, ?)`).run(uuid(), bldId, e[0], e[1], e[2], e[3], adminId);
});
console.log('7 expenses created');

// 5 maintenance tasks
[
  ['בדיקת מעלית חודשית', 'elevator', 'monthly', 30, '2026-04-20', 3],
  ['ניקוי מערכת ביוב', 'plumbing', 'quarterly', 91, '2026-06-15', 7],
  ['בדיקת גנרטור', 'electrical', 'semiannual', 182, '2026-07-01', 14],
  ['ניקוי גג ומרזבים', 'cleaning', 'quarterly', 91, '2026-05-10', 5],
  ['ריסוס מזיקים', 'other', 'quarterly', 91, '2026-04-14', 3],
].forEach(m => {
  db.prepare(`INSERT INTO maintenance_tasks (id, building_id, title, category, frequency, interval_days, next_due, reminder_days_before, active, created_by_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`).run(uuid(), bldId, m[0], m[1], m[2], m[3], m[4], m[5], adminId);
});
console.log('5 maintenance tasks created');

// Payment rule
db.prepare(`INSERT INTO payment_rules (id, building_id, name, description, amount, currency, frequency, day_of_month, applies_to, active, created_by_id)
  VALUES (?, ?, 'דמי ועד חודשי', 'תשלום שוטף לתחזוקת הבניין', 450, 'ILS', 'monthly', 1, 'all', 1, ?)`).run(uuid(), bldId, adminId);
console.log('Payment rule created');

db.close();
console.log('\n✅ Full seed complete! Building: מגדלי הים התיכון, 10 floors, 38 apartments, invite code: SEA2026');
