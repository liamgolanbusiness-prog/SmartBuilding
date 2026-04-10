/* VaadApp — modern mobile-first SPA */
const API = '';
const $ = (id) => document.getElementById(id);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const store = {
  get token() { return localStorage.getItem('vaad_token'); },
  set token(v) { v ? localStorage.setItem('vaad_token', v) : localStorage.removeItem('vaad_token'); },
  get user() { try { return JSON.parse(localStorage.getItem('vaad_user') || 'null'); } catch { return null; } },
  set user(v) { v ? localStorage.setItem('vaad_user', JSON.stringify(v)) : localStorage.removeItem('vaad_user'); },
  get theme() { return localStorage.getItem('vaad_theme') || 'light'; },
  set theme(v) { localStorage.setItem('vaad_theme', v); },
  get lang() { return localStorage.getItem('vaad_lang') || 'he'; },
  set lang(v) { localStorage.setItem('vaad_lang', v); },
};

// ---------------- i18n ----------------
const I18N = {
  he: {
    // Stage (desktop marketing)
    'stage.sub': 'ועד בית · ניהול בניין',
    'stage.tagline': 'כל מה שהוועד של הבניין שלך צריך — הודעות, קריאות שירות, תשלומים ודיירים — באפליקציה אחת יפה ונוחה.',
    'stage.marquee': 'עברית 🇮🇱 ואנגלית 🇺🇸 · מצב כהה · תמיכה מלאה ב‑RTL · מותאם לנייד',
    'stage.f1.title': 'הודעות', 'stage.f1.sub': 'הצמדה, קטגוריות, התראות בעברית ובאנגלית',
    'stage.f2.title': 'קריאות שירות', 'stage.f2.sub': 'מעקב מפתיחה ועד סגירה',
    'stage.f3.title': 'תשלומים', 'stage.f3.sub': 'יתרה, חיובים והיסטוריה',
    'stage.f4.title': 'מדריך דיירים', 'stage.f4.sub': 'איתור שכנים לפי דירה',
    'stage.seed.title': '🔑 משתמשי בדיקה (ה‑OTP מודפס לקונסול של השרת)',
    'stage.seed.admin': 'מנהל ועד', 'stage.seed.member': 'חבר ועד', 'stage.seed.resident': 'דייר',
    'stage.seed.tip': 'טיפ: לחצו על משתמש כדי למלא את הטלפון אוטומטית. כפתור שפה בפרופיל.',
    'stage.btn.theme': '🌗 מצב', 'stage.btn.fullscreen': 'מסך מלא', 'stage.btn.lang': '🌐 English',
    // Login
    'login.sub': 'הבניין שלך, בכיס שלך',
    'login.phoneLabel': 'מספר טלפון',
    'login.sendCode': 'שלח קוד אימות',
    'login.otpLabel': 'הזינו את הקוד בן 6 הספרות',
    'login.otpHint': 'הקוד מודפס בקונסול של השרת',
    'login.resend': 'שלח מחדש',
    'login.verify': 'אמת והמשך',
    'login.changePhone': '← שינוי מספר טלפון',
    'login.trust': 'מאובטח · ללא סיסמאות · הצפנה מקצה לקצה',
    'login.codeSent': 'הקוד נשלח · בדוק את הקונסול',
    'login.enterPhone': 'הזינו מספר טלפון',
    'login.enter6': 'הזינו את הקוד בן 6 הספרות',
    // Greetings
    'greet.morning': 'בוקר טוב',
    'greet.afternoon': 'צהריים טובים',
    'greet.evening': 'ערב טוב',
    // Tabs
    'tab.home': 'בית', 'tab.news': 'חדשות', 'tab.tickets': 'קריאות', 'tab.pay': 'תשלום', 'tab.me': 'אני',
    // Nav
    'nav.announcements': 'הודעות', 'nav.tickets': 'קריאות', 'nav.payments': 'תשלומים', 'nav.residents': 'דיירים', 'nav.profile': 'פרופיל',
    // Home
    'home.notifTitle': 'התראות',
    'home.stat.residents': 'דיירים', 'home.stat.apts': 'דירות', 'home.stat.open': 'קריאות פתוחות',
    'home.quick': 'פעולות מהירות',
    'home.qa.report': 'דווח על תקלה', 'home.qa.announce': 'פרסם הודעה', 'home.qa.pay': 'תשלום דמי ועד', 'home.qa.directory': 'מדריך דיירים',
    'home.insights': 'נתוני ועד',
    'home.ins.collected': 'נגבה החודש', 'home.ins.pending': 'ממתין', 'home.ins.rate': 'אחוז גבייה', 'home.ins.resolved': 'קריאות שנסגרו',
    'home.balance': 'היתרה שלך',
    'home.currentBalance': 'יתרה נוכחית',
    'home.paidThisYear': 'שולם השנה',
    'home.payActivity': 'פעילות תשלומים',
    'home.last6': '6 חודשים אחרונים',
    'home.latestAnn': 'הודעות אחרונות',
    'home.recentTic': 'קריאות אחרונות',
    'home.allCaught': 'הכל מסודר! 🎉',
    'home.outstanding': 'חיובים פתוחים',
    // Common
    'common.seeAll': 'ראה הכל →',
    'common.cancel': 'ביטול',
    'common.by': 'מאת',
    'common.author': 'דווח על ידי',
    'common.apartment': 'דירה',
    'common.location': 'מיקום',
    'common.created': 'נוצר',
    'common.unknown': '—',
    'common.justNow': 'זה עתה',
    'common.minAgo': 'לפני {n} דקות',
    'common.hourAgo': 'לפני {n} שעות',
    'common.dayAgo': 'לפני {n} ימים',
    'common.refreshed': 'רוענן ✓',
    // Filters / categories / statuses
    'filter.all': 'הכל',
    'cat.general': '📄 כללי', 'cat.maintenance': '🔧 תחזוקה', 'cat.urgent': '🚨 דחוף', 'cat.event': '🎉 אירועים',
    'catName.general': 'כללי', 'catName.maintenance': 'תחזוקה', 'catName.urgent': 'דחוף', 'catName.event': 'אירוע',
    'status.open': '● פתוח', 'status.in_progress': '⟳ בטיפול', 'status.resolved': '✓ נסגר',
    'status.pending': '⏳ ממתין', 'status.paid': '✓ שולם', 'status.overdue': 'באיחור',
    'statusName.open': 'פתוח', 'statusName.in_progress': 'בטיפול', 'statusName.resolved': 'נסגר',
    'statusName.pending': 'ממתין', 'statusName.paid': 'שולם', 'statusName.overdue': 'באיחור',
    'prio.low': '🟢 נמוך', 'prio.normal': '🟡 רגיל', 'prio.high': '🟠 גבוה', 'prio.urgent': '🔴 דחוף',
    'prioName.low': 'נמוך', 'prioName.normal': 'רגיל', 'prioName.high': 'גבוה', 'prioName.urgent': 'דחוף',
    'ticCat.elevator': '🛗 מעלית', 'ticCat.plumbing': '🚿 אינסטלציה', 'ticCat.electrical': '💡 חשמל', 'ticCat.cleaning': '🧹 ניקיון', 'ticCat.other': '📦 אחר',
    'ticCatName.elevator': 'מעלית', 'ticCatName.plumbing': 'אינסטלציה', 'ticCatName.electrical': 'חשמל', 'ticCatName.cleaning': 'ניקיון', 'ticCatName.other': 'אחר',
    // Roles
    'role.vaad_admin': 'מנהל ועד', 'role.vaad_member': 'חבר ועד', 'role.treasurer': 'גזבר', 'role.resident': 'דייר',
    // Announcements
    'ann.new': 'הודעה חדשה',
    'ann.titlePh': 'כותרת',
    'ann.contentPh': 'מה תרצו לפרסם?',
    'ann.publish': 'פרסם',
    'ann.createdOk': 'ההודעה פורסמה ✓',
    'ann.empty': 'אין הודעות בקטגוריה הזו',
    'ann.noneYet': 'אין הודעות עדיין',
    // Tickets
    'tic.new': 'דיווח על תקלה',
    'tic.titlePh': 'מה התקלה?',
    'tic.locPh': 'מיקום (לדוגמה: לובי קומה 3)',
    'tic.descPh': 'תיאור התקלה…',
    'tic.create': 'צור קריאה',
    'tic.createdOk': 'הקריאה נוצרה ✓',
    'tic.empty': 'אין קריאות בפילטר הזה',
    'tic.noneYet': 'אין קריאות עדיין',
    'tic.titleAndDesc': 'יש למלא כותרת ותיאור',
    'tic.annTitleAndContent': 'יש למלא כותרת ותוכן',
    // Ticket detail
    'ticDetail.title': 'קריאה',
    'ticDetail.description': 'תיאור',
    'ticDetail.reportedBy': 'דווח על ידי',
    'ticDetail.apartment': 'דירה',
    'ticDetail.location': 'מיקום',
    'ticDetail.created': 'נוצר',
    'ticDetail.updateStatus': 'עדכן סטטוס (הדגמה)',
    'ticDetail.btnOpen': '● פתוח',
    'ticDetail.btnInProgress': '⟳ בטיפול',
    'ticDetail.btnResolved': '✓ נסגר',
    'ticDetail.statusUpdated': 'הסטטוס עודכן (מקומית)',
    // Payments
    'pay.balance': 'יתרת ועד',
    'pay.nextDue': 'תשלום הבא',
    'pay.now': 'שלם עכשיו',
    'pay.soon': '💳 שער תשלומים בקרוב',
    'pay.allPaid': 'הכל שולם',
    'pay.empty': 'אין תשלומים',
    'pay.due': 'תאריך חיוב',
    'pay.paidOn': 'שולם ב‑',
    // Residents
    'res.searchPh': 'חיפוש לפי שם או מספר דירה',
    'res.empty': 'לא נמצאו דיירים',
    'res.apt': '🏠 דירה',
    // Profile
    'profile.language': 'שפה',
    'profile.chooseLang': 'בחרו שפה',
    'profile.prefs': 'העדפות',
    'profile.dark': '🌙 מצב כהה',
    'profile.notif': '🔔 התראות',
    'profile.email': '📧 התראות במייל',
    'profile.building': 'בניין',
    'profile.bldName': 'שם',
    'profile.bldAddr': 'כתובת',
    'profile.bldCode': 'קוד הזמנה',
    'profile.account': 'חשבון',
    'profile.about': 'ℹ️ אודות VaadApp',
    'profile.help': '❓ עזרה ותמיכה',
    'profile.share': '🔗 שתף קוד בניין',
    'profile.logout': '⎋ התנתק',
    'profile.version': 'VaadApp 1.0 · נבנה באהבה',
    'profile.loggedOut': 'התנתקת',
    'profile.darkOn': '🌙 מצב כהה', 'profile.darkOff': '☀️ מצב בהיר',
    'profile.langHe': '🇮🇱 השפה שונתה לעברית', 'profile.langEn': '🇺🇸 Language changed to English',
    'profile.notifOn': '🔔 התראות פעילות', 'profile.notifOff': '🔕 התראות מבוטלות',
    'profile.emailOn': 'התראות מייל פעילות', 'profile.emailOff': 'התראות מייל מבוטלות',
    'profile.copied': '📋 הועתק:',
    'profile.supportEmail': '✉️ דוא״ל: support@vaad-app.co.il',
    'profile.aboutToast': 'VaadApp · פלטפורמת ניהול בניין',
    // Notifications
    'notif.title': 'התראות',
    'notif.empty': 'הכל רגוע 🌙',
    'notif.announcement': 'הודעה',
    // Payments dashboard
    'payDash.rate': 'שיעור גבייה',
    'payDash.pendingCount': 'דיירים חייבים',
    'payDash.collectedMonth': 'נגבה החודש',
    'payDash.overdue': 'סכום באיחור',
    'payDash.progress': 'התקדמות גבייה החודש',
    'payDash.collected': 'נגבה',
    'payDash.awaiting': 'ממתין',
    'payDash.late': 'באיחור',
    'payDash.methods': 'פילוח אופן תשלום',
    'payDash.m.standing': 'הוראת קבע',
    'payDash.m.card': 'כרטיס אשראי',
    'payDash.m.bank': 'העברה בנקאית',
    'payDash.m.bit': 'ביט',
    'payDash.m.cash': 'מזומן',
    'payDash.debtors': 'דיירים שלא שילמו',
    'payDash.noDebtors': 'כל הדיירים שילמו החודש 🎉',
    'payDash.items': 'חיובים',
    'payDash.trend': 'מגמה ב‑6 חודשים',
    'payDash.paidVsPending': 'שולם מול ממתין',
    'payDash.allPayments': 'כל התשלומים',
    // Polls
    'poll.attach': '📊 צרף סקר להצבעה',
    'poll.questionPh': 'שאלת הסקר',
    'poll.optPh1': 'אפשרות 1',
    'poll.optPh2': 'אפשרות 2',
    'poll.optPh': 'אפשרות',
    'poll.addOption': '+ הוסף אפשרות',
    'poll.badge': 'סקר',
    'poll.votes': 'הצבעות',
    'poll.closes': 'נסגר',
    'poll.closed': 'סגור',
    'poll.youVoted': 'הצבעת ✓',
    'poll.voted': 'ההצבעה נרשמה ✓',
    'poll.needQAndTwo': 'צריך שאלה ולפחות 2 אפשרויות',
    'poll.max': 'מקסימום 6 אפשרויות',
    'poll.newPoll': 'סקר חדש להצבעה',
    'poll.reminder': 'תזכורת: טרם הצבעת בסקר',
    'poll.createdOk': 'הסקר פורסם ✓',
  },
  en: {
    'stage.sub': 'Va\'ad · Building Management',
    'stage.tagline': 'Everything your building\'s committee needs — announcements, tickets, payments, and residents — all in one beautiful mobile app.',
    'stage.marquee': 'Hebrew 🇮🇱 and English 🇺🇸 · Dark mode · Full RTL · Mobile-first',
    'stage.f1.title': 'Announcements', 'stage.f1.sub': 'Pin, categorize, notify in Hebrew & English',
    'stage.f2.title': 'Maintenance Tickets', 'stage.f2.sub': 'Track issues from open to resolved',
    'stage.f3.title': 'Payments', 'stage.f3.sub': 'See balance, dues and history',
    'stage.f4.title': 'Resident Directory', 'stage.f4.sub': 'Find neighbors by apartment',
    'stage.seed.title': '🔑 Seeded test users (OTP printed to server console)',
    'stage.seed.admin': 'Va\'ad Admin', 'stage.seed.member': 'Va\'ad Member', 'stage.seed.resident': 'Resident',
    'stage.seed.tip': 'Tip: click a user to autofill. Language toggle in the profile tab.',
    'stage.btn.theme': '🌗 Theme', 'stage.btn.fullscreen': 'Fullscreen', 'stage.btn.lang': '🌐 עברית',
    'login.sub': 'Your building, in your pocket',
    'login.phoneLabel': 'Phone number',
    'login.sendCode': 'Send verification code',
    'login.otpLabel': 'Enter the 6-digit code',
    'login.otpHint': 'Check the backend console for the code',
    'login.resend': 'Resend',
    'login.verify': 'Verify & Continue',
    'login.changePhone': '← Change phone number',
    'login.trust': 'Secure · End-to-end · No passwords',
    'login.codeSent': 'Code sent · check server console',
    'login.enterPhone': 'Enter a phone number',
    'login.enter6': 'Enter the 6-digit code',
    'greet.morning': 'Good morning',
    'greet.afternoon': 'Good afternoon',
    'greet.evening': 'Good evening',
    'tab.home': 'Home', 'tab.news': 'News', 'tab.tickets': 'Tickets', 'tab.pay': 'Pay', 'tab.me': 'Me',
    'nav.announcements': 'Announcements', 'nav.tickets': 'Tickets', 'nav.payments': 'Payments', 'nav.residents': 'Residents', 'nav.profile': 'Profile',
    'home.notifTitle': 'Notifications',
    'home.stat.residents': 'Residents', 'home.stat.apts': 'Apartments', 'home.stat.open': 'Open Tickets',
    'home.quick': 'Quick actions',
    'home.qa.report': 'Report issue', 'home.qa.announce': 'Announce', 'home.qa.pay': 'Pay dues', 'home.qa.directory': 'Directory',
    'home.insights': 'Committee insights',
    'home.ins.collected': 'Collected this month', 'home.ins.pending': 'Pending', 'home.ins.rate': 'Collection rate', 'home.ins.resolved': 'Tickets resolved',
    'home.balance': 'Your balance',
    'home.currentBalance': 'Current balance',
    'home.paidThisYear': 'Paid this year',
    'home.payActivity': 'Payment activity',
    'home.last6': 'Last 6 months',
    'home.latestAnn': 'Latest announcements',
    'home.recentTic': 'Recent tickets',
    'home.allCaught': 'All caught up! 🎉',
    'home.outstanding': 'outstanding items',
    'common.seeAll': 'See all →',
    'common.cancel': 'Cancel',
    'common.by': 'By',
    'common.author': 'Reported by',
    'common.apartment': 'Apt',
    'common.location': 'Location',
    'common.created': 'Created',
    'common.unknown': '—',
    'common.justNow': 'just now',
    'common.minAgo': '{n}m ago',
    'common.hourAgo': '{n}h ago',
    'common.dayAgo': '{n}d ago',
    'common.refreshed': 'Refreshed ✓',
    'filter.all': 'All',
    'cat.general': '📄 General', 'cat.maintenance': '🔧 Maintenance', 'cat.urgent': '🚨 Urgent', 'cat.event': '🎉 Events',
    'catName.general': 'general', 'catName.maintenance': 'maintenance', 'catName.urgent': 'urgent', 'catName.event': 'event',
    'status.open': '● Open', 'status.in_progress': '⟳ In progress', 'status.resolved': '✓ Resolved',
    'status.pending': '⏳ Pending', 'status.paid': '✓ Paid', 'status.overdue': 'Overdue',
    'statusName.open': 'open', 'statusName.in_progress': 'in progress', 'statusName.resolved': 'resolved',
    'statusName.pending': 'pending', 'statusName.paid': 'paid', 'statusName.overdue': 'overdue',
    'prio.low': '🟢 Low', 'prio.normal': '🟡 Normal', 'prio.high': '🟠 High', 'prio.urgent': '🔴 Urgent',
    'prioName.low': 'low', 'prioName.normal': 'normal', 'prioName.high': 'high', 'prioName.urgent': 'urgent',
    'ticCat.elevator': '🛗 Elevator', 'ticCat.plumbing': '🚿 Plumbing', 'ticCat.electrical': '💡 Electrical', 'ticCat.cleaning': '🧹 Cleaning', 'ticCat.other': '📦 Other',
    'ticCatName.elevator': 'elevator', 'ticCatName.plumbing': 'plumbing', 'ticCatName.electrical': 'electrical', 'ticCatName.cleaning': 'cleaning', 'ticCatName.other': 'other',
    'role.vaad_admin': 'admin', 'role.vaad_member': 'committee', 'role.treasurer': 'treasurer', 'role.resident': 'resident',
    'ann.new': 'New announcement',
    'ann.titlePh': 'Title',
    'ann.contentPh': 'What do you want to announce?',
    'ann.publish': 'Publish',
    'ann.createdOk': 'Announcement published ✓',
    'ann.empty': 'No announcements in this category',
    'ann.noneYet': 'No announcements yet',
    'tic.new': 'Report an issue',
    'tic.titlePh': 'What\'s wrong?',
    'tic.locPh': 'Location (e.g. 3rd floor hall)',
    'tic.descPh': 'Describe the issue…',
    'tic.create': 'Create ticket',
    'tic.createdOk': 'Ticket created ✓',
    'tic.empty': 'No tickets match this filter',
    'tic.noneYet': 'No tickets yet',
    'tic.titleAndDesc': 'Title and description required',
    'tic.annTitleAndContent': 'Title and content required',
    'ticDetail.title': 'Ticket',
    'ticDetail.description': 'Description',
    'ticDetail.reportedBy': 'Reported by',
    'ticDetail.apartment': 'Apartment',
    'ticDetail.location': 'Location',
    'ticDetail.created': 'Created',
    'ticDetail.updateStatus': 'Update status (demo)',
    'ticDetail.btnOpen': '● Open',
    'ticDetail.btnInProgress': '⟳ Working',
    'ticDetail.btnResolved': '✓ Resolved',
    'ticDetail.statusUpdated': 'Status updated (local)',
    'pay.balance': 'Vaad Balance',
    'pay.nextDue': 'Next due',
    'pay.now': 'Pay now',
    'pay.soon': '💳 Payment gateway coming soon',
    'pay.allPaid': 'All paid',
    'pay.empty': 'No payments',
    'pay.due': 'Due',
    'pay.paidOn': 'Paid',
    'res.searchPh': 'Search by name or apartment',
    'res.empty': 'No residents found',
    'res.apt': '🏠 Apt',
    'profile.language': 'Language',
    'profile.chooseLang': 'Choose language',
    'profile.prefs': 'Preferences',
    'profile.dark': '🌙 Dark mode',
    'profile.notif': '🔔 Notifications',
    'profile.email': '📧 Email alerts',
    'profile.building': 'Building',
    'profile.bldName': 'Name',
    'profile.bldAddr': 'Address',
    'profile.bldCode': 'Invite code',
    'profile.account': 'Account',
    'profile.about': 'ℹ️ About VaadApp',
    'profile.help': '❓ Help & support',
    'profile.share': '🔗 Share building code',
    'profile.logout': '⎋ Log out',
    'profile.version': 'VaadApp v1.0 · Built with ♥',
    'profile.loggedOut': 'Signed out',
    'profile.darkOn': '🌙 Dark mode', 'profile.darkOff': '☀️ Light mode',
    'profile.langHe': '🇮🇱 השפה שונתה לעברית', 'profile.langEn': '🇺🇸 Language changed to English',
    'profile.notifOn': '🔔 On', 'profile.notifOff': '🔕 Off',
    'profile.emailOn': 'Email alerts on', 'profile.emailOff': 'Email alerts off',
    'profile.copied': '📋 Copied:',
    'profile.supportEmail': '✉️ Email: support@vaad-app.co.il',
    'profile.aboutToast': 'VaadApp · Building management platform',
    'notif.title': 'Notifications',
    'notif.empty': 'All quiet 🌙',
    'notif.announcement': 'Announcement',
    // Payments dashboard
    'payDash.rate': 'Collection rate',
    'payDash.pendingCount': 'Debtors',
    'payDash.collectedMonth': 'Collected this month',
    'payDash.overdue': 'Overdue amount',
    'payDash.progress': 'Monthly collection progress',
    'payDash.collected': 'Collected',
    'payDash.awaiting': 'Awaiting',
    'payDash.late': 'Late',
    'payDash.methods': 'Payment methods',
    'payDash.m.standing': 'Standing order',
    'payDash.m.card': 'Credit card',
    'payDash.m.bank': 'Bank transfer',
    'payDash.m.bit': 'Bit',
    'payDash.m.cash': 'Cash',
    'payDash.debtors': 'Residents who haven\'t paid',
    'payDash.noDebtors': 'Everyone paid this month 🎉',
    'payDash.items': 'items',
    'payDash.trend': '6-month trend',
    'payDash.paidVsPending': 'Paid vs pending',
    'payDash.allPayments': 'All payments',
    // Polls
    'poll.attach': '📊 Attach a poll',
    'poll.questionPh': 'Poll question',
    'poll.optPh1': 'Option 1',
    'poll.optPh2': 'Option 2',
    'poll.optPh': 'Option',
    'poll.addOption': '+ Add option',
    'poll.badge': 'Poll',
    'poll.votes': 'votes',
    'poll.closes': 'closes',
    'poll.closed': 'Closed',
    'poll.youVoted': 'You voted ✓',
    'poll.voted': 'Vote recorded ✓',
    'poll.needQAndTwo': 'Question and 2+ options required',
    'poll.max': 'Max 6 options',
    'poll.newPoll': 'New poll to vote on',
    'poll.reminder': 'Reminder: you haven\'t voted yet',
    'poll.createdOk': 'Poll published ✓',
  },
};

function t(key, vars) {
  const dict = I18N[store.lang] || I18N.he;
  let s = dict[key];
  if (s == null) s = (I18N.en[key] != null ? I18N.en[key] : key);
  if (vars) Object.keys(vars).forEach((k) => { s = s.replace('{' + k + '}', vars[k]); });
  return s;
}

function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder)); });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.setAttribute('title', t(el.dataset.i18nTitle)); });
}

// ---------------- API helper ----------------
async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (store.token) headers.Authorization = `Bearer ${store.token}`;
  const res = await fetch(API + path, { ...opts, headers });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
  return data;
}

// ---------------- Web push-style notifications ----------------
let notifPermReq = false;
async function ensureNotifPerm() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  if (notifPermReq) return false;
  notifPermReq = true;
  try { const r = await Notification.requestPermission(); return r === 'granted'; }
  catch { return false; }
}
async function sendLocalNotification(title, body) {
  try {
    const ok = await ensureNotifPerm();
    if (ok) {
      new Notification(title, { body, icon: '/favicon.ico', tag: 'vaad-' + Date.now() });
    }
  } catch {}
  // Always show in-app toast as fallback
  toast('🔔 ' + title);
}

// Check for new polls / 24h reminders. Uses localStorage to track last-seen
// and reminder state so we don't spam the user.
function checkPollNotifications() {
  const polls = appState.polls || [];
  const now = Date.now();

  // 1) New polls since last check (inform immediately)
  const lastSeen = Number(localStorage.getItem('vaad_polls_last_seen') || 0);
  const fresh = polls.filter((p) => {
    const created = new Date(String(p.created_at).replace(' ', 'T') + 'Z').getTime();
    return created > lastSeen && p.my_vote == null && !p.closed;
  });
  fresh.forEach((p) => sendLocalNotification(t('poll.newPoll'), p.question));
  localStorage.setItem('vaad_polls_last_seen', String(now));

  // 2) 24h-old polls the user hasn't voted on yet → reminder (once)
  const remindedKey = 'vaad_polls_reminded';
  const reminded = JSON.parse(localStorage.getItem(remindedKey) || '{}');
  let changed = false;
  polls.forEach((p) => {
    if (p.closed || p.my_vote != null) return;
    const created = new Date(String(p.created_at).replace(' ', 'T') + 'Z').getTime();
    const ageHours = (now - created) / (1000 * 60 * 60);
    if (ageHours >= 24 && !reminded[p.id]) {
      sendLocalNotification(t('poll.reminder'), p.question);
      reminded[p.id] = now;
      changed = true;
    }
  });
  if (changed) localStorage.setItem(remindedKey, JSON.stringify(reminded));
}

// ---------------- Toast ----------------
let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
}

// ---------------- Helpers ----------------
function fmtDate(d) {
  if (!d) return '—';
  const date = new Date(String(d).replace(' ', 'T') + (String(d).endsWith('Z') ? '' : 'Z'));
  if (isNaN(+date)) return d;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
function fmtRelative(d) {
  if (!d) return '';
  const date = new Date(String(d).replace(' ', 'T') + (String(d).endsWith('Z') ? '' : 'Z'));
  const diff = (Date.now() - +date) / 1000;
  if (diff < 60) return t('common.justNow');
  if (diff < 3600) return t('common.minAgo', { n: Math.floor(diff / 60) });
  if (diff < 86400) return t('common.hourAgo', { n: Math.floor(diff / 3600) });
  if (diff < 604800) return t('common.dayAgo', { n: Math.floor(diff / 86400) });
  return fmtDate(d);
}
function hasHebrew(s) { return /[\u0590-\u05FF]/.test(s || ''); }
function dir(s) { return hasHebrew(s) ? 'rtl' : 'ltr'; }
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escapeAttr(s) { return escapeHtml(s).replace(/\s+/g, '-'); }
function initials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}
function fmtMoney(n, c = 'ILS') {
  const sym = c === 'ILS' ? '₪' : c === 'USD' ? '$' : c === 'EUR' ? '€' : '';
  return sym + Number(n || 0).toFixed(2);
}
function avatarColor(name) {
  const h = Array.from(String(name)).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return `linear-gradient(135deg, hsl(${h},70%,55%), hsl(${(h + 60) % 360},70%,55%))`;
}

function animateCount(el, to, { prefix = '', suffix = '', duration = 700, decimals = 0 } = {}) {
  if (!el) return;
  // Always set final value immediately so headless / hidden tabs show correct data
  const finalText = prefix + Number(to).toFixed(decimals) + suffix;
  el.textContent = finalText;
  // Animate only if the tab is visible and rAF works
  if (document.hidden) return;
  const from = 0;
  const start = performance.now();
  let rafOk = false;
  function frame(t) {
    rafOk = true;
    const p = Math.min(1, (t - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const v = from + (to - from) * eased;
    el.textContent = prefix + v.toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = finalText;
  }
  requestAnimationFrame(frame);
  // Safety: if rAF never fires within 100ms, ensure text stays at final
  setTimeout(() => { if (!rafOk) el.textContent = finalText; }, 100);
}

// ---------------- Theme / Language ----------------
function applyPrefs() {
  // Theme
  document.documentElement.setAttribute('data-theme', store.theme);
  const dark = $('toggle-dark'); if (dark) dark.checked = store.theme === 'dark';
  // Language + direction
  const lang = store.lang;
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
  document.title = lang === 'he' ? 'VaadApp — ניהול בניין' : 'VaadApp — Building Management';
  // Update segmented control
  document.querySelectorAll('#lang-seg button').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
  // Translate all static DOM
  applyI18n();
  // Re-render dynamic views so badges/cards localize
  if (typeof rerenderAll === 'function') rerenderAll();
}
// Back-compat alias
const applyTheme = applyPrefs;

// ---------------- Routing ----------------
const views = ['login', 'home', 'announcements', 'tickets', 'payments', 'residents', 'profile', 'ticket-detail'];
const tabRoutes = ['home', 'announcements', 'tickets', 'payments', 'profile'];
let currentRoute = 'login';
let navStack = [];

function show(route, opts = {}) {
  if (!opts.back) navStack.push(currentRoute);
  currentRoute = route;
  views.forEach((v) => $('view-' + v)?.classList.add('hidden'));
  $('view-' + route)?.classList.remove('hidden');

  const tabbar = $('tabbar');
  if (route === 'login') {
    tabbar.classList.add('hidden');
  } else {
    tabbar.classList.remove('hidden');
    $$('.tab').forEach((tab) => {
      const isActive = tab.dataset.nav === route || (route === 'ticket-detail' && tab.dataset.nav === 'tickets');
      tab.classList.toggle('active', isActive);
    });
  }
  $('app-scroll').scrollTop = 0;

  // Load data lazily
  if (route === 'home') loadHome();
  if (route === 'announcements') loadAnnouncements();
  if (route === 'tickets') loadTickets();
  if (route === 'payments') loadPayments();
  if (route === 'residents') loadResidents();
  if (route === 'profile') loadProfile();
}

function back() {
  const prev = navStack.pop();
  if (prev) show(prev, { back: true });
  else show('home', { back: true });
}

// Wire tab bar + back buttons + quick actions
document.addEventListener('click', (e) => {
  const navEl = e.target.closest('[data-nav]');
  if (navEl) {
    e.preventDefault();
    const target = navEl.dataset.nav;
    if (target === 'directory') return show('residents');
    return show(target);
  }
  if (e.target.closest('[data-back]')) { e.preventDefault(); return back(); }
  const qa = e.target.closest('[data-qa]');
  if (qa) {
    const action = qa.dataset.qa;
    if (action === 'new-ticket') { show('tickets'); setTimeout(() => $('new-ticket-form').classList.remove('hidden'), 200); }
    if (action === 'new-announcement') { show('announcements'); setTimeout(() => $('new-announcement-form').classList.remove('hidden'), 200); }
    if (action === 'pay') show('payments');
    if (action === 'directory') show('residents');
  }
});

// ---------------- Pull to refresh ----------------
(function () {
  let startY = 0, pulling = false, indicator;
  const scroller = () => $('app-scroll');
  scroller().addEventListener('touchstart', (e) => {
    if (scroller().scrollTop === 0) {
      startY = e.touches[0].clientY;
      pulling = true;
    }
  }, { passive: true });
  scroller().addEventListener('touchmove', (e) => {
    if (!pulling) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 40) {
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'ptr';
        indicator.textContent = '↻';
        scroller().prepend(indicator);
      }
      indicator.style.transform = `translateY(${Math.min(dy - 40, 40)}px) rotate(${dy * 3}deg)`;
    }
  }, { passive: true });
  scroller().addEventListener('touchend', async () => {
    if (pulling && indicator) {
      indicator.textContent = '…';
      const route = currentRoute;
      if (route === 'home') await loadHome();
      if (route === 'announcements') await loadAnnouncements();
      if (route === 'tickets') await loadTickets();
      if (route === 'payments') await loadPayments();
      if (route === 'residents') await loadResidents();
      toast(t('common.refreshed'));
      indicator.remove();
      indicator = null;
    }
    pulling = false;
  });
})();

// ---------------- Clock ----------------
function tickClock() {
  const d = new Date();
  const t = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?(AM|PM)/i, '');
  $('sb-time').textContent = t;
}
tickClock();
setInterval(tickClock, 30000);

// ---------------- Login flow ----------------
function showError(msg) {
  const el = $('login-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}
function clearError() { $('login-error').classList.add('hidden'); }

$('send-otp').addEventListener('click', async () => {
  clearError();
  let raw = $('phone').value.trim().replace(/\D/g, '');
  if (!raw) return showError(t('login.enterPhone'));
  if (raw.startsWith('0')) raw = raw.slice(1);
  const phoneNumber = raw.startsWith('972') ? '+' + raw : '+972' + raw;
  try {
    await api('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phoneNumber }) });
    $('step-phone').classList.add('hidden');
    $('step-otp').classList.remove('hidden');
    $$('.otp-input input')[0].focus();
    toast(t('login.codeSent'));
  } catch (e) { showError(e.message); }
});

$('resend-otp').addEventListener('click', async (e) => {
  e.preventDefault();
  $('send-otp').click();
});

$('back-phone').addEventListener('click', () => {
  $('step-otp').classList.add('hidden');
  $('step-phone').classList.remove('hidden');
  $$('.otp-input input').forEach((i) => (i.value = ''));
});

// OTP input auto-advance
$$('.otp-input input').forEach((inp, i, arr) => {
  inp.addEventListener('input', () => {
    inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
    if (inp.value && i < arr.length - 1) arr[i + 1].focus();
    if (arr.every((x) => x.value)) $('verify-otp').click();
  });
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !inp.value && i > 0) arr[i - 1].focus();
  });
  inp.addEventListener('paste', (e) => {
    const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    arr.forEach((x, j) => (x.value = pasted[j] || ''));
    if (arr.every((x) => x.value)) $('verify-otp').click();
  });
});

$('verify-otp').addEventListener('click', async () => {
  clearError();
  let raw = $('phone').value.trim().replace(/\D/g, '');
  if (raw.startsWith('0')) raw = raw.slice(1);
  const phoneNumber = raw.startsWith('972') ? '+' + raw : '+972' + raw;
  const code = $$('.otp-input input').map((i) => i.value).join('');
  if (code.length !== 6) return showError(t('login.enter6'));
  try {
    const res = await api('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, code, inviteCode: 'DEKEL2024' }),
    });
    store.token = res.accessToken;
    store.user = res.user;
    await enterDashboard();
  } catch (e) { showError(e.message); }
});

async function enterDashboard() {
  try {
    const me = await api('/api/residents/me');
    appState.me = me;
    show('home');
    ensureNotifPerm(); // ask once after login
  } catch (e) {
    console.error(e);
    store.token = null; store.user = null;
    show('login');
  }
}

// Seeded user autofill
document.querySelectorAll('.seed-hint li[data-phone]').forEach((li) => {
  li.addEventListener('click', () => {
    const p = (li.dataset.phone || '').replace(/^\+972/, '');
    $('phone').value = p;
    $('send-otp').click();
  });
});

// ---------------- App state ----------------
const appState = {
  me: null,
  announcements: [],
  tickets: [],
  payments: [],
  residents: [],
  announcementFilter: 'all',
  ticketFilter: 'all',
  paymentFilter: 'all',
  residentSearch: '',
};

// ---------------- Home ----------------
async function loadHome() {
  try {
    if (!appState.me) appState.me = await api('/api/residents/me');
    const me = appState.me;
    // Greeting
    const hr = new Date().getHours();
    const greetKey = hr < 12 ? 'greet.morning' : hr < 18 ? 'greet.afternoon' : 'greet.evening';
    $('greet-hi').textContent = t(greetKey) + ' 👋';
    $('greet-name').textContent = (me.user?.full_name || '').split(' ')[0] || '—';

    $('bc-name').textContent = me.building?.name || '—';
    $('bc-addr').textContent = `${me.building?.address || ''}, ${me.building?.city || ''}`;
    $('stat-apts').textContent = me.building?.total_apartments || '0';

    // Parallel fetch
    const [{ residents }, { announcements }, { tickets }, { payments }, pollsResp] = await Promise.all([
      api('/api/residents'),
      api('/api/announcements'),
      api('/api/tickets'),
      api('/api/payments'),
      api('/api/polls').catch(() => ({ polls: [] })),
    ]);
    appState.announcements = announcements;
    appState.tickets = tickets;
    appState.payments = payments;
    appState.residents = residents;
    appState.polls = pollsResp.polls || [];
    // Fire notifications for new/reminder polls
    checkPollNotifications();

    animateCount($('stat-residents'), residents.length);
    animateCount($('stat-apts'), me.building?.total_apartments || 0);
    const open = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
    animateCount($('stat-open'), open);
    $('bell-count').textContent = open;
    $('bell-count').dataset.n = open;

    // Balance
    const myId = me.user?.id;
    const mine = payments.filter((p) => !myId || p.resident_id === myId || p.full_name === me.user?.full_name);
    const pending = mine.filter((p) => p.status === 'pending' || p.status === 'overdue');
    const paid = mine.filter((p) => p.status === 'paid');
    const totalPending = pending.reduce((s, p) => s + Number(p.amount || 0), 0);
    const totalPaid = paid.reduce((s, p) => s + Number(p.amount || 0), 0);
    const totalAll = totalPending + totalPaid || 1;
    animateCount($('bal-amount'), totalPending, { prefix: '₪', decimals: 2 });
    $('bal-meta').textContent = pending.length ? `${pending.length} ${t('home.outstanding')}` : t('home.allCaught');
    $('bal-bar-fill').style.width = Math.round((totalPaid / totalAll) * 100) + '%';
    animateCount($('bal-paid'), totalPaid, { prefix: '₪', decimals: 2 });

    // Latest announcements (top 3)
    $('home-announcements').innerHTML = announcements.slice(0, 3).map(renderAnnouncement).join('') || `<div class="empty">${t('ann.noneYet')}</div>`;

    // Recent tickets (top 3)
    $('home-tickets').innerHTML = tickets.slice(0, 3).map(renderTicket).join('') || `<div class="empty">${t('tic.noneYet')}</div>`;

    // Payment activity chart (last 6 months)
    drawPaymentChart(payments);

    // Admin insights (vaad only)
    const role = me.user?.role;
    const isVaad = role === 'vaad_admin' || role === 'vaad_member' || role === 'treasurer';
    $('admin-insights').classList.toggle('hidden', !isVaad);
    if (isVaad) {
      const now = new Date();
      const thisMonth = payments.filter((p) => {
        const d = new Date(p.due_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const collected = thisMonth.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount || 0), 0);
      const pendingTotal = thisMonth.filter((p) => p.status === 'pending' || p.status === 'overdue').reduce((s, p) => s + Number(p.amount || 0), 0);
      const rate = thisMonth.length ? Math.round((thisMonth.filter((p) => p.status === 'paid').length / thisMonth.length) * 100) : 0;
      const resolved = tickets.filter((t) => t.status === 'resolved').length;
      animateCount($('ins-collected'), collected, { prefix: '₪', decimals: 0 });
      animateCount($('ins-pending'), pendingTotal, { prefix: '₪', decimals: 0 });
      animateCount($('ins-rate'), rate, { suffix: '%' });
      animateCount($('ins-resolved'), resolved);
    }
  } catch (e) {
    console.error(e);
    if (String(e.message).match(/401|token|auth/i)) { store.token = null; store.user = null; show('login'); }
  }
}

// ---------------- Payment chart ----------------
function drawPaymentChart(payments) {
  const svg = $('pay-chart');
  if (!svg) return;
  // Group by month (last 6)
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: d.toISOString().slice(0, 7), label: d.toLocaleDateString([], { month: 'short' }), paid: 0, pending: 0 });
  }
  payments.forEach((p) => {
    const d = new Date(p.due_date);
    const key = isNaN(+d) ? null : d.toISOString().slice(0, 7);
    const m = months.find((x) => x.key === key);
    if (!m) return;
    if (p.status === 'paid') m.paid += Number(p.amount || 0);
    else m.pending += Number(p.amount || 0);
  });
  const max = Math.max(1, ...months.map((m) => m.paid + m.pending));
  const W = 320, H = 140, padX = 20, padY = 20, innerW = W - padX * 2, innerH = H - padY * 2;
  const barW = innerW / months.length - 8;
  let out = '';
  months.forEach((m, i) => {
    const x = padX + i * (barW + 8) + 4;
    const totalH = ((m.paid + m.pending) / max) * innerH;
    const paidH = (m.paid / max) * innerH;
    const pendH = totalH - paidH;
    const yTop = padY + innerH - totalH;
    out += `<rect x="${x}" y="${yTop}" width="${barW}" height="${paidH}" rx="4" fill="url(#grad-ok)"/>`;
    out += `<rect x="${x}" y="${yTop + paidH}" width="${barW}" height="${pendH}" rx="4" fill="url(#grad-warn)"/>`;
    out += `<text x="${x + barW / 2}" y="${H - 4}" text-anchor="middle" font-size="10" font-weight="600" fill="#9aa3b2">${m.label}</text>`;
  });
  svg.innerHTML = `
    <defs>
      <linearGradient id="grad-ok" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#059669"/>
      </linearGradient>
      <linearGradient id="grad-warn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
    </defs>
    ${out}
  `;
}

// ---------------- Notifications panel ----------------
function buildNotifications() {
  const items = [];
  (appState.tickets || []).filter((tk) => tk.status === 'open' || tk.status === 'in_progress').slice(0, 5).forEach((tk) => {
    items.push({ icon: tk.priority === 'urgent' || tk.priority === 'high' ? '🚨' : '🔧', cls: tk.priority === 'urgent' ? 'urgent' : 'info', title: tk.title, sub: `${t('statusName.' + tk.status)} · ${fmtRelative(tk.created_at)}`, nav: 'tickets' });
  });
  (appState.announcements || []).filter((a) => a.is_pinned || a.category === 'urgent').slice(0, 3).forEach((a) => {
    items.push({ icon: a.category === 'urgent' ? '🚨' : '📌', cls: a.category === 'urgent' ? 'urgent' : 'ok', title: a.title, sub: `${t('notif.announcement')} · ${fmtRelative(a.published_at || a.created_at)}`, nav: 'announcements' });
  });
  (appState.tickets || []).filter((tk) => tk.status === 'open' || tk.status === 'in_progress').slice(0, 0); // noop placeholder
  const list = $('notif-list');
  list.innerHTML = items.length ? items.map((n) =>
    `<div class="notif-item" data-go="${n.nav}"><div class="dot ${n.cls}">${n.icon}</div><div><div class="n-title">${escapeHtml(n.title)}</div><div class="n-sub">${escapeHtml(n.sub)}</div></div></div>`
  ).join('') : `<div class="empty" style="margin:12px">${t('notif.empty')}</div>`;
  list.querySelectorAll('.notif-item').forEach((el) => el.addEventListener('click', () => {
    $('notif-panel').classList.add('hidden');
    show(el.dataset.go);
  }));
}

$('notif-close')?.addEventListener('click', () => $('notif-panel').classList.add('hidden'));

// ---------------- Announcements ----------------
function renderAnnouncement(a) {
  const icon = { urgent: '🚨', maintenance: '🔧', event: '🎉', general: '📄' }[a.category] || '📄';
  const catLabel = t('catName.' + (a.category || 'general'));
  // Find linked poll
  const poll = (appState.polls || []).find((p) => p.announcement_id === a.id);
  return `
    <div class="list-item ann-item ${a.is_pinned ? 'pinned' : ''}">
      <div class="item-head">
        <div class="item-title" dir="${dir(a.title)}">${a.is_pinned ? '📌 ' : ''}${icon} ${escapeHtml(a.title)}</div>
        <span class="badge cat-${escapeAttr(a.category || 'general')}">${escapeHtml(catLabel)}</span>
      </div>
      <div class="item-body" dir="${dir(a.content)}">${escapeHtml(a.content)}</div>
      ${poll ? renderPollCard(poll) : ''}
      <div class="item-meta">
        <span>👤 ${escapeHtml(a.author_name || t('common.unknown'))}</span>
        <span>🕐 ${fmtRelative(a.published_at || a.created_at)}</span>
      </div>
    </div>
  `;
}

function renderPollCard(poll) {
  const voted = poll.my_vote != null;
  const closed = !!poll.closed;
  const maxIdx = poll.totals.reduce((m, v, i, arr) => (v > arr[m] ? i : m), 0);
  return `
    <div class="poll-card ${voted ? 'poll-voted' : ''} ${closed ? 'poll-closed' : ''}" data-poll-id="${escapeAttr(poll.id)}">
      <div class="poll-q">
        <span class="poll-badge">${t('poll.badge')}</span>
        <span dir="${dir(poll.question)}">${escapeHtml(poll.question)}</span>
      </div>
      <div class="poll-options">
        ${poll.options.map((opt, idx) => {
          const pct = poll.total_votes ? Math.round((poll.totals[idx] / poll.total_votes) * 100) : 0;
          const mine = voted && poll.my_vote === idx;
          const leading = voted && idx === maxIdx && poll.totals[idx] > 0;
          return `
            <div class="poll-option ${mine ? 'mine' : ''} ${leading ? 'leading' : ''}" data-opt-idx="${idx}">
              <div class="po-fill" style="width:${voted ? pct : 0}%"></div>
              <span class="po-text" dir="${dir(opt)}">${escapeHtml(opt)}</span>
              ${voted ? `<span class="po-pct">${pct}%</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
      <div class="poll-meta">
        <span>🗳️ ${poll.total_votes} ${t('poll.votes')}</span>
        ${closed ? `<span>· ${t('poll.closed')}</span>` : (poll.expires_at ? `<span>· ${t('poll.closes')} ${fmtRelative(poll.expires_at)}</span>` : '')}
        ${voted ? `<span>· ${t('poll.youVoted')}</span>` : ''}
      </div>
    </div>
  `;
}

async function loadAnnouncements() {
  try {
    const [{ announcements }, { polls }] = await Promise.all([
      api('/api/announcements'),
      api('/api/polls').catch(() => ({ polls: [] })),
    ]);
    appState.announcements = announcements;
    appState.polls = polls || [];
    renderAnnouncementList();
    // Role visibility for + button
    const role = appState.me?.user?.role;
    const isVaad = role === 'vaad_admin' || role === 'vaad_member';
    $('new-announcement-btn').style.display = isVaad ? 'grid' : 'none';
    // Notification checks (new polls + overdue votes)
    checkPollNotifications();
  } catch (e) { console.error(e); }
}

function renderAnnouncementList() {
  const f = appState.announcementFilter;
  const filtered = appState.announcements.filter((a) => f === 'all' || a.category === f);
  const list = $('announcements-list');
  list.innerHTML = filtered.length ? filtered.map(renderAnnouncement).join('') : `<div class="empty">${t('ann.empty')}</div>`;
  // Wire poll votes
  list.querySelectorAll('.poll-card').forEach((card) => {
    const pollId = card.dataset.pollId;
    card.querySelectorAll('.poll-option').forEach((opt) => {
      opt.addEventListener('click', async (e) => {
        if (card.classList.contains('poll-closed')) return;
        const idx = Number(opt.dataset.optIdx);
        try {
          await api('/api/polls/' + pollId + '/vote', { method: 'POST', body: JSON.stringify({ option_index: idx }) });
          toast(t('poll.voted'));
          await loadAnnouncements();
        } catch (err) { toast(err.message); }
      });
    });
  });
}

$$('#ann-chips .chip').forEach((c) =>
  c.addEventListener('click', () => {
    $$('#ann-chips .chip').forEach((x) => x.classList.remove('active'));
    c.classList.add('active');
    appState.announcementFilter = c.dataset.filter;
    renderAnnouncementList();
  })
);

$('new-announcement-btn').addEventListener('click', () => $('new-announcement-form').classList.toggle('hidden'));
$('ann-cancel').addEventListener('click', () => $('new-announcement-form').classList.add('hidden'));

// Poll fields toggle + add option
$('ann-is-poll')?.addEventListener('change', (e) => {
  $('poll-fields').classList.toggle('hidden', !e.target.checked);
});
$('poll-add-opt')?.addEventListener('click', () => {
  const wrap = $('poll-options-wrap');
  if (wrap.children.length >= 6) return toast(t('poll.max'));
  const input = document.createElement('input');
  input.className = 'poll-opt';
  input.placeholder = t('poll.optPh') + ' ' + (wrap.children.length + 1);
  wrap.appendChild(input);
});

$('ann-submit').addEventListener('click', async () => {
  const title = $('ann-title').value.trim();
  const content = $('ann-content').value.trim();
  const category = $('ann-category').value;
  if (!title || !content) return toast(t('tic.annTitleAndContent'));

  // Poll data?
  const isPoll = $('ann-is-poll')?.checked;
  let pollData = null;
  if (isPoll) {
    const question = $('poll-question').value.trim();
    const options = Array.from(document.querySelectorAll('#poll-options-wrap .poll-opt')).map((i) => i.value.trim()).filter(Boolean);
    if (!question || options.length < 2) return toast(t('poll.needQAndTwo'));
    pollData = { question, options };
  }

  try {
    // 1) Create announcement
    await api('/api/announcements', { method: 'POST', body: JSON.stringify({ title, content, category }) });

    // 2) Find newly-created announcement id to link the poll (best-effort)
    let annId = null;
    if (pollData) {
      const { announcements } = await api('/api/announcements');
      const matching = announcements.find((a) => a.title === title && a.content === content);
      annId = matching?.id || null;
      await api('/api/polls', { method: 'POST', body: JSON.stringify({ ...pollData, announcement_id: annId }) });
    }

    // 3) Local push-style notification
    sendLocalNotification(title, pollData ? (t('poll.newPoll') + ' · ' + pollData.question) : content);

    // Reset form
    $('ann-title').value = ''; $('ann-content').value = '';
    $('ann-is-poll').checked = false;
    $('poll-fields').classList.add('hidden');
    $('poll-question').value = '';
    $$('#poll-options-wrap .poll-opt').forEach((i) => (i.value = ''));
    $('new-announcement-form').classList.add('hidden');
    await loadAnnouncements();
    toast(pollData ? t('poll.createdOk') : t('ann.createdOk'));
  } catch (e) { toast(e.message); }
});

// ---------------- Tickets ----------------
function renderTicket(tk) {
  const catIcon = { elevator: '🛗', plumbing: '🚿', electrical: '💡', cleaning: '🧹', other: '📦' }[tk.category] || '📦';
  const statusName = t('statusName.' + tk.status) || tk.status;
  const prioName = t('prioName.' + tk.priority) || tk.priority;
  return `
    <div class="list-item" data-ticket-id="${escapeAttr(tk.id)}">
      <div class="item-head">
        <div class="item-title" dir="${dir(tk.title)}">${catIcon} ${escapeHtml(tk.title)}</div>
        <div style="display:flex;gap:4px;flex-direction:column;align-items:flex-end">
          <span class="badge status-${escapeAttr(tk.status)}">${escapeHtml(statusName)}</span>
          <span class="badge prio-${escapeAttr(tk.priority)}">${escapeHtml(prioName)}</span>
        </div>
      </div>
      <div class="item-body" dir="${dir(tk.description)}">${escapeHtml(tk.description)}</div>
      <div class="item-meta">
        ${tk.location ? `<span>📍 ${escapeHtml(tk.location)}</span>` : ''}
        <span>👤 ${escapeHtml(tk.created_by_name || '—')} (${t('common.apartment')} ${escapeHtml(tk.apartment_number || '—')})</span>
        <span>🕐 ${fmtRelative(tk.created_at)}</span>
      </div>
    </div>
  `;
}

async function loadTickets() {
  try {
    const { tickets } = await api('/api/tickets');
    appState.tickets = tickets;
    renderTicketList();
  } catch (e) { console.error(e); }
}

function renderTicketList() {
  const f = appState.ticketFilter;
  const filtered = appState.tickets.filter((tk) => f === 'all' || tk.status === f);
  const list = $('tickets-list');
  list.innerHTML = filtered.length ? filtered.map(renderTicket).join('') : `<div class="empty">${t('tic.empty')}</div>`;
  // wire clicks
  $$('#tickets-list .list-item').forEach((el) => {
    el.addEventListener('click', () => openTicket(el.dataset.ticketId));
  });
}

$$('#tic-chips .chip').forEach((c) =>
  c.addEventListener('click', () => {
    $$('#tic-chips .chip').forEach((x) => x.classList.remove('active'));
    c.classList.add('active');
    appState.ticketFilter = c.dataset.filter;
    renderTicketList();
  })
);

$('new-ticket-btn').addEventListener('click', () => $('new-ticket-form').classList.toggle('hidden'));
$('tic-cancel').addEventListener('click', () => $('new-ticket-form').classList.add('hidden'));
$('tic-submit').addEventListener('click', async () => {
  const title = $('tic-title').value.trim();
  const description = $('tic-description').value.trim();
  const category = $('tic-category').value;
  const priority = $('tic-priority').value;
  const location = $('tic-location').value.trim();
  if (!title || !description) return toast(t('tic.titleAndDesc'));
  try {
    await api('/api/tickets', { method: 'POST', body: JSON.stringify({ title, description, category, priority, location }) });
    $('tic-title').value = ''; $('tic-description').value = ''; $('tic-location').value = '';
    $('new-ticket-form').classList.add('hidden');
    await loadTickets();
    toast(t('tic.createdOk'));
  } catch (e) { toast(e.message); }
});

function openTicket(id) {
  const tk = appState.tickets.find((x) => x.id === id);
  if (!tk) return;
  appState.openTicketId = id;
  const catIcon = { elevator: '🛗', plumbing: '🚿', electrical: '💡', cleaning: '🧹', other: '📦' }[tk.category] || '📦';
  const statusName = t('statusName.' + tk.status) || tk.status;
  const prioName = t('prioName.' + tk.priority) || tk.priority;
  const catName = t('ticCatName.' + tk.category) || tk.category;
  $('ticket-detail-body').innerHTML = `
    <div class="td-title" dir="${dir(tk.title)}">${catIcon} ${escapeHtml(tk.title)}</div>
    <div class="td-badges">
      <span class="badge status-${escapeAttr(tk.status)}">${escapeHtml(statusName)}</span>
      <span class="badge prio-${escapeAttr(tk.priority)}">${escapeHtml(prioName)}</span>
      <span class="badge cat-general">${escapeHtml(catName)}</span>
    </div>
    <div class="td-card">
      <h4>${t('ticDetail.description')}</h4>
      <p dir="${dir(tk.description)}">${escapeHtml(tk.description)}</p>
    </div>
    <div class="td-card">
      <div class="td-meta-grid">
        <div><small>${t('ticDetail.reportedBy')}</small><b>${escapeHtml(tk.created_by_name || '—')}</b></div>
        <div><small>${t('ticDetail.apartment')}</small><b>${escapeHtml(tk.apartment_number || '—')}</b></div>
        <div><small>${t('ticDetail.location')}</small><b>${escapeHtml(tk.location || '—')}</b></div>
        <div><small>${t('ticDetail.created')}</small><b>${fmtRelative(tk.created_at)}</b></div>
      </div>
    </div>
    <div class="td-card">
      <h4>${t('ticDetail.updateStatus')}</h4>
      <div class="td-actions">
        <button data-st="open" class="${tk.status === 'open' ? 'active' : ''}">${t('ticDetail.btnOpen')}</button>
        <button data-st="in_progress" class="${tk.status === 'in_progress' ? 'active' : ''}">${t('ticDetail.btnInProgress')}</button>
        <button data-st="resolved" class="${tk.status === 'resolved' ? 'active' : ''}">${t('ticDetail.btnResolved')}</button>
      </div>
    </div>
  `;
  $$('#ticket-detail-body .td-actions button').forEach((b) =>
    b.addEventListener('click', () => {
      const st = b.dataset.st;
      tk.status = st; // local-only demo update
      openTicket(id); // re-render with new status
      toast(t('ticDetail.statusUpdated'));
    })
  );
  show('ticket-detail');
}

// ---------------- Payments ----------------
function renderPayment(p) {
  const icon = { vaad_monthly: '🏢', utility: '💡', repair: '🔧', insurance: '🛡️', other: '📦' }[p.payment_type] || '💰';
  const statusName = t('statusName.' + p.status) || p.status;
  return `
    <div class="list-item payment-item">
      <div class="item-head">
        <div>
          <div class="item-title" dir="${dir(p.description)}">${icon} ${escapeHtml(p.description || p.payment_type)}</div>
          <div class="item-meta" style="margin-top:2px">
            ${escapeHtml(p.full_name || '—')} · ${t('common.apartment')} ${escapeHtml(p.apartment_number || '—')}
          </div>
        </div>
        <div style="text-align:right">
          <div class="amount">${fmtMoney(p.amount, p.currency)}</div>
          <span class="badge status-${escapeAttr(p.status)}">${escapeHtml(statusName)}</span>
        </div>
      </div>
      <div class="item-meta">
        <span>📅 ${t('pay.due')}: ${fmtDate(p.due_date)}</span>
        ${p.payment_date ? `<span>✓ ${t('pay.paidOn')}: ${fmtDate(p.payment_date)}</span>` : ''}
      </div>
    </div>
  `;
}

async function loadPayments() {
  try {
    const [{ payments }, residentsResp] = await Promise.all([
      api('/api/payments'),
      appState.residents?.length ? Promise.resolve({ residents: appState.residents }) : api('/api/residents'),
    ]);
    appState.payments = payments;
    appState.residents = residentsResp.residents;
    renderPaymentsDashboard();
    renderPaymentList();
  } catch (e) { console.error(e); }
}

function renderPaymentsDashboard() {
  const payments = appState.payments || [];
  const residents = appState.residents || [];

  // Hero balance
  const pending = payments.filter((p) => p.status === 'pending' || p.status === 'overdue');
  const paid = payments.filter((p) => p.status === 'paid');
  const totalPending = pending.reduce((s, p) => s + Number(p.amount || 0), 0);
  $('pay-amount').textContent = fmtMoney(totalPending);
  const next = [...pending].sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
  $('pay-due').textContent = next ? fmtDate(next.due_date) : t('pay.allPaid');

  // This month scope
  const now = new Date();
  const inThisMonth = (p) => {
    const d = new Date(p.due_date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };
  const thisMonth = payments.filter(inThisMonth);
  const mPaid = thisMonth.filter((p) => p.status === 'paid');
  const mPending = thisMonth.filter((p) => p.status === 'pending' || p.status === 'overdue');

  const paidAmt = mPaid.reduce((s, p) => s + Number(p.amount || 0), 0);
  const pendingAmt = mPending.reduce((s, p) => s + Number(p.amount || 0), 0);
  // Overdue = due_date < today and not paid
  const overdue = payments.filter((p) => (p.status === 'pending' || p.status === 'overdue') && new Date(p.due_date) < now);
  const overdueAmt = overdue.reduce((s, p) => s + Number(p.amount || 0), 0);
  const rate = thisMonth.length ? Math.round((mPaid.length / thisMonth.length) * 100) : 0;

  // Unique residents who have pending this month
  const debtorIds = new Set(mPending.map((p) => p.resident_id));

  // KPI numbers
  animateCount($('kpi-rate'), rate, { suffix: '%' });
  animateCount($('kpi-pending-count'), debtorIds.size);
  animateCount($('kpi-collected'), paidAmt, { prefix: '₪', decimals: 0 });
  animateCount($('kpi-overdue'), overdueAmt, { prefix: '₪', decimals: 0 });
  $('kpi-progress-label').textContent = `${mPaid.length}/${thisMonth.length}`;

  // Progress ring
  const C = 2 * Math.PI * 52; // 326.73
  const offset = C - (rate / 100) * C;
  const ringFg = $('pay-ring-fg');
  if (ringFg) ringFg.setAttribute('stroke-dashoffset', offset.toFixed(1));
  const ringText = $('pay-ring-text');
  if (ringText) ringText.textContent = rate + '%';
  $('ring-paid').textContent = fmtMoney(paidAmt);
  $('ring-waiting').textContent = fmtMoney(pendingAmt - overdueAmt < 0 ? 0 : pendingAmt - overdueAmt);
  $('ring-late').textContent = fmtMoney(overdueAmt);

  // Payment methods breakdown (synthesize from payment_type + id hash for variety)
  // Real-world: would come from a payments_methods field. Here we deterministically bucket.
  const methodBuckets = { standing_order: 0, credit_card: 0, bank_transfer: 0, bit: 0, cash: 0 };
  mPaid.forEach((p) => {
    const h = Array.from(String(p.id || '')).reduce((a, c) => a + c.charCodeAt(0), 0);
    const keys = Object.keys(methodBuckets);
    const weights = [5, 4, 3, 2, 1]; // standing order most common
    const total = weights.reduce((a, b) => a + b, 0);
    const pick = h % total;
    let acc = 0, chosen = 0;
    for (let i = 0; i < weights.length; i++) { acc += weights[i]; if (pick < acc) { chosen = i; break; } }
    methodBuckets[keys[chosen]] += Number(p.amount || 0);
  });
  const methodSum = Object.values(methodBuckets).reduce((a, b) => a + b, 0) || 1;
  const methodLabels = {
    standing_order: t('payDash.m.standing'),
    credit_card: t('payDash.m.card'),
    bank_transfer: t('payDash.m.bank'),
    bit: t('payDash.m.bit'),
    cash: t('payDash.m.cash'),
  };
  const methodIcons = { standing_order: '🏦', credit_card: '💳', bank_transfer: '🏧', bit: '📱', cash: '💵' };
  $('methods-bars').innerHTML = Object.entries(methodBuckets)
    .sort((a, b) => b[1] - a[1])
    .map(([key, val], i) => {
      const pct = Math.round((val / methodSum) * 100);
      return `
        <div class="method-row">
          <div class="mr-top">
            <b>${methodIcons[key]} ${escapeHtml(methodLabels[key])}</b>
            <span>${fmtMoney(val, 'ILS')} · ${pct}%</span>
          </div>
          <div class="mr-bar"><div class="m-color-${(i % 5) + 1}" style="width:${pct}%"></div></div>
        </div>
      `;
    }).join('');

  // Debtors list: residents with pending payments this month
  const residentById = {};
  residents.forEach((r) => (residentById[r.id] = r));
  // Also map by name fallback
  const debtorMap = {};
  mPending.forEach((p) => {
    const rid = p.resident_id;
    if (!debtorMap[rid]) {
      const r = residentById[rid];
      debtorMap[rid] = {
        id: rid,
        name: r?.full_name || p.full_name || '—',
        apt: r?.apartment_number || p.apartment_number || '—',
        amt: 0,
        count: 0,
      };
    }
    debtorMap[rid].amt += Number(p.amount || 0);
    debtorMap[rid].count += 1;
  });
  const debtors = Object.values(debtorMap).sort((a, b) => b.amt - a.amt);
  $('debtors-count').textContent = debtors.length;
  $('debtors-list').innerHTML = debtors.length
    ? debtors.map((d) => `
        <div class="debtor">
          <div class="avatar" style="background:${avatarColor(d.name)}">${initials(d.name)}</div>
          <div class="debtor-meta">
            <div class="debtor-name">${escapeHtml(d.name)}</div>
            <div class="debtor-sub">${t('common.apartment')} ${escapeHtml(d.apt)} · ${d.count} ${t('payDash.items')}</div>
          </div>
          <div class="debtor-amt">${fmtMoney(d.amt)}</div>
        </div>
      `).join('')
    : `<div class="empty">${t('payDash.noDebtors')}</div>`;

  // 6-month trend chart (reuse svg)
  drawTrendChart(payments);
}

function drawTrendChart(payments) {
  const svg = $('pay-trend-chart');
  if (!svg) return;
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: d.toISOString().slice(0, 7), label: d.toLocaleDateString([], { month: 'short' }), paid: 0, pending: 0 });
  }
  payments.forEach((p) => {
    const d = new Date(p.due_date);
    const key = isNaN(+d) ? null : d.toISOString().slice(0, 7);
    const m = months.find((x) => x.key === key);
    if (!m) return;
    if (p.status === 'paid') m.paid += Number(p.amount || 0);
    else m.pending += Number(p.amount || 0);
  });
  const max = Math.max(1, ...months.map((m) => m.paid + m.pending));
  const W = 320, H = 140, padX = 20, padY = 20, innerW = W - padX * 2, innerH = H - padY * 2;
  const barW = innerW / months.length - 8;
  let out = '';
  months.forEach((m, i) => {
    const x = padX + i * (barW + 8) + 4;
    const totalH = ((m.paid + m.pending) / max) * innerH;
    const paidH = (m.paid / max) * innerH;
    const pendH = totalH - paidH;
    const yTop = padY + innerH - totalH;
    out += `<rect x="${x}" y="${yTop}" width="${barW}" height="${paidH}" rx="4" fill="url(#grad-ok2)"/>`;
    out += `<rect x="${x}" y="${yTop + paidH}" width="${barW}" height="${pendH}" rx="4" fill="url(#grad-warn2)"/>`;
    out += `<text x="${x + barW / 2}" y="${H - 4}" text-anchor="middle" font-size="10" font-weight="600" fill="#9aa3b2">${m.label}</text>`;
  });
  svg.innerHTML = `
    <defs>
      <linearGradient id="grad-ok2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#059669"/>
      </linearGradient>
      <linearGradient id="grad-warn2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
    </defs>
    ${out}
  `;
}

function renderPaymentList() {
  const f = appState.paymentFilter;
  const filtered = appState.payments.filter((p) => f === 'all' || p.status === f);
  const list = $('payments-list');
  list.innerHTML = filtered.length ? filtered.map(renderPayment).join('') : `<div class="empty">${t('pay.empty')}</div>`;
}

$$('#pay-chips .chip').forEach((c) =>
  c.addEventListener('click', () => {
    $$('#pay-chips .chip').forEach((x) => x.classList.remove('active'));
    c.classList.add('active');
    appState.paymentFilter = c.dataset.filter;
    renderPaymentList();
  })
);

$('pay-now-btn').addEventListener('click', () => toast(t('pay.soon')));

// ---------------- Residents ----------------
function renderResident(r) {
  const roleName = t('role.' + (r.role || 'resident'));
  return `
    <div class="resident-card">
      <div class="avatar" style="background:${avatarColor(r.full_name)}">${initials(r.full_name)}</div>
      <div class="res-name" dir="${dir(r.full_name)}">${escapeHtml(r.full_name || '—')}</div>
      <div class="res-apt">${t('res.apt')} ${escapeHtml(r.apartment_number || '—')}</div>
      <span class="badge role-${escapeAttr(r.role || 'resident')}">${escapeHtml(roleName)}</span>
    </div>
  `;
}

async function loadResidents() {
  try {
    const { residents } = await api('/api/residents');
    appState.residents = residents;
    renderResidentList();
  } catch (e) { console.error(e); }
}

function renderResidentList() {
  const q = (appState.residentSearch || '').toLowerCase();
  const filtered = !q ? appState.residents : appState.residents.filter((r) => (r.full_name || '').toLowerCase().includes(q) || String(r.apartment_number || '').includes(q));
  const list = $('residents-list');
  list.innerHTML = filtered.length ? filtered.map(renderResident).join('') : `<div class="empty">${t('res.empty')}</div>`;
}

$('res-search').addEventListener('input', (e) => {
  appState.residentSearch = e.target.value;
  renderResidentList();
});

// ---------------- Profile ----------------
async function loadProfile() {
  try {
    if (!appState.me) appState.me = await api('/api/residents/me');
    const { user, building } = appState.me;
    $('profile-avatar').textContent = initials(user?.full_name);
    $('profile-avatar').style.background = avatarColor(user?.full_name);
    $('profile-name').textContent = user?.full_name || '—';
    $('profile-sub').textContent = user?.phone_number || '—';
    $('profile-role').textContent = t('role.' + (user?.role || 'resident'));
    $('profile-role').className = 'badge role-' + (user?.role || 'resident');
    $('profile-apt').textContent = t('common.apartment') + ' ' + (user?.apartment_number || '—');
    $('p-bld-name').textContent = building?.name || '—';
    $('p-bld-addr').textContent = (building?.address || '') + ', ' + (building?.city || '');
    $('p-bld-code').textContent = building?.invite_code || '—';
  } catch (e) { console.error(e); }
}

$('toggle-dark').addEventListener('change', (e) => {
  store.theme = e.target.checked ? 'dark' : 'light';
  applyPrefs();
  toast(t(e.target.checked ? 'profile.darkOn' : 'profile.darkOff'));
});
// Language segmented control
document.querySelectorAll('#lang-seg button').forEach((b) => {
  b.addEventListener('click', () => {
    store.lang = b.dataset.lang;
    applyPrefs();
    toast(t(store.lang === 'he' ? 'profile.langHe' : 'profile.langEn'));
  });
});
$('toggle-notif').addEventListener('change', (e) => toast(t(e.target.checked ? 'profile.notifOn' : 'profile.notifOff')));
$('toggle-email').addEventListener('change', (e) => toast(t(e.target.checked ? 'profile.emailOn' : 'profile.emailOff')));

$('logout-btn-profile').addEventListener('click', () => {
  store.token = null; store.user = null; appState.me = null;
  navStack = [];
  show('login');
  toast(t('profile.loggedOut'));
});

$('about-btn').addEventListener('click', () => toast(t('profile.aboutToast')));
$('help-btn')?.addEventListener('click', () => toast(t('profile.supportEmail')));
$('share-btn')?.addEventListener('click', async () => {
  const code = appState.me?.building?.invite_code || 'DEKEL2024';
  try {
    if (navigator.clipboard) await navigator.clipboard.writeText(code);
    toast(t('profile.copied') + ' ' + code);
  } catch {
    toast(code);
  }
});

// ---------------- Bell ----------------
$('bell-btn').addEventListener('click', () => {
  buildNotifications();
  $('notif-panel').classList.toggle('hidden');
});

// ---------------- Desktop stage actions ----------------
$('theme-toggle-outside').addEventListener('click', () => {
  store.theme = store.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
});
$('device-iphone').addEventListener('click', () => {
  $('stage').classList.remove('fullscreen');
  $('phone').style.width = '390px';
  $('screen').style.height = '812px';
});
$('device-pixel').addEventListener('click', () => {
  $('stage').classList.remove('fullscreen');
  $('phone').style.width = '412px';
  $('screen').style.height = '892px';
});
$('device-fullscreen').addEventListener('click', () => {
  $('stage').classList.toggle('fullscreen');
});
$('lang-toggle-outside')?.addEventListener('click', () => {
  store.lang = store.lang === 'he' ? 'en' : 'he';
  applyPrefs();
});

// Re-render dynamic views on language change
function rerenderAll() {
  try {
    if (appState.announcements?.length) renderAnnouncementList();
    if (appState.tickets?.length) renderTicketList();
    if (appState.payments?.length) renderPaymentList();
    if (appState.residents?.length) renderResidentList();
    if (appState.me) loadProfile();
    // Re-render home sections if data present
    if (appState.announcements && appState.tickets && currentRoute === 'home') {
      const hr = new Date().getHours();
      const greetKey = hr < 12 ? 'greet.morning' : hr < 18 ? 'greet.afternoon' : 'greet.evening';
      $('greet-hi').textContent = t(greetKey) + ' 👋';
      $('home-announcements').innerHTML = appState.announcements.slice(0, 3).map(renderAnnouncement).join('') || `<div class="empty">${t('ann.noneYet')}</div>`;
      $('home-tickets').innerHTML = appState.tickets.slice(0, 3).map(renderTicket).join('') || `<div class="empty">${t('tic.noneYet')}</div>`;
      // Rebuild balance meta
      const me = appState.me;
      const myId = me?.user?.id;
      const mine = appState.payments.filter((p) => !myId || p.resident_id === myId || p.full_name === me?.user?.full_name);
      const pending = mine.filter((p) => p.status === 'pending' || p.status === 'overdue');
      $('bal-meta').textContent = pending.length ? `${pending.length} ${t('home.outstanding')}` : t('home.allCaught');
    }
    // Re-render open ticket detail
    if (currentRoute === 'ticket-detail' && appState.openTicketId) openTicket(appState.openTicketId);
  } catch (e) { console.error('rerenderAll', e); }
}

// ---------------- Init ----------------
applyTheme();
if (store.token) {
  enterDashboard();
} else {
  show('login');
}
