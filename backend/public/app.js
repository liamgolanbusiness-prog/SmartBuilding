/* Lobbix — modern mobile-first SPA */
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
    'stage.sub': 'ועד שקוף. בניין רגוע.',
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
    'login.sub': 'ועד שקוף. בניין רגוע.',
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
    'profile.about': 'ℹ️ אודות Lobbix',
    'profile.help': '❓ עזרה ותמיכה',
    'profile.share': '🔗 שתף קוד בניין',
    'profile.logout': '⎋ התנתק',
    'profile.version': 'Lobbix 1.1 · נבנה באהבה בישראל 🇮🇱',
    'profile.loggedOut': 'התנתקת',
    'profile.darkOn': '🌙 מצב כהה', 'profile.darkOff': '☀️ מצב בהיר',
    'profile.langHe': '🇮🇱 השפה שונתה לעברית', 'profile.langEn': '🇺🇸 Language changed to English',
    'profile.notifOn': '🔔 התראות פעילות', 'profile.notifOff': '🔕 התראות מבוטלות',
    'profile.emailOn': 'התראות מייל פעילות', 'profile.emailOff': 'התראות מייל מבוטלות',
    'profile.copied': '📋 הועתק:',
    'profile.supportEmail': '✉️ דוא״ל: liam@lobbix.co.il',
    'profile.aboutToast': 'Lobbix · ועד שקוף. בניין רגוע.',
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
    // Super admin
    'profile.superAdmin': 'מנהל-על',
    'profile.manageBuildings': '👑 ניהול בניינים',
    'profile.switchUser': '🔄 החלפת משתמש (בדיקה)',
    'admin.title': 'ניהול בניינים',
    'admin.superAdmin': 'מנהל-על של המערכת',
    'admin.manageAll': 'נהל את כל הבניינים במערכת',
    'admin.newBuilding': 'בניין חדש',
    'admin.bldName': 'שם הבניין',
    'admin.bldAddress': 'כתובת',
    'admin.bldCity': 'עיר',
    'admin.totalApts': 'מספר דירות',
    'admin.totalFloors': 'מספר קומות',
    'admin.inviteCode': 'קוד הזמנה',
    'admin.firstAdmin': 'מנהל ראשון',
    'admin.adminName': 'שם המנהל',
    'admin.adminApt': 'מס׳ דירה',
    'admin.create': 'צור בניין',
    'admin.noBuildings': 'אין בניינים עדיין',
    'admin.needAllFields': 'יש למלא את כל השדות',
    'admin.noPhone': 'חסר מספר טלפון',
    'onboard.title': 'הבניין נוצר בהצלחה!',
    'onboard.sub': 'הנה הפרטים של המנהל החדש',
    'onboard.building': 'בניין',
    'onboard.inviteCode': 'קוד הזמנה',
    'onboard.adminName': 'שם המנהל',
    'onboard.adminPhone': 'טלפון',
    'onboard.tip': 'לחצו על הכפתור למטה כדי להיכנס לחשבון המנהל החדש ולראות את הבניין הריק מתחיל את דרכו.',
    'onboard.loginAs': 'היכנס בתור המנהל החדש',
    'onboard.backToAdmin': 'חזרה למסך ניהול',
    'onboard.welcomeNewBuilding': 'ברוך הבא לבניין החדש! 🎉',
    'switch.title': 'בחר משתמש לבדיקה',
    'switch.switched': 'הוחלפת למשתמש אחר',
    // Empty states
    'empty.firstAnnTitle': 'אין הודעות עדיין',
    'empty.firstAnnSub': 'פרסם את ההודעה הראשונה לדיירי הבניין',
    'empty.firstAnnCta': '+ הודעה ראשונה',
    'empty.firstTicTitle': 'אין קריאות פתוחות',
    'empty.firstTicSub': 'כשתהיה תקלה בבניין, דווח עליה כאן',
    'empty.firstTicCta': '+ דיווח ראשון',
    'empty.firstPayTitle': 'אין תשלומים',
    'empty.firstPaySub': 'מערכת התשלומים תוצג כאן ברגע שיהיה חיוב',
    'empty.firstResTitle': 'רק אתה כאן',
    'empty.firstResSub': 'שתף את קוד ההזמנה של הבניין כדי שדיירים יצטרפו',
    // Tour
    'tour.skip': 'דלג',
    'tour.next': 'הבא',
    'tour.finish': 'סיום',
    'tour.s1.t': 'ברוכים הבאים ל‑Lobbix 👋',
    'tour.s1.b': 'בואו נעשה סיור מהיר בתוך האפליקציה. תוכלו לדלג בכל שלב או לחזור על הסיור מאוחר יותר דרך הפרופיל.',
    'tour.s2.t': 'הבית – הדף הראשי',
    'tour.s2.b': 'כאן תראו את הבניין שלכם, יתרה, תשלומים, הודעות וקריאות אחרונות. זו נקודת הכניסה היומיומית שלכם.',
    'tour.s3.t': 'חדשות והודעות 📢',
    'tour.s3.b': 'קבלו הודעות מהוועד: הודעות חשובות, אירועים, תחזוקה וסקרים להצבעה. גוללים לפי קטגוריות.',
    'tour.s4.t': 'קריאות שירות 🔧',
    'tour.s4.b': 'דווחו על תקלות בבניין: מעלית, אינסטלציה, חשמל או ניקיון. עקבו אחר הטיפול מלידה ועד סגירה.',
    'tour.s5.t': 'תשלומים 💰',
    'tour.s5.b': 'ראו את היתרה שלכם, היסטוריית תשלומים, שיעור גבייה וגרף 6 חודשים. למנהלים יש גם דאשבורד מלא.',
    'tour.s6.t': 'דיירים 👥',
    'tour.s6.b': 'היכרות עם השכנים לפי מספר דירה. תוכלו לחפש, להזמין דיירים חדשים ולראות מי חבר בוועד.',
    'tour.s7.t': 'מוכנים לצאת לדרך! 🎉',
    'tour.s7.b': 'חוזרים לדף הבית. אם אתם מנהלי ועד, היכנסו ל"אני" → "כלי ועד" לניהול חוקי תשלום, הוצאות ותחזוקה.',
    // Invite
    'res.invite': 'הזמנת דיירים',
    'invite.title': 'הזמנת דיירים חדשים',
    'invite.sub': 'שתפו את קוד ההזמנה של הבניין',
    'invite.code': 'קוד ההזמנה',
    'invite.copy': '📋 העתק קוד',
    'invite.share': '🔗 שתף',
    'invite.copied': 'הועתק:',
    'invite.shareMsg': 'הצטרפו לבניין {bld} ב‑Lobbix עם קוד ההזמנה: {code}\nhttps://lobbix.co.il',
    'invite.step1': 'שלחו את הקוד לדייר',
    'invite.step2': 'הדייר מתקין את האפליקציה',
    'invite.step3': 'נכנס עם מספר הטלפון + קוד ההזמנה',
    // Login
    'login.or': 'או',
    'login.google': 'המשך עם Google',
    'google.title': 'כניסה עם Google (הדגמה)',
    'google.sub': 'מצב פיתוח — מלאו את הפרטים וקוד הבניין',
    'google.name': 'שם מלא',
    'google.email': 'אימייל',
    'google.invite': 'קוד הזמנה של הבניין',
    'google.continue': 'המשך',
    // Profile
    'profile.vaadTools': 'כלי ועד',
    'profile.openMgmt': '💼 ניהול ועד (חוקי תשלום, הוצאות, תחזוקה)',
    'tab.management': 'ניהול',
    'mgmt.approvals': 'בקשות הצטרפות',
    'approvals.emptyTitle': 'אין בקשות ממתינות',
    'approvals.emptySub': 'כשמישהו מצטרף באמצעות קוד ההזמנה הוא יופיע כאן לאישור.',
    'approvals.unnamed': 'ללא שם',
    'approvals.namePh': 'שם מלא',
    'approvals.aptPh': 'דירה',
    'approvals.floorPh': 'קומה',
    'approvals.approve': 'אישור',
    'approvals.reject': 'דחייה',
    'approvals.approvedOk': 'דייר אושר ✓',
    'approvals.rejectedOk': 'הבקשה נדחתה',
    'approvals.rejectConfirm': 'לדחות את הבקשה?',
    'pending.title': 'ממתין לאישור ועד',
    'pending.sub': 'חברי ועד הבית שלך קיבלו את הבקשה שלך. ברגע שיאשרו, יוצגו לך כל הפרטים.',
    'pending.building': 'בניין',
    'pending.name': 'שם',
    'pending.apt': 'דירה',
    'pending.phone': 'טלפון',
    'pending.refresh': 'רענון סטטוס',
    'pending.logout': 'התנתק',
    'pending.rejected': 'בקשתך נדחתה על ידי ועד הבית',
    'time.justNow': 'עכשיו',
    'time.minAbbr': ' דק׳',
    'time.hrAbbr': ' שע׳',
    'time.dayAbbr': ' ימים',
    'common.floor': 'קומה',
    'common.applying': 'מחיל...',
    'common.save': 'שמירה',
    'mgmt.payments': 'תשלומים',
    'payAdm.paidThisMonth': 'נגבה החודש',
    'payAdm.pending': 'ממתין',
    'payAdm.overdue': 'בפיגור',
    'payAdm.all': 'הכל',
    'payAdm.pendingShort': 'ממתין',
    'payAdm.overdueShort': 'פיגור',
    'payAdm.paidShort': 'שולם',
    'payAdm.searchPh': 'חיפוש לפי שם, דירה, תיאור...',
    'payAdm.emptyTitle': 'אין תשלומים להצגה',
    'payAdm.emptySub': 'כשיווצרו חיובים (דרך חוקי תשלום או ידנית) הם יופיעו כאן.',
    'payAdm.markPaid': '✓ שולם',
    'payAdm.markPaidTitle': 'סמן כשולם',
    'payAdm.markPaidSave': 'סמן כשולם',
    'payAdm.method': 'אמצעי תשלום',
    'payAdm.dateLabel': 'תאריך תשלום',
    'payAdm.noteLabel': 'הערה (אופציונלי)',
    'payAdm.notePh': 'מס׳ צ׳ק, פרטים נוספים...',
    'payAdm.editTitle': 'עריכת חיוב',
    'payAdm.descLabel': 'תיאור',
    'payAdm.amountLabel': 'סכום',
    'payAdm.dueLabel': 'תאריך פירעון',
    'payAdm.revert': '↶ החזר למצב ממתין',
    'payAdm.edit': 'עריכה',
    'payAdm.deleteConfirm': 'למחוק את החיוב? פעולה זו לא הפיכה.',
    'payAdm.deletedOk': 'החיוב נמחק',
    'payAdm.paidOk': 'סומן כשולם ✓',
    'payAdm.revertOk': 'הוחזר לסטטוס ממתין',
    'payAdm.savedOk': 'עודכן',
    'payAdm.resultsCount': '{n} תוצאות',
    'payAdm.ruleLabel': 'חוק',
    'payAdm.oneTimeLabel': 'חד-פעמי',
    'payAdm.apt': 'דירה',
    'payAdm.collectRate': '{n}% שיעור גבייה',
    'payAdm.debtors': '{n} דיירים',
    'payAdm.countPayments': '{n} חיובים',
    'payAdm.dueBy': 'פירעון',
    'payAdm.paidOn': 'שולם',
    'payMethod.cash': 'מזומן',
    'payMethod.check': 'צ׳ק',
    'payMethod.bank': 'העברה',
    'payMethod.app': 'אפליקציה',
    'payMethod.other': 'אחר',
    'profile.replayTour': '🎬 הדרכה מחדש',
    // Management
    'mgmt.title': 'ניהול ועד',
    'mgmt.rules': 'חוקי תשלום',
    'mgmt.expenses': 'הוצאות',
    'mgmt.maintenance': 'תחזוקה שוטפת',
    // Rules
    'rule.create': '+ חוק תשלום חדש',
    'rule.newTitle': 'חוק תשלום חדש',
    'rule.namePh': 'שם (לדוגמה: דמי ועד חודשי)',
    'rule.descPh': 'תיאור (אופציונלי)',
    'rule.amountPh': 'סכום בש״ח',
    'rule.domPh': 'יום בחודש (1-28)',
    'rule.save': 'שמור',
    'rule.savedOk': 'החוק נשמר ✓',
    'rule.allResidents': 'לכל הדיירים',
    'rule.domLabel': 'יום',
    'rule.applyNow': 'החל עכשיו',
    'rule.applied': 'נוצרו {n} חיובים חדשים ✓',
    'rule.emptyTitle': 'אין חוקי תשלום',
    'rule.emptySub': 'צרו חוק תשלום חוזר והחילו אותו על כל הדיירים בלחיצה אחת',
    'freq.weekly': 'שבועי',
    'freq.biweekly': 'דו-שבועי',
    'freq.monthly': 'חודשי',
    'freq.quarterly': 'רבעוני',
    'freq.semi': 'חצי שנתי',
    'freq.yearly': 'שנתי',
    'freq.onetime': 'חד פעמי',
    // Expenses
    'expense.create': '+ הוספת הוצאה',
    'expense.newTitle': 'הוצאה חדשה',
    'expense.titlePh': 'כותרת ההוצאה',
    'expense.notesPh': 'הערות',
    'expense.uploadReceipt': '📷 העלאת קבלה',
    'expense.save': 'שמור הוצאה',
    'expense.savedOk': 'ההוצאה נשמרה ✓',
    'expense.totalMonth': 'סה״כ החודש',
    'expense.totalYear': 'סה״כ השנה',
    'expense.emptyTitle': 'אין הוצאות רשומות',
    'expense.emptySub': 'תעדו כל הוצאה של הבניין עם קבלה, קטגוריה והערות',
    'expense.fileTooLarge': 'הקובץ גדול מדי (מקסימום 1.2MB)',
    'expCat.maintenance': '🔧 תחזוקה',
    'expCat.cleaning': '🧹 ניקיון',
    'expCat.utility': '💡 שירותים',
    'expCat.insurance': '🛡️ ביטוח',
    'expCat.supplies': '📦 ציוד',
    'expCat.other': '📎 אחר',
    // Maintenance tasks
    'mt.create': '+ משימת תחזוקה חדשה',
    'mt.newTitle': 'משימה חדשה',
    'mt.titlePh': 'לדוגמה: בדיקת מעלית',
    'mt.descPh': 'תיאור',
    'mt.reminderPh': 'תזכורת ימים לפני',
    'mt.save': 'שמור משימה',
    'mt.savedOk': 'המשימה נשמרה ✓',
    'mt.doneOk': 'המשימה סומנה כבוצעה ✓',
    'mt.emptyTitle': 'אין משימות תחזוקה',
    'mt.emptySub': 'הגדירו משימות חוזרות (כמו בדיקת מעלית חודשית) וקבלו תזכורות אוטומטיות',
    'mt.markDone': 'סמן כבוצע',
    'mt.lastDone': 'בוצע לאחרונה',
    'mt.dueIn': 'עוד {n} ימים',
    'mt.overdueBy': 'באיחור {n} ימים',
    'mt.reminderTitle': 'תזכורת תחזוקה',
    // Common
    'common.delete': 'מחק',
    'common.deleted': 'נמחק ✓',
    'common.confirmDelete': 'אתם בטוחים שברצונכם למחוק?',
    'poll.attachSub': 'דיירים יוכלו להצביע ישירות מההודעה',
    'fin.overview': '💰 סקירה',
    'fin.payments': '📋 תשלומים',
    'fin.expenses': '🧾 הוצאות',
    'fin.fundBalance': 'קרן בניין',
    'fin.incomeMonth': 'הכנסות החודש',
    'fin.expenseMonth': 'הוצאות החודש',
    'fin.netMonth': 'נטו החודש',
    'fin.outstanding': 'חוב פתוח',
    'fin.collectionRate': 'שיעור גבייה',
    'fin.paidOf': 'שילמו',
    'fin.pendingRes': 'ממתינים',
    'fin.expensesTotal': 'הוצאות',
    'fin.trendTitle': 'הכנסות מול הוצאות — 6 חודשים',
    'fin.income': 'הכנסות',
    'fin.expensesWord': 'הוצאות',
    'fin.expBreakdown': 'פילוח הוצאות לפי קטגוריה',
    'fin.paid': 'שילמו',
    'fin.waiting': 'ממתינים',
    'fin.owed': 'חוב',
    'fin.youOwe': 'יתרה לתשלום',
    'fin.youPaid': 'שולם — אין חוב!',
    'fin.avgMonthly': 'ממוצע חודשי',
    'fin.expCount': 'מספר הוצאות',
    'fin.expByCategory': 'לפי קטגוריה',
    'ann.detail': 'פרטי הודעה',
    'ann.pinned': 'הודעה מוצמדת',
    'rule.audience': '🎯 קהל יעד',
    'rule.audAll': 'כל הדיירים',
    'rule.audFloors': 'לפי קומה',
    'rule.audApts': 'לפי דירות',
    'rule.audResidents': 'בחירה ידנית',
    'rule.audFloorHint': 'בחרו קומות (לחיצה לבחירה/ביטול)',
    'rule.audAptHint': 'בחרו דירות',
    'rule.audResHint': 'בחרו דיירים ספציפיים',
    'rule.floor': 'קומה',
    'rule.apt': 'דירה',
    'rule.audSummaryAll': '✓ יוחל על כל הדיירים',
    'rule.audSummaryFloors': '✓ {n} קומות נבחרו',
    'rule.audSummaryApts': '✓ {n} דירות נבחרו',
    'rule.audSummaryRes': '✓ {n} דיירים נבחרו',
    'rule.audSummaryNone': 'לא נבחר קהל — יחול על כולם',
    // v2: docs / contractors / audit / emergency / legal
    'docs.title': 'מסמכי הבניין',
    'docs.newTitle': 'העלאת מסמך חדש',
    'docs.titlePh': 'כותרת (לדוגמה: פוליסת ביטוח 2026)',
    'docs.notesPh': 'הערות',
    'docs.searchPh': 'חיפוש מסמך',
    'docs.uploadFile': '📤 בחירת קובץ (PDF/תמונה)',
    'docs.save': 'שמור',
    'docs.uploaded': 'המסמך הועלה בהצלחה',
    'docs.view': 'צפייה',
    'docs.emptyTitle': 'אין עדיין מסמכים',
    'docs.emptySub': 'העלו פוליסות ביטוח, חוזים, תכניות ומסמכים חשובים כדי שכל הדיירים יוכלו לראות',
    'docs.fileTooLarge': 'קובץ גדול מדי (מקסימום 2MB)',
    'docs.noData': 'אין תוכן בקובץ',
    'docs.needFields': 'נא להזין כותרת ולבחור קובץ',
    'docCat.insurance': '🛡️ ביטוח',
    'docCat.contract': '📄 חוזה',
    'docCat.regulations': '📜 תקנון',
    'docCat.plans': '📐 תוכניות',
    'docCat.invoice': '🧾 חשבונית',
    'docCat.legal': '⚖️ משפטי',
    'docCat.other': '📎 אחר',
    'cont.title': 'ספקים וקבלנים',
    'cont.newTitle': 'הוספת ספק חדש',
    'cont.namePh': 'שם איש קשר',
    'cont.companyPh': 'שם החברה',
    'cont.phonePh': 'טלפון',
    'cont.emailPh': 'אימייל',
    'cont.notesPh': 'הערות, עבודות שבוצעו, מחירים',
    'cont.save': 'שמור',
    'cont.added': 'הספק נוסף',
    'cont.needName': 'חובה להזין שם',
    'cont.emptyTitle': 'אין עדיין ספקים',
    'cont.emptySub': 'נהלו רשימה של אינסטלטורים, חשמלאים וספקי שירות עם מי עבדתם',
    'cont.gardening': '🌿 גינון',
    'cont.security': '🔒 אבטחה',
    'contCat.elevator': '🛗 מעלית',
    'contCat.plumbing': '🚿 אינסטלציה',
    'contCat.electrical': '💡 חשמל',
    'contCat.cleaning': '🧹 ניקיון',
    'contCat.gardening': '🌿 גינון',
    'contCat.security': '🔒 אבטחה',
    'contCat.insurance': '🛡️ ביטוח',
    'contCat.legal': '⚖️ משפטי',
    'contCat.other': '📦 אחר',
    'audit.title': 'יומן פעולות',
    'audit.why': 'שקיפות מלאה',
    'audit.whySub': 'כל פעולה חשובה של הוועד מתועדת כאן — גלויה לכל דייר.',
    'audit.emptyTitle': 'היומן ריק',
    'audit.emptySub': 'כשוועד יבצעו פעולות הן יירשמו כאן באופן אוטומטי.',
    'audit.a.ticket.create': 'קריאת שירות נפתחה',
    'audit.a.ticket.status_change': 'סטטוס קריאה עודכן',
    'audit.a.payment_rule.create': 'נוצר חוק תשלום חדש',
    'audit.a.payment_rule.apply': 'חוק תשלום הוחל',
    'audit.a.expense.create': 'הוצאה נרשמה',
    'audit.a.document.upload': 'מסמך הועלה',
    'audit.a.document.delete': 'מסמך נמחק',
    'audit.a.contractor.create': 'ספק נוסף',
    'audit.a.contractor.delete': 'ספק הוסר',
    'audit.a.building.settings_update': 'הגדרות הבניין עודכנו',
    'audit.a.export.payments_csv': 'יצוא תשלומים ל-CSV',
    'audit.a.export.expenses_csv': 'יצוא הוצאות ל-CSV',
    'audit.a.receipt.generate': 'הופקה קבלה',
    'audit.a.data.export_self': 'הנתונים האישיים יוצאו',
    'audit.a.account.delete_self': 'חשבון נמחק',
    'time.now': 'כעת',
    'time.minAgo': 'לפני {n} דק׳',
    'time.hourAgo': 'לפני {n} שעות',
    'time.dayAgo': 'לפני {n} ימים',
    'emerg.title': 'חירום בבניין',
    'emerg.sub': 'לחצו על הכפתור המתאים',
    'emerg.buildingContact': 'איש קשר בבניין',
    'emerg.mda': 'מגן דוד אדום',
    'emerg.police': 'משטרה',
    'emerg.fire': 'כיבוי אש',
    'emerg.electric': 'חברת חשמל',
    'legal.title': 'תנאי שימוש ופרטיות',
    'legal.termsTitle': 'תנאי שימוש',
    'legal.privacyTitle': 'מדיניות פרטיות',
    'legal.t1': 'מהי Lobbix',
    'legal.t1p': 'Lobbix היא מערכת לניהול שקוף של ועד בית — הודעות, קריאות תחזוקה, תשלומים, מסמכים ואחסון מידע היסטורי.',
    'legal.t2': 'השימוש באפליקציה',
    'legal.t2p': 'השימוש מותנה במגורים בבניין, הזמנה מוועד או אישור מנהל מערכת. אין להשתמש לרעה, לספק מידע כוזב או להפר זכויות של דיירים אחרים.',
    'legal.t3': 'תוכן משתמש',
    'legal.t3p': 'אתם אחראים לתוכן שאתם מפרסמים — הודעות, קבלות ומסמכים. לוועד שמורה הזכות למחוק תוכן לא הולם.',
    'legal.t4': 'אחריות מוגבלת',
    'legal.t4p': 'השירות ניתן "כפי שהוא". אין התחייבות לזמינות 100%, והבעלים אינם אחראים לנזקים עקיפים.',
    'legal.t5': 'שינויים',
    'legal.t5p': 'אנו עשויים לעדכן את התנאים מעת לעת. המשך שימוש מהווה הסכמה לשינויים.',
    'legal.p1': 'מה אנו אוספים',
    'legal.p1p': 'אנו שומרים את המידע הדרוש לפעולת השירות — שם, טלפון, דירה, תשלומים, קריאות שפתחתם, קבצים שהעליתם.',
    'legal.p2': 'עם מי אנו חולקים',
    'legal.p2p': 'המידע נשאר בתוך הבניין שלכם. דיירים באותו בניין יכולים לראות:',
    'legal.p2l1': 'את שמותיכם ומספרי הדירה (מדריך הדיירים)',
    'legal.p2l2': 'סטטוס תשלומים מצטבר (ללא פרטי כרטיס)',
    'legal.p2l3': 'הודעות והצבעות שבחרתם לפרסם',
    'legal.p3': 'הזכויות שלכם',
    'legal.p3p': 'תוכלו לייצא את כל המידע האישי שלכם, לעדכן פרטים, או למחוק את חשבונכם בכל עת דרך "אני → אזור סכנה".',
    'legal.p4': 'אבטחה',
    'legal.p4p': 'סיסמאות לא נשמרות (כניסה בקוד חד-פעמי). המידע מוצפן במאגר. פעולות חשובות נרשמות ביומן שקוף לכל הדיירים.',
    'danger.title': 'אזור סכנה',
    'danger.export': '📥 ייצוא הנתונים שלי',
    'danger.delete': '🗑 מחק את חשבוני',
    'danger.confirmDelete': 'האם למחוק את החשבון? לא ניתן לשחזר.',
    'danger.confirmDelete2': 'האם אתם בטוחים לחלוטין?',
    'danger.deleted': 'החשבון נמחק',
    'export.done': 'היצוא הושלם ✓',
    'install.title': '📲 התקינו את Lobbix',
    'install.sub': 'הוסיפו למסך הבית לחוויית אפליקציה מלאה',
    'install.btn': 'התקנה',
    'install.done': 'Lobbix הותקנה!',
    'err.loadFailed': 'שגיאה בטעינת הנתונים',
    'err.exportFailed': 'שגיאה בייצוא',
    'common.retry': 'נסה שוב',
    'profile.docs': '📁 מסמכי הבניין',
    'profile.contractors': '🧰 ספקים וקבלנים',
    'profile.audit': '🔍 יומן פעולות (שקיפות)',
    'profile.terms': '📜 תנאי שימוש',
    'profile.privacy': '🛡️ מדיניות פרטיות',
    'profile.emergency': '🚨 חירום',
    'profile.exportPayCsv': '📊 ייצוא תשלומים (CSV)',
    'profile.exportExpCsv': '📊 ייצוא הוצאות (CSV)',
    'receipt.download': '📄 קבלה',
  },
  en: {
    'stage.sub': 'Transparent committee. Calm building.',
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
    'login.sub': 'Transparent committee. Calm building.',
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
    'profile.about': 'ℹ️ About Lobbix',
    'profile.help': '❓ Help & support',
    'profile.share': '🔗 Share building code',
    'profile.logout': '⎋ Log out',
    'profile.version': 'Lobbix v1.1 · Built with ♥ in Israel 🇮🇱',
    'profile.loggedOut': 'Signed out',
    'profile.darkOn': '🌙 Dark mode', 'profile.darkOff': '☀️ Light mode',
    'profile.langHe': '🇮🇱 השפה שונתה לעברית', 'profile.langEn': '🇺🇸 Language changed to English',
    'profile.notifOn': '🔔 On', 'profile.notifOff': '🔕 Off',
    'profile.emailOn': 'Email alerts on', 'profile.emailOff': 'Email alerts off',
    'profile.copied': '📋 Copied:',
    'profile.supportEmail': '✉️ Email: liam@lobbix.co.il',
    'profile.aboutToast': 'Lobbix · Transparent committee. Calm building.',
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
    // Super admin
    'profile.superAdmin': 'Super admin',
    'profile.manageBuildings': '👑 Manage buildings',
    'profile.switchUser': '🔄 Switch user (testing)',
    'admin.title': 'Manage buildings',
    'admin.superAdmin': 'System super admin',
    'admin.manageAll': 'Manage every building in the system',
    'admin.newBuilding': 'New building',
    'admin.bldName': 'Building name',
    'admin.bldAddress': 'Address',
    'admin.bldCity': 'City',
    'admin.totalApts': 'Total apartments',
    'admin.totalFloors': 'Total floors',
    'admin.inviteCode': 'Invite code',
    'admin.firstAdmin': 'First admin',
    'admin.adminName': 'Admin name',
    'admin.adminApt': 'Apt #',
    'admin.create': 'Create building',
    'admin.noBuildings': 'No buildings yet',
    'admin.needAllFields': 'Please fill all fields',
    'admin.noPhone': 'Missing phone number',
    'onboard.title': 'Building created!',
    'onboard.sub': 'Here are the new admin credentials',
    'onboard.building': 'Building',
    'onboard.inviteCode': 'Invite code',
    'onboard.adminName': 'Admin name',
    'onboard.adminPhone': 'Phone',
    'onboard.tip': 'Tap below to log in as the new admin and see the fresh empty building come to life.',
    'onboard.loginAs': 'Log in as the new admin',
    'onboard.backToAdmin': 'Back to admin',
    'onboard.welcomeNewBuilding': 'Welcome to the new building! 🎉',
    'switch.title': 'Choose a test user',
    'switch.switched': 'Switched user',
    // Empty states
    'empty.firstAnnTitle': 'No announcements yet',
    'empty.firstAnnSub': 'Post the first announcement for your residents',
    'empty.firstAnnCta': '+ First announcement',
    'empty.firstTicTitle': 'No open tickets',
    'empty.firstTicSub': 'When something needs attention in the building, report it here',
    'empty.firstTicCta': '+ First ticket',
    'empty.firstPayTitle': 'No payments',
    'empty.firstPaySub': 'The payments dashboard will appear once there\'s activity',
    'empty.firstResTitle': 'It\'s just you here',
    'empty.firstResSub': 'Share the building invite code so residents can join',
    // Tour
    'tour.skip': 'Skip',
    'tour.next': 'Next',
    'tour.finish': 'Done',
    'tour.s1.t': 'Welcome to Lobbix 👋',
    'tour.s1.b': 'Let\'s take a quick tour. You can skip anytime or replay the tour later from your profile.',
    'tour.s2.t': 'Home — your dashboard',
    'tour.s2.b': 'See your building card, balance, payments, announcements, and recent tickets all in one place. This is your daily entry point.',
    'tour.s3.t': 'News & announcements 📢',
    'tour.s3.b': 'Get messages from the committee: important notices, events, maintenance, and polls you can vote on. Filter by category.',
    'tour.s4.t': 'Maintenance tickets 🔧',
    'tour.s4.b': 'Report building issues: elevator, plumbing, electrical, or cleaning. Track them from open to resolved.',
    'tour.s5.t': 'Payments 💰',
    'tour.s5.b': 'View your balance, payment history, collection rate, and a 6-month trend chart. Admins also get a full dashboard.',
    'tour.s6.t': 'Residents 👥',
    'tour.s6.b': 'Meet your neighbors by apartment number. Search, invite new residents, and see committee members.',
    'tour.s7.t': 'You\'re all set! 🎉',
    'tour.s7.b': 'Heading back home. If you\'re a committee admin, go to Me → Vaad tools to manage payment rules, expenses, and maintenance.',
    // Invite
    'res.invite': 'Invite residents',
    'invite.title': 'Invite new residents',
    'invite.sub': 'Share your building invite code',
    'invite.code': 'Invite code',
    'invite.copy': '📋 Copy code',
    'invite.share': '🔗 Share',
    'invite.copied': 'Copied:',
    'invite.shareMsg': 'Join {bld} on Lobbix with invite code: {code}\nhttps://lobbix.co.il',
    'invite.step1': 'Send the code to the resident',
    'invite.step2': 'They install the app',
    'invite.step3': 'Log in with their phone + invite code',
    // Login
    'login.or': 'or',
    'login.google': 'Continue with Google',
    'google.title': 'Google sign-in (demo)',
    'google.sub': 'Demo mode — fill in details and building code',
    'google.name': 'Full name',
    'google.email': 'Email',
    'google.invite': 'Building invite code',
    'google.continue': 'Continue',
    // Profile
    'profile.vaadTools': 'Vaad tools',
    'profile.openMgmt': '💼 Manage Vaad (rules, expenses, maintenance)',
    'tab.management': 'Manage',
    'mgmt.approvals': 'Join requests',
    'approvals.emptyTitle': 'No pending requests',
    'approvals.emptySub': 'When someone joins with the invite code they will appear here for approval.',
    'approvals.unnamed': 'Unnamed',
    'approvals.namePh': 'Full name',
    'approvals.aptPh': 'Apt',
    'approvals.floorPh': 'Floor',
    'approvals.approve': 'Approve',
    'approvals.reject': 'Reject',
    'approvals.approvedOk': 'Resident approved ✓',
    'approvals.rejectedOk': 'Request rejected',
    'approvals.rejectConfirm': 'Reject this request?',
    'pending.title': 'Waiting for committee approval',
    'pending.sub': 'Your building committee has received your request. Once they approve, you will see the full app.',
    'pending.building': 'Building',
    'pending.name': 'Name',
    'pending.apt': 'Apartment',
    'pending.phone': 'Phone',
    'pending.refresh': 'Refresh status',
    'pending.logout': 'Sign out',
    'pending.rejected': 'Your request was rejected by the building committee',
    'time.justNow': 'just now',
    'time.minAbbr': 'm ago',
    'time.hrAbbr': 'h ago',
    'time.dayAbbr': 'd ago',
    'common.floor': 'Floor',
    'common.applying': 'Applying...',
    'common.save': 'Save',
    'mgmt.payments': 'Payments',
    'payAdm.paidThisMonth': 'Collected this month',
    'payAdm.pending': 'Pending',
    'payAdm.overdue': 'Overdue',
    'payAdm.all': 'All',
    'payAdm.pendingShort': 'Pending',
    'payAdm.overdueShort': 'Overdue',
    'payAdm.paidShort': 'Paid',
    'payAdm.searchPh': 'Search by name, apt, description...',
    'payAdm.emptyTitle': 'No payments to show',
    'payAdm.emptySub': 'Charges created through rules or manually will appear here.',
    'payAdm.markPaid': '✓ Mark paid',
    'payAdm.markPaidTitle': 'Mark as paid',
    'payAdm.markPaidSave': 'Mark as paid',
    'payAdm.method': 'Payment method',
    'payAdm.dateLabel': 'Payment date',
    'payAdm.noteLabel': 'Note (optional)',
    'payAdm.notePh': 'Check #, details...',
    'payAdm.editTitle': 'Edit charge',
    'payAdm.descLabel': 'Description',
    'payAdm.amountLabel': 'Amount',
    'payAdm.dueLabel': 'Due date',
    'payAdm.revert': '↶ Revert to pending',
    'payAdm.edit': 'Edit',
    'payAdm.deleteConfirm': 'Delete this charge? This cannot be undone.',
    'payAdm.deletedOk': 'Charge deleted',
    'payAdm.paidOk': 'Marked as paid ✓',
    'payAdm.revertOk': 'Reverted to pending',
    'payAdm.savedOk': 'Saved',
    'payAdm.resultsCount': '{n} results',
    'payAdm.ruleLabel': 'Rule',
    'payAdm.oneTimeLabel': 'One-time',
    'payAdm.apt': 'Apt',
    'payAdm.collectRate': '{n}% collection rate',
    'payAdm.debtors': '{n} residents',
    'payAdm.countPayments': '{n} charges',
    'payAdm.dueBy': 'Due',
    'payAdm.paidOn': 'Paid',
    'payMethod.cash': 'Cash',
    'payMethod.check': 'Check',
    'payMethod.bank': 'Transfer',
    'payMethod.app': 'App',
    'payMethod.other': 'Other',
    'profile.replayTour': '🎬 Replay tour',
    // Management
    'mgmt.title': 'Vaad management',
    'mgmt.rules': 'Payment rules',
    'mgmt.expenses': 'Expenses',
    'mgmt.maintenance': 'Maintenance',
    // Rules
    'rule.create': '+ New payment rule',
    'rule.newTitle': 'New payment rule',
    'rule.namePh': 'Name (e.g. Monthly Vaad fee)',
    'rule.descPh': 'Description (optional)',
    'rule.amountPh': 'Amount',
    'rule.domPh': 'Day of month (1-28)',
    'rule.save': 'Save',
    'rule.savedOk': 'Rule saved ✓',
    'rule.allResidents': 'All residents',
    'rule.domLabel': 'Day',
    'rule.applyNow': 'Apply now',
    'rule.applied': 'Created {n} new charges ✓',
    'rule.emptyTitle': 'No payment rules',
    'rule.emptySub': 'Create a recurring payment rule and apply it to all residents with one click',
    'freq.weekly': 'Weekly',
    'freq.biweekly': 'Biweekly',
    'freq.monthly': 'Monthly',
    'freq.quarterly': 'Quarterly',
    'freq.semi': 'Semi-annual',
    'freq.yearly': 'Yearly',
    'freq.onetime': 'One time',
    // Expenses
    'expense.create': '+ Add expense',
    'expense.newTitle': 'New expense',
    'expense.titlePh': 'Expense title',
    'expense.notesPh': 'Notes',
    'expense.uploadReceipt': '📷 Upload receipt',
    'expense.save': 'Save expense',
    'expense.savedOk': 'Expense saved ✓',
    'expense.totalMonth': 'This month',
    'expense.totalYear': 'This year',
    'expense.emptyTitle': 'No expenses yet',
    'expense.emptySub': 'Document every building expense with a receipt, category and notes',
    'expense.fileTooLarge': 'File too large (max 1.2MB)',
    'expCat.maintenance': '🔧 Maintenance',
    'expCat.cleaning': '🧹 Cleaning',
    'expCat.utility': '💡 Utilities',
    'expCat.insurance': '🛡️ Insurance',
    'expCat.supplies': '📦 Supplies',
    'expCat.other': '📎 Other',
    // Maintenance tasks
    'mt.create': '+ New maintenance task',
    'mt.newTitle': 'New task',
    'mt.titlePh': 'e.g. Elevator inspection',
    'mt.descPh': 'Description',
    'mt.reminderPh': 'Reminder days before',
    'mt.save': 'Save task',
    'mt.savedOk': 'Task saved ✓',
    'mt.doneOk': 'Marked done ✓',
    'mt.emptyTitle': 'No maintenance tasks',
    'mt.emptySub': 'Set up recurring tasks (e.g. monthly elevator check) and get automatic reminders',
    'mt.markDone': 'Mark done',
    'mt.lastDone': 'Last done',
    'mt.dueIn': 'in {n} days',
    'mt.overdueBy': 'overdue by {n} days',
    'mt.reminderTitle': 'Maintenance reminder',
    // Common
    'common.delete': 'Delete',
    'common.deleted': 'Deleted ✓',
    'common.confirmDelete': 'Are you sure you want to delete?',
    'poll.attachSub': 'Residents can vote directly from the announcement',
    'fin.overview': '💰 Overview',
    'fin.payments': '📋 Payments',
    'fin.expenses': '🧾 Expenses',
    'fin.fundBalance': 'Building fund',
    'fin.incomeMonth': 'Income this month',
    'fin.expenseMonth': 'Expenses this month',
    'fin.netMonth': 'Net this month',
    'fin.outstanding': 'Outstanding',
    'fin.collectionRate': 'Collection rate',
    'fin.paidOf': 'Paid',
    'fin.pendingRes': 'Pending',
    'fin.expensesTotal': 'Expenses',
    'fin.trendTitle': 'Income vs Expenses — 6 months',
    'fin.income': 'Income',
    'fin.expensesWord': 'Expenses',
    'fin.expBreakdown': 'Expense breakdown by category',
    'fin.paid': 'paid',
    'fin.waiting': 'waiting',
    'fin.owed': 'owed',
    'fin.youOwe': 'Balance due',
    'fin.youPaid': 'All paid — no balance!',
    'fin.avgMonthly': 'Monthly average',
    'fin.expCount': 'Total expenses',
    'fin.expByCategory': 'By category',
    'ann.detail': 'Announcement details',
    'ann.pinned': 'Pinned',
    'rule.audience': '🎯 Audience',
    'rule.audAll': 'All residents',
    'rule.audFloors': 'By floor',
    'rule.audApts': 'By apartment',
    'rule.audResidents': 'Manual select',
    'rule.audFloorHint': 'Select floors (click to toggle)',
    'rule.audAptHint': 'Select apartments',
    'rule.audResHint': 'Select specific residents',
    'rule.floor': 'Floor',
    'rule.apt': 'Apt',
    'rule.audSummaryAll': '✓ Applies to all residents',
    'rule.audSummaryFloors': '✓ {n} floors selected',
    'rule.audSummaryApts': '✓ {n} apartments selected',
    'rule.audSummaryRes': '✓ {n} residents selected',
    'rule.audSummaryNone': 'No audience selected — will apply to all',
    // v2
    'docs.title': 'Building documents',
    'docs.newTitle': 'Upload a new document',
    'docs.titlePh': 'Title (e.g. Insurance policy 2026)',
    'docs.notesPh': 'Notes',
    'docs.searchPh': 'Search documents',
    'docs.uploadFile': '📤 Choose file (PDF/image)',
    'docs.save': 'Save',
    'docs.uploaded': 'Document uploaded',
    'docs.view': 'View',
    'docs.emptyTitle': 'No documents yet',
    'docs.emptySub': 'Upload insurance policies, contracts, plans and important documents so all residents can see them',
    'docs.fileTooLarge': 'File too large (max 2MB)',
    'docs.noData': 'No file content',
    'docs.needFields': 'Please provide a title and select a file',
    'docCat.insurance': '🛡️ Insurance',
    'docCat.contract': '📄 Contract',
    'docCat.regulations': '📜 Regulations',
    'docCat.plans': '📐 Plans',
    'docCat.invoice': '🧾 Invoice',
    'docCat.legal': '⚖️ Legal',
    'docCat.other': '📎 Other',
    'cont.title': 'Contractors',
    'cont.newTitle': 'Add a contractor',
    'cont.namePh': 'Contact name',
    'cont.companyPh': 'Company name',
    'cont.phonePh': 'Phone',
    'cont.emailPh': 'Email',
    'cont.notesPh': 'Notes, past jobs, prices',
    'cont.save': 'Save',
    'cont.added': 'Contractor added',
    'cont.needName': 'Name is required',
    'cont.emptyTitle': 'No contractors yet',
    'cont.emptySub': 'Keep track of plumbers, electricians and service providers you\'ve worked with',
    'cont.gardening': '🌿 Gardening',
    'cont.security': '🔒 Security',
    'contCat.elevator': '🛗 Elevator',
    'contCat.plumbing': '🚿 Plumbing',
    'contCat.electrical': '💡 Electrical',
    'contCat.cleaning': '🧹 Cleaning',
    'contCat.gardening': '🌿 Gardening',
    'contCat.security': '🔒 Security',
    'contCat.insurance': '🛡️ Insurance',
    'contCat.legal': '⚖️ Legal',
    'contCat.other': '📦 Other',
    'audit.title': 'Activity log',
    'audit.why': 'Full transparency',
    'audit.whySub': 'Every important Vaad action is logged here — visible to every resident.',
    'audit.emptyTitle': 'The log is empty',
    'audit.emptySub': 'When Vaad members take actions they will be recorded here automatically.',
    'audit.a.ticket.create': 'Ticket opened',
    'audit.a.ticket.status_change': 'Ticket status updated',
    'audit.a.payment_rule.create': 'Payment rule created',
    'audit.a.payment_rule.apply': 'Payment rule applied',
    'audit.a.expense.create': 'Expense recorded',
    'audit.a.document.upload': 'Document uploaded',
    'audit.a.document.delete': 'Document deleted',
    'audit.a.contractor.create': 'Contractor added',
    'audit.a.contractor.delete': 'Contractor removed',
    'audit.a.building.settings_update': 'Building settings updated',
    'audit.a.export.payments_csv': 'Payments exported to CSV',
    'audit.a.export.expenses_csv': 'Expenses exported to CSV',
    'audit.a.receipt.generate': 'Receipt generated',
    'audit.a.data.export_self': 'Personal data exported',
    'audit.a.account.delete_self': 'Account deleted',
    'time.now': 'just now',
    'time.minAgo': '{n}m ago',
    'time.hourAgo': '{n}h ago',
    'time.dayAgo': '{n}d ago',
    'emerg.title': 'Emergency',
    'emerg.sub': 'Tap the right contact',
    'emerg.buildingContact': 'Building contact',
    'emerg.mda': 'Magen David Adom',
    'emerg.police': 'Police',
    'emerg.fire': 'Fire department',
    'emerg.electric': 'Electric company',
    'legal.title': 'Legal',
    'legal.termsTitle': 'Terms of service',
    'legal.privacyTitle': 'Privacy policy',
    'legal.t1': 'What is Lobbix',
    'legal.t1p': 'Lobbix is a transparent building-committee management platform — for announcements, maintenance, payments, documents and history.',
    'legal.t2': 'Using the app',
    'legal.t2p': 'Use is limited to residents of registered buildings invited by their committee. Do not misuse, provide false information, or violate other residents\' rights.',
    'legal.t3': 'User content',
    'legal.t3p': 'You are responsible for the content you post — messages, receipts and documents. Committee members can remove inappropriate content.',
    'legal.t4': 'Limited liability',
    'legal.t4p': 'The service is provided "as is" without warranties. We are not liable for indirect damages.',
    'legal.t5': 'Changes',
    'legal.t5p': 'These terms may be updated over time. Continued use implies acceptance.',
    'legal.p1': 'What we collect',
    'legal.p1p': 'We store only what the service needs — name, phone, apartment, payments, tickets, uploaded files.',
    'legal.p2': 'Who we share with',
    'legal.p2p': 'Data stays inside your building. Other residents in the same building may see:',
    'legal.p2l1': 'Your name and apartment number (resident directory)',
    'legal.p2l2': 'Aggregate payment status (never card details)',
    'legal.p2l3': 'Announcements and polls you publish',
    'legal.p3': 'Your rights',
    'legal.p3p': 'You can export all your data, update details, or delete your account anytime under "Me → Danger zone".',
    'legal.p4': 'Security',
    'legal.p4p': 'We do not store passwords (one-time codes for login). Data is encrypted at rest. Important actions are written to a transparent log visible to all residents.',
    'danger.title': 'Danger zone',
    'danger.export': '📥 Export my data',
    'danger.delete': '🗑 Delete my account',
    'danger.confirmDelete': 'Delete your account? This cannot be undone.',
    'danger.confirmDelete2': 'Are you absolutely sure?',
    'danger.deleted': 'Account deleted',
    'export.done': 'Export complete ✓',
    'install.title': '📲 Install Lobbix',
    'install.sub': 'Add to your home screen for a full app experience',
    'install.btn': 'Install',
    'install.done': 'Lobbix installed!',
    'err.loadFailed': 'Failed to load data',
    'err.exportFailed': 'Export failed',
    'common.retry': 'Retry',
    'profile.docs': '📁 Building documents',
    'profile.contractors': '🧰 Contractors',
    'profile.audit': '🔍 Activity log (transparency)',
    'profile.terms': '📜 Terms of service',
    'profile.privacy': '🛡️ Privacy policy',
    'profile.emergency': '🚨 Emergency',
    'profile.exportPayCsv': '📊 Export payments (CSV)',
    'profile.exportExpCsv': '📊 Export expenses (CSV)',
    'receipt.download': '📄 Receipt',
  },
};

function t(key, vars, fallback) {
  const dict = I18N[store.lang] || I18N.he;
  let s = dict[key];
  if (s == null) s = (I18N.en[key] != null ? I18N.en[key] : (fallback != null ? fallback : key));
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

// ---------------- Onboarding tour ----------------
const TOUR_STEPS = [
  { icon: '👋', tKey: 'tour.s1', nav: 'home' },
  { icon: '🏢', tKey: 'tour.s2', nav: 'home' },
  { icon: '📢', tKey: 'tour.s3', nav: 'announcements' },
  { icon: '🔧', tKey: 'tour.s4', nav: 'tickets' },
  { icon: '💰', tKey: 'tour.s5', nav: 'payments' },
  { icon: '👥', tKey: 'tour.s6', nav: 'residents' },
  { icon: '🎉', tKey: 'tour.s7', nav: 'home' },
];
let tourStep = 0;

function renderTourStep() {
  const step = TOUR_STEPS[tourStep];
  if (!step) return closeTour(true);
  const indicator = $('tour-step-indicator');
  indicator.innerHTML = TOUR_STEPS.map((_, i) => `<span class="${i === tourStep ? 'active' : ''}"></span>`).join('');
  $('tour-icon').textContent = step.icon;
  $('tour-title').textContent = t(step.tKey + '.t');
  $('tour-body').textContent = t(step.tKey + '.b');
  $('tour-next').textContent = tourStep === TOUR_STEPS.length - 1 ? t('tour.finish') : t('tour.next');
  // Navigate to the corresponding view in the background
  if (step.nav) show(step.nav);
}

function startTour() {
  tourStep = 0;
  $('tour-overlay').classList.remove('hidden');
  renderTourStep();
}
function closeTour(markDone) {
  $('tour-overlay').classList.add('hidden');
  if (markDone) localStorage.setItem('vaad_tour_done', '1');
  show('home');
}
$('tour-next')?.addEventListener('click', () => {
  tourStep++;
  if (tourStep >= TOUR_STEPS.length) return closeTour(true);
  renderTourStep();
});
$('tour-skip')?.addEventListener('click', () => closeTour(true));

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
  document.title = lang === 'he' ? 'Lobbix — ועד שקוף. בניין רגוע.' : 'Lobbix — Transparent committee. Calm building.';
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
const views = ['login', 'pending', 'home', 'announcements', 'tickets', 'payments', 'residents', 'profile', 'ticket-detail', 'ann-detail', 'admin', 'onboarded', 'management', 'documents', 'contractors', 'audit', 'legal'];
const tabRoutes = ['home', 'announcements', 'tickets', 'payments', 'profile'];
let currentRoute = 'login';
let navStack = [];

function show(route, opts = {}) {
  if (!opts.back) navStack.push(currentRoute);
  currentRoute = route;
  views.forEach((v) => $('view-' + v)?.classList.add('hidden'));
  $('view-' + route)?.classList.remove('hidden');

  const tabbar = $('tabbar');
  if (route === 'login' || route === 'pending') {
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
  if (route === 'admin') loadAdminBuildings();
  if (route === 'management') loadManagement();
  if (route === 'documents') loadDocuments();
  if (route === 'contractors') loadContractors();
  if (route === 'audit') loadAuditLog();
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
  // If the logged-in user is still waiting for vaad approval, route them
  // to the pending screen and skip the dashboard entirely.
  const storedUser = store.user;
  if (storedUser && storedUser.approvalStatus === 'pending') {
    return showPendingScreen();
  }
  try {
    const me = await api('/api/residents/me');
    appState.me = me;
    applyVaadClass();
    refreshApprovalBadges();
    show('home');
    ensureNotifPerm(); // ask once after login
    // First-time tour
    if (!localStorage.getItem('vaad_tour_done')) {
      setTimeout(() => startTour(), 800);
    }
  } catch (e) {
    // 403 with ACCOUNT_PENDING_APPROVAL means the account exists but the
    // vaad hasn't greenlit them yet — show the waiting screen.
    if (String(e.message || '').includes('PENDING')) {
      return showPendingScreen();
    }
    console.error(e);
    store.token = null; store.user = null;
    show('login');
  }
}

// Toggle body class so .vaad-only elements (management tab, etc.) appear
function applyVaadClass() {
  const role = appState.me?.user?.role || '';
  const isVaad = ['vaad_admin', 'vaad_member', 'treasurer'].includes(role);
  document.body.classList.toggle('is-vaad', isVaad);
}

// ---- Pending-approval screen ----
async function showPendingScreen() {
  show('pending');
  try {
    const { user, building } = await api('/api/residents/me/pending');
    if (user.approval_status === 'approved') {
      // Vaad just approved — re-enter dashboard
      store.user = { ...(store.user || {}), approvalStatus: 'approved' };
      return enterDashboard();
    }
    if (user.approval_status === 'rejected') {
      toast(t('pending.rejected') || 'בקשתך נדחתה על ידי ועד הבית');
      store.token = null; store.user = null;
      return show('login');
    }
    $('pending-building').textContent = building?.name || '—';
    $('pending-name').textContent = user.full_name || '—';
    $('pending-apt').textContent = user.apartment_number || '—';
    $('pending-phone').textContent = user.phone_number || '—';
  } catch (e) {
    // If /me/pending fails the token is bad — go to login
    store.token = null; store.user = null;
    show('login');
  }
}

document.addEventListener('click', (e) => {
  if (e.target.closest('#pending-refresh')) { e.preventDefault(); showPendingScreen(); }
  if (e.target.closest('#pending-logout')) {
    e.preventDefault();
    store.token = null; store.user = null; appState.me = null;
    document.body.classList.remove('is-vaad');
    show('login');
  }
});

// Google demo login
$('google-login-btn')?.addEventListener('click', () => $('google-sheet').classList.remove('hidden'));
$('google-close')?.addEventListener('click', () => $('google-sheet').classList.add('hidden'));
$('g-submit')?.addEventListener('click', async () => {
  const email = $('g-email').value.trim();
  const name = $('g-name').value.trim();
  const inviteCode = $('g-invite').value.trim().toUpperCase();
  if (!email || !name || !inviteCode) return toast(t('admin.needAllFields'));
  try {
    const res = await api('/api/auth/google-demo', { method: 'POST', body: JSON.stringify({ email, name, inviteCode }) });
    store.token = res.accessToken;
    store.user = res.user;
    $('google-sheet').classList.add('hidden');
    await enterDashboard();
  } catch (e) { toast(e.message); }
});

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
    <div class="list-item ann-item ${a.is_pinned ? 'pinned' : ''}" data-ann-id="${escapeAttr(a.id)}" style="cursor:pointer">
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
  const isVaad = ['vaad_admin', 'vaad_member'].includes(appState.me?.user?.role);
  if (!filtered.length) {
    if (f === 'all' && appState.announcements.length === 0) {
      list.innerHTML = `
        <div class="empty-cta">
          <span class="emo">📢</span>
          <h4>${t('empty.firstAnnTitle')}</h4>
          <p>${t('empty.firstAnnSub')}</p>
          ${isVaad ? `<button class="btn-primary" id="empty-ann-cta">${t('empty.firstAnnCta')}</button>` : ''}
        </div>`;
      $('empty-ann-cta')?.addEventListener('click', () => $('new-announcement-form').classList.remove('hidden'));
    } else {
      list.innerHTML = `<div class="empty">${t('ann.empty')}</div>`;
    }
    return;
  }
  list.innerHTML = filtered.map(renderAnnouncement).join('');
  // Wire click-to-detail on announcement items
  list.querySelectorAll('.ann-item[data-ann-id]').forEach((el) => {
    el.addEventListener('click', (e) => {
      // Don't navigate if clicking inside a poll option
      if (e.target.closest('.poll-option')) return;
      const annId = el.dataset.annId;
      const ann = appState.announcements.find((a) => a.id === annId);
      if (ann) openAnnDetail(ann);
    });
  });
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

function openAnnDetail(a) {
  const icon = { urgent: '🚨', maintenance: '🔧', event: '🎉', general: '📄' }[a.category] || '📄';
  const catLabel = t('catName.' + (a.category || 'general'));
  const poll = (appState.polls || []).find((p) => p.announcement_id === a.id);
  const contentHtml = escapeHtml(a.content || '').replace(/\n/g, '<br>');
  $('ann-detail-content').innerHTML = `
    <div class="ann-detail-hero">
      <div class="ann-detail-icon">${icon}</div>
      <span class="badge cat-${escapeAttr(a.category || 'general')}">${escapeHtml(catLabel)}</span>
    </div>
    <h3 class="ann-detail-title" dir="${dir(a.title)}">${a.is_pinned ? '📌 ' : ''}${escapeHtml(a.title)}</h3>
    <div class="ann-detail-meta">
      <span>👤 ${escapeHtml(a.author_name || t('common.unknown'))}</span>
      <span>🕐 ${fmtDate(a.published_at || a.created_at)}</span>
      ${a.is_pinned ? `<span>📌 ${t('ann.pinned')}</span>` : ''}
    </div>
    <div class="ann-detail-body" dir="${dir(a.content)}">${contentHtml}</div>
    ${poll ? `<div class="ann-detail-poll">${renderPollCard(poll)}</div>` : ''}
  `;
  show('ann-detail');
  // Re-wire poll votes inside detail
  $('ann-detail-content').querySelectorAll('.poll-card').forEach((card) => {
    const pollId = card.dataset.pollId;
    card.querySelectorAll('.poll-option').forEach((opt) => {
      opt.addEventListener('click', async () => {
        if (card.classList.contains('poll-closed')) return;
        const idx = Number(opt.dataset.optIdx);
        try {
          await api('/api/polls/' + pollId + '/vote', { method: 'POST', body: JSON.stringify({ option_index: idx }) });
          toast(t('poll.voted'));
          const { polls } = await api('/api/polls').catch(() => ({ polls: [] }));
          appState.polls = polls || [];
          openAnnDetail(a); // re-render detail with updated poll
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

// Poll fields toggle + add option (button wrapper)
$('ann-is-poll-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  const cb = $('ann-is-poll');
  cb.checked = !cb.checked;
  $('ann-is-poll-btn').classList.toggle('active', cb.checked);
  $('poll-fields').classList.toggle('hidden', !cb.checked);
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
  if (!filtered.length) {
    if (f === 'all' && appState.tickets.length === 0) {
      list.innerHTML = `
        <div class="empty-cta">
          <span class="emo">🔧</span>
          <h4>${t('empty.firstTicTitle')}</h4>
          <p>${t('empty.firstTicSub')}</p>
          <button class="btn-primary" id="empty-tic-cta">${t('empty.firstTicCta')}</button>
        </div>`;
      $('empty-tic-cta')?.addEventListener('click', () => $('new-ticket-form').classList.remove('hidden'));
    } else {
      list.innerHTML = `<div class="empty">${t('tic.empty')}</div>`;
    }
    // still need to wire clicks for non-existent items (no-op)
    return;
  }
  list.innerHTML = filtered.map(renderTicket).join('');
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
// ================ FINANCE DASHBOARD (3 tabs) ================
let finTab = 'overview';

function setFinTab(tab) {
  finTab = tab;
  document.querySelectorAll('.fin-tab').forEach((b) => b.classList.toggle('active', b.dataset.ft === tab));
  ['overview', 'payments', 'expenses'].forEach((k) => {
    $('fin-' + k)?.classList.toggle('hidden', k !== tab);
  });
  if (tab === 'overview') renderFinanceOverview();
  if (tab === 'payments') renderPaymentsTab();
  if (tab === 'expenses') renderExpensesPublic();
}
document.querySelectorAll('.fin-tab').forEach((b) => b.addEventListener('click', () => setFinTab(b.dataset.ft)));

function renderPayment(p) {
  const icon = { vaad_monthly: '🏢', monthly: '🏢', utility: '💡', repair: '🔧', insurance: '🛡️', rule: '📋', other: '📦' }[p.payment_type] || '💰';
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
    const [{ payments }, { expenses }, resData] = await Promise.all([
      api('/api/payments'),
      api('/api/finance/expenses').catch(() => ({ expenses: [] })),
      appState.residents?.length ? { residents: appState.residents } : api('/api/residents'),
    ]);
    appState.payments = payments;
    appState.publicExpenses = expenses || [];
    appState.residents = resData.residents || appState.residents;
    setFinTab(finTab);
  } catch (e) { console.error(e); }
}

// ---- Tab 1: Financial Overview ----
function renderFinanceOverview() {
  const payments = appState.payments || [];
  const expenses = appState.publicExpenses || [];
  const now = new Date();

  const inMonth = (dateStr, m, y) => { const d = new Date(dateStr); return d.getFullYear() === y && d.getMonth() === m; };
  const thisMonthPayments = payments.filter((p) => inMonth(p.due_date, now.getMonth(), now.getFullYear()));
  const thisMonthExpenses = expenses.filter((e) => inMonth(e.expense_date, now.getMonth(), now.getFullYear()));

  const mPaid = thisMonthPayments.filter((p) => p.status === 'paid');
  const mPending = thisMonthPayments.filter((p) => p.status !== 'paid');
  const incomeMonth = mPaid.reduce((s, p) => s + Number(p.amount || 0), 0);
  const expenseMonth = thisMonthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const netMonth = incomeMonth - expenseMonth;
  const outstanding = mPending.reduce((s, p) => s + Number(p.amount || 0), 0);

  // All-time fund: total paid - total expenses
  const totalCollected = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const fundBalance = totalCollected - totalExpenses;

  $('fin-fund').textContent = fmtMoney(fundBalance);
  const netBadge = $('fin-net-badge');
  netBadge.textContent = (netMonth >= 0 ? '+' : '') + fmtMoney(netMonth);
  netBadge.className = 'fin-hero-badge ' + (netMonth >= 0 ? 'positive' : 'negative');
  $('fin-income').textContent = fmtMoney(incomeMonth);
  $('fin-expense').textContent = fmtMoney(expenseMonth);
  $('fin-net').textContent = (netMonth >= 0 ? '+' : '') + fmtMoney(netMonth);
  $('fin-net').style.color = netMonth >= 0 ? '#6ee7b7' : '#fca5a5';
  $('fin-outstanding').textContent = fmtMoney(outstanding);

  // KPI
  const rate = thisMonthPayments.length ? Math.round((mPaid.length / thisMonthPayments.length) * 100) : 0;
  const debtorIds = new Set(mPending.map((p) => p.resident_id));
  animateCount($('kpi-rate'), rate, { suffix: '%' });
  $('kpi-paid-count').textContent = mPaid.length + '/' + thisMonthPayments.length;
  animateCount($('kpi-pending-count'), debtorIds.size);
  $('kpi-exp-month').textContent = fmtMoney(expenseMonth);

  // 6-month income vs expenses chart
  drawDualTrendChart(payments, expenses);

  // Expense breakdown by category
  renderExpenseBreakdown(expenses, 'fin-exp-bars');
}

function drawDualTrendChart(payments, expenses) {
  const svg = $('fin-trend-chart');
  if (!svg) return;
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: d.toISOString().slice(0, 7), y: d.getFullYear(), m: d.getMonth(), label: d.toLocaleDateString([], { month: 'short' }), income: 0, expense: 0 });
  }
  payments.forEach((p) => {
    if (p.status !== 'paid') return;
    const d = new Date(p.due_date);
    const key = isNaN(+d) ? null : d.toISOString().slice(0, 7);
    const m = months.find((x) => x.key === key);
    if (m) m.income += Number(p.amount || 0);
  });
  expenses.forEach((e) => {
    const d = new Date(e.expense_date);
    const key = isNaN(+d) ? null : d.toISOString().slice(0, 7);
    const m = months.find((x) => x.key === key);
    if (m) m.expense += Number(e.amount || 0);
  });
  const max = Math.max(1, ...months.map((m) => Math.max(m.income, m.expense)));
  const W = 320, H = 140, padX = 20, padY = 20, innerW = W - padX * 2, innerH = H - padY * 2;
  const groupW = innerW / months.length;
  const barW = groupW * 0.35;
  let out = '';
  months.forEach((m, i) => {
    const gx = padX + i * groupW;
    const incH = (m.income / max) * innerH;
    const expH = (m.expense / max) * innerH;
    out += `<rect x="${gx + 2}" y="${padY + innerH - incH}" width="${barW}" height="${incH}" rx="3" fill="#10b981" opacity="0.85"/>`;
    out += `<rect x="${gx + barW + 4}" y="${padY + innerH - expH}" width="${barW}" height="${expH}" rx="3" fill="#ef4444" opacity="0.75"/>`;
    out += `<text x="${gx + groupW / 2}" y="${H - 4}" text-anchor="middle" font-size="10" font-weight="600" fill="#9aa3b2">${m.label}</text>`;
  });
  svg.innerHTML = `${out}`;
}

function renderExpenseBreakdown(expenses, targetId) {
  const cats = {};
  const catIcons = { maintenance: '🔧', cleaning: '🧹', utility: '💡', insurance: '🛡️', supplies: '📦', other: '📎' };
  (expenses || []).forEach((e) => {
    const c = e.category || 'other';
    if (!cats[c]) cats[c] = 0;
    cats[c] += Number(e.amount || 0);
  });
  const total = Object.values(cats).reduce((a, b) => a + b, 0) || 1;
  const el = $(targetId);
  if (!el) return;
  el.innerHTML = Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([key, val], i) => {
    const pct = Math.round((val / total) * 100);
    return `<div class="method-row">
      <div class="mr-top"><b>${catIcons[key] || '💰'} ${t('expCat.' + key)}</b><span>${fmtMoney(val)} · ${pct}%</span></div>
      <div class="mr-bar"><div class="m-color-${(i % 5) + 1}" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

// ---- Tab 2: Payments (admin vs resident views) ----
function renderPaymentsTab() {
  const payments = appState.payments || [];
  const isVaad = ['vaad_admin', 'vaad_member', 'treasurer'].includes(appState.me?.user?.role);
  const myId = appState.me?.user?.id;
  const now = new Date();

  const inThisMonth = (p) => { const d = new Date(p.due_date); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); };
  const thisMonth = payments.filter(inThisMonth);
  const mPaid = thisMonth.filter((p) => p.status === 'paid');
  const mPending = thisMonth.filter((p) => p.status !== 'paid');

  // Collection bar (everyone sees this)
  const paidAmt = mPaid.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalAmt = thisMonth.reduce((s, p) => s + Number(p.amount || 0), 0);
  const paidPct = totalAmt ? Math.round((paidAmt / totalAmt) * 100) : 0;
  const pendPct = 100 - paidPct;
  $('fin-collection-bar').innerHTML = `
    <div class="fcb-stats">
      <span class="ok">✓ ${mPaid.length} ${t('fin.paid')}</span>
      <span class="warn">⏳ ${mPending.length} ${t('fin.waiting')}</span>
      <span class="danger">${fmtMoney(mPending.reduce((s, p) => s + Number(p.amount || 0), 0))} ${t('fin.owed')}</span>
    </div>
    <div class="fcb-progress">
      <div class="fcb-fill-paid" style="width:${paidPct}%"></div>
      <div class="fcb-fill-pending" style="width:${pendPct}%"></div>
    </div>
  `;

  // Resident personal status
  if (!isVaad) {
    const myPayments = thisMonth.filter((p) => p.resident_id === myId);
    const myPending = myPayments.filter((p) => p.status !== 'paid');
    const myPendingAmt = myPending.reduce((s, p) => s + Number(p.amount || 0), 0);
    $('fin-my-status').classList.remove('hidden');
    $('fin-my-status').innerHTML = `
      <div class="my-pay-card ${myPendingAmt > 0 ? 'has-pending' : 'all-paid'}">
        <div>
          <div class="my-pay-status">${myPendingAmt > 0 ? t('fin.youOwe') : t('fin.youPaid')}</div>
          <div class="my-pay-amount">${myPendingAmt > 0 ? fmtMoney(myPendingAmt) : '✓'}</div>
        </div>
        <div class="my-pay-status-icon">${myPendingAmt > 0 ? '⏳' : '🎉'}</div>
      </div>
    `;
  } else {
    $('fin-my-status').classList.add('hidden');
  }

  // Render payment list
  renderPaymentList();
}

function renderPaymentList() {
  const f = appState.paymentFilter;
  const isVaad = ['vaad_admin', 'vaad_member', 'treasurer'].includes(appState.me?.user?.role);
  let filtered = appState.payments.filter((p) => f === 'all' || p.status === f);
  // Residents only see their own
  if (!isVaad) filtered = filtered.filter((p) => p.resident_id === appState.me?.user?.id);
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

// ---- Tab 3: Public expenses ----
function renderExpensesPublic() {
  const expenses = appState.publicExpenses || [];
  const now = new Date();
  const thisMonthExp = expenses.filter((e) => { const d = new Date(e.expense_date); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); });
  const thisYearExp = expenses.filter((e) => { const d = new Date(e.expense_date); return d.getFullYear() === now.getFullYear(); });
  const monthTotal = thisMonthExp.reduce((s, e) => s + Number(e.amount || 0), 0);
  const yearTotal = thisYearExp.reduce((s, e) => s + Number(e.amount || 0), 0);
  const monthCount = new Set(expenses.map((e) => new Date(e.expense_date).toISOString().slice(0, 7))).size || 1;
  const avgMonthly = expenses.reduce((s, e) => s + Number(e.amount || 0), 0) / monthCount;

  $('fin-exp-month').textContent = fmtMoney(monthTotal);
  $('fin-exp-year').textContent = fmtMoney(yearTotal);
  $('fin-exp-avg').textContent = fmtMoney(avgMonthly);
  $('fin-exp-count').textContent = String(expenses.length);

  renderExpenseBreakdown(expenses, 'fin-exp-cat-bars');

  const catIcons = { maintenance: '🔧', cleaning: '🧹', utility: '💡', insurance: '🛡️', supplies: '📦', other: '📎' };
  const list = $('fin-expenses-list');
  if (!expenses.length) {
    list.innerHTML = `<div class="empty">${t('expense.emptyTitle')}</div>`;
    return;
  }
  list.innerHTML = expenses.map((e) => {
    const icon = catIcons[e.category] || '💰';
    return `
      <div class="exp-item">
        <div class="exp-head">
          <div style="display:flex;gap:10px;align-items:center;flex:1">
            ${e.receipt_data ? `<div class="exp-receipt-thumb" style="background-image:url('${e.receipt_data}')"></div>` : `<div class="exp-receipt-thumb" style="display:grid;place-items:center;font-size:22px">${icon}</div>`}
            <div style="flex:1">
              <div class="exp-title" dir="${dir(e.title)}">${escapeHtml(e.title)}</div>
              <div class="exp-meta">
                <span>${t('expCat.' + (e.category || 'other'))}</span>
                <span>📅 ${fmtDate(e.expense_date)}</span>
                <span>👤 ${escapeHtml(e.created_by_name || '—')}</span>
              </div>
            </div>
          </div>
          <div class="exp-amount">${fmtMoney(e.amount, e.currency)}</div>
        </div>
        ${e.notes ? `<div class="exp-meta" style="margin-top:6px" dir="${dir(e.notes)}">📝 ${escapeHtml(e.notes)}</div>` : ''}
      </div>
    `;
  }).join('');
}

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
  if (!filtered.length) {
    if (!q && appState.residents.length <= 1) {
      const code = appState.me?.building?.invite_code || '—';
      list.innerHTML = `
        <div class="empty-cta" style="grid-column:1/-1">
          <span class="emo">👥</span>
          <h4>${t('empty.firstResTitle')}</h4>
          <p>${t('empty.firstResSub')}</p>
          <div style="margin-top:6px"><span class="admin-building-code" style="font-size:13px">${escapeHtml(code)}</span></div>
        </div>`;
    } else {
      list.innerHTML = `<div class="empty">${t('res.empty')}</div>`;
    }
    return;
  }
  list.innerHTML = filtered.map(renderResident).join('');
}

$('res-search').addEventListener('input', (e) => {
  appState.residentSearch = e.target.value;
  renderResidentList();
});

// Invite sheet
$('invite-btn')?.addEventListener('click', () => {
  const code = appState.me?.building?.invite_code || '—';
  $('invite-code-big').textContent = code;
  $('invite-sheet').classList.remove('hidden');
});
$('invite-close')?.addEventListener('click', () => $('invite-sheet').classList.add('hidden'));
$('invite-sheet')?.addEventListener('click', (e) => { if (e.target.id === 'invite-sheet') e.currentTarget.classList.add('hidden'); });
$('invite-copy-btn')?.addEventListener('click', async () => {
  const code = $('invite-code-big').textContent;
  try { if (navigator.clipboard) await navigator.clipboard.writeText(code); toast(t('invite.copied') + ' ' + code); }
  catch { toast(code); }
});
$('invite-share-btn')?.addEventListener('click', async () => {
  const code = $('invite-code-big').textContent;
  const bld = appState.me?.building?.name || '';
  const msg = t('invite.shareMsg', { code, bld });
  if (navigator.share) {
    try { await navigator.share({ title: t('invite.title'), text: msg }); } catch {}
  } else {
    try { if (navigator.clipboard) await navigator.clipboard.writeText(msg); toast(t('profile.copied') + ' ' + code); } catch {}
  }
});

// ---------------- Management (payment rules / expenses / maintenance) ----------------
async function loadManagement() {
  // Default tab: rules
  if (!appState.mgmtTab) appState.mgmtTab = 'approvals';
  setMgmtTab(appState.mgmtTab);
  refreshApprovalBadges();
}

// ---- Approvals (vaad reviews new signups) ----
async function refreshApprovalBadges() {
  if (!isVaadRole()) return;
  try {
    const { residents } = await api('/api/residents/pending');
    const count = residents.length;
    const tabBadge = $('tab-mgmt-badge');
    const mgmtBadge = $('mgmt-approvals-badge');
    [tabBadge, mgmtBadge].forEach((el) => {
      if (!el) return;
      if (count > 0) {
        el.textContent = count > 99 ? '99+' : String(count);
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  } catch (e) { /* silent */ }
}

function isVaadRole() {
  const role = appState.me?.user?.role || '';
  return ['vaad_admin', 'vaad_member', 'treasurer'].includes(role);
}

async function loadApprovals() {
  const list = $('approvals-list');
  const empty = $('approvals-empty');
  if (!isVaadRole()) {
    empty.classList.remove('hidden');
    list.innerHTML = '';
    return;
  }
  try {
    const { residents } = await api('/api/residents/pending');
    if (!residents.length) {
      empty.classList.remove('hidden');
      list.innerHTML = '';
      refreshApprovalBadges();
      return;
    }
    empty.classList.add('hidden');
    const totalFloors = appState.me?.building?.total_floors || 10;
    list.innerHTML = residents.map((r) => {
      const initials = (r.full_name || '?').slice(0, 1);
      const phone = escapeHtml(r.phone_number || '');
      const apt = escapeHtml(r.apartment_number || '');
      const name = escapeHtml(r.full_name || '');
      const when = r.approval_requested_at ? niceTime(r.approval_requested_at) : '';
      const floorOpts = Array.from({ length: totalFloors }, (_, i) => `<option value="${i+1}">${t('common.floor') || 'קומה'} ${i+1}</option>`).join('');
      return `
        <div class="approval-card" data-id="${r.id}">
          <div class="approval-head">
            <div class="approval-avatar">${escapeHtml(initials)}</div>
            <div class="approval-info">
              <b>${name || t('approvals.unnamed') || 'ללא שם'}</b>
              <small>${phone}</small>
            </div>
            <div class="approval-time">${escapeHtml(when)}</div>
          </div>
          <div class="approval-edit">
            <input class="ap-name" placeholder="${t('approvals.namePh') || 'שם מלא'}" value="${name}" />
            <input class="ap-apt" placeholder="${t('approvals.aptPh') || 'דירה'}" value="${apt}" />
            <select class="ap-floor"><option value="">${t('approvals.floorPh') || 'קומה'}</option>${floorOpts}</select>
          </div>
          <div class="approval-actions">
            <button class="btn-reject" data-act="reject">${t('approvals.reject') || 'דחייה'}</button>
            <button class="btn-approve" data-act="approve">${t('approvals.approve') || 'אישור'}</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    toast(e.message);
  }
  refreshApprovalBadges();
}

// Minimal relative-time helper for the approvals list
function niceTime(iso) {
  try {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return t('time.justNow') || 'עכשיו';
    if (diff < 3600) return Math.floor(diff / 60) + (t('time.minAbbr') || ' דק׳');
    if (diff < 86400) return Math.floor(diff / 3600) + (t('time.hrAbbr') || ' שע׳');
    return Math.floor(diff / 86400) + (t('time.dayAbbr') || ' ימים');
  } catch { return ''; }
}

document.addEventListener('click', async (e) => {
  const card = e.target.closest('.approval-card');
  if (!card) return;
  const actBtn = e.target.closest('[data-act]');
  if (!actBtn) return;
  const id = card.dataset.id;
  const act = actBtn.dataset.act;
  card.classList.add('saving');
  try {
    if (act === 'approve') {
      const body = {
        full_name: card.querySelector('.ap-name')?.value.trim() || '',
        apartment_number: card.querySelector('.ap-apt')?.value.trim() || '',
        floor: card.querySelector('.ap-floor')?.value || null,
      };
      await api('/api/residents/' + id + '/approve', { method: 'POST', body: JSON.stringify(body) });
      toast(t('approvals.approvedOk') || 'דייר אושר ✓');
    } else if (act === 'reject') {
      if (!confirm(t('approvals.rejectConfirm') || 'לדחות את הבקשה?')) {
        card.classList.remove('saving');
        return;
      }
      await api('/api/residents/' + id + '/reject', { method: 'POST', body: JSON.stringify({}) });
      toast(t('approvals.rejectedOk') || 'הבקשה נדחתה');
    }
    loadApprovals();
  } catch (err) {
    toast(err.message);
    card.classList.remove('saving');
  }
});

// ==================== Admin: payments ====================
const admPay = { status: 'all', search: '', timer: null, selectedMethod: 'cash', currentId: null };

async function loadAdminPayments() {
  if (!isVaadRole()) return;
  await Promise.all([loadAdminPaymentsList(), loadAdminPaymentsStats()]);
}

async function loadAdminPaymentsStats() {
  try {
    const s = await api('/api/payments/stats');
    $('pay-stat-paid').textContent = fmtMoney(s.paid_this_month.total, 'ILS');
    $('pay-stat-pending').textContent = fmtMoney(s.pending.total, 'ILS');
    $('pay-stat-overdue').textContent = fmtMoney(s.overdue.total, 'ILS');
    $('pay-stat-pending-n').textContent = t('payAdm.countPayments', { n: s.pending.count });
    $('pay-stat-debtors').textContent = s.overdue.debtors > 0
      ? t('payAdm.debtors', { n: s.overdue.debtors })
      : '—';
    $('pay-stat-rate').textContent = s.collection_rate != null
      ? t('payAdm.collectRate', { n: s.collection_rate })
      : '—';
  } catch (e) { /* silent */ }
}

async function loadAdminPaymentsList() {
  const list = $('pay-adm-list');
  const empty = $('pay-adm-empty');
  try {
    const params = new URLSearchParams();
    if (admPay.status !== 'all') params.set('status', admPay.status);
    if (admPay.search) params.set('search', admPay.search);
    const res = await api('/api/payments' + (params.toString() ? '?' + params.toString() : ''));
    const rows = res.payments || [];
    if (rows.length === 0) {
      list.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    list.innerHTML = rows.map(renderAdminPaymentCard).join('');
  } catch (e) { toast(e.message); }
}

function fmtDate(s) {
  if (!s) return '';
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(store.lang === 'en' ? 'en-GB' : 'he-IL', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  } catch { return ''; }
}

function computeStatus(p) {
  if (p.status === 'paid') return 'paid';
  const today = new Date().toISOString().slice(0, 10);
  const due = (p.due_date || '').slice(0, 10);
  if (due && due < today) return 'overdue';
  return 'pending';
}

function renderAdminPaymentCard(p) {
  const status = computeStatus(p);
  const initials = (p.full_name || '?').slice(0, 1);
  const name = escapeHtml(p.full_name || t('approvals.unnamed'));
  const aptLabel = p.apartment_number
    ? `${t('payAdm.apt')} ${escapeHtml(p.apartment_number)}${p.floor ? ' · ' + t('common.floor') + ' ' + p.floor : ''}`
    : '';
  const desc = escapeHtml(p.description || '');
  const amount = fmtMoney(p.amount, p.currency || 'ILS');
  const typeLabel = p.payment_type === 'rule' ? t('payAdm.ruleLabel') : t('payAdm.oneTimeLabel');
  const dateLine = status === 'paid' && p.payment_date
    ? `${t('payAdm.paidOn')} ${fmtDate(p.payment_date)}`
    : `${t('payAdm.dueBy')} ${fmtDate(p.due_date)}`;
  const statusLabel = status === 'paid' ? t('payAdm.paidShort')
                    : status === 'overdue' ? t('payAdm.overdueShort')
                    : t('payAdm.pendingShort');

  const mainAction = status === 'paid'
    ? `<button class="btn-revert" data-act="revert">${t('payAdm.revert')}</button>`
    : `<button class="btn-mark-paid" data-act="paid">${t('payAdm.markPaid')}</button>`;

  return `
    <div class="pay-adm-card status-${status}" data-id="${p.id}" data-amount="${p.amount}" data-desc="${escapeHtml(p.description || '')}" data-due="${p.due_date || ''}" data-name="${name}">
      <div class="pay-adm-head">
        <div class="pay-adm-avatar">${escapeHtml(initials)}</div>
        <div class="pay-adm-info">
          <b>${name}</b>
          <small>${aptLabel}</small>
        </div>
        <div class="pay-adm-amount">
          <b>${amount}</b>
          <span class="pay-adm-status ${status}">${statusLabel}</span>
        </div>
      </div>
      <div class="pay-adm-meta">
        ${desc}<span class="dot">·</span>${typeLabel}<span class="dot">·</span>${dateLine}
      </div>
      <div class="pay-adm-actions">
        ${mainAction}
        <button class="btn-edit" data-act="edit" aria-label="${t('payAdm.edit')}">✏️</button>
        <button class="btn-delete" data-act="delete" aria-label="מחיקה">🗑️</button>
      </div>
    </div>
  `;
}

// Search input with debounce + status chips
$('pay-adm-search')?.addEventListener('input', (e) => {
  const v = e.target.value;
  admPay.search = v;
  $('pay-adm-clear')?.classList.toggle('hidden', !v);
  clearTimeout(admPay.timer);
  admPay.timer = setTimeout(() => loadAdminPaymentsList(), 220);
});
$('pay-adm-clear')?.addEventListener('click', () => {
  $('pay-adm-search').value = '';
  admPay.search = '';
  $('pay-adm-clear').classList.add('hidden');
  loadAdminPaymentsList();
});
document.querySelectorAll('.pay-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.pay-chip').forEach((c) => c.classList.toggle('active', c === chip));
    admPay.status = chip.dataset.pst;
    loadAdminPaymentsList();
  });
});

// Card actions: mark-paid / revert / edit / delete
document.addEventListener('click', async (e) => {
  const card = e.target.closest('.pay-adm-card');
  if (!card) return;
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const id = card.dataset.id;
  const act = btn.dataset.act;

  if (act === 'paid') return openMarkPaidSheet(id, card.dataset.name, card.dataset.desc);
  if (act === 'edit') return openEditSheet(id, card.dataset.desc, card.dataset.amount, card.dataset.due);
  if (act === 'revert') {
    card.classList.add('saving');
    try {
      await api('/api/payments/' + id + '/mark-pending', { method: 'POST' });
      toast(t('payAdm.revertOk'));
      loadAdminPayments();
    } catch (err) { toast(err.message); card.classList.remove('saving'); }
    return;
  }
  if (act === 'delete') {
    if (!confirm(t('payAdm.deleteConfirm'))) return;
    card.classList.add('saving');
    try {
      await api('/api/payments/' + id, { method: 'DELETE' });
      toast(t('payAdm.deletedOk'));
      loadAdminPayments();
    } catch (err) { toast(err.message); card.classList.remove('saving'); }
    return;
  }
});

// Mark-paid sheet
function openMarkPaidSheet(id, name, desc) {
  admPay.currentId = id;
  admPay.selectedMethod = 'cash';
  document.querySelectorAll('.pay-method').forEach((m) => m.classList.toggle('active', m.dataset.pm === 'cash'));
  $('pay-paid-target').textContent = `${name || ''} — ${desc || ''}`.trim().replace(/^—\s*/, '');
  $('pay-paid-date').value = new Date().toISOString().slice(0, 10);
  $('pay-paid-note').value = '';
  $('pay-paid-sheet').classList.remove('hidden');
}
document.querySelectorAll('.pay-method').forEach((m) => {
  m.addEventListener('click', () => {
    admPay.selectedMethod = m.dataset.pm;
    document.querySelectorAll('.pay-method').forEach((x) => x.classList.toggle('active', x === m));
  });
});
$('pay-paid-cancel')?.addEventListener('click', () => $('pay-paid-sheet').classList.add('hidden'));
$('pay-paid-save')?.addEventListener('click', async () => {
  if (!admPay.currentId) return;
  const btn = $('pay-paid-save');
  btn.disabled = true;
  try {
    await api('/api/payments/' + admPay.currentId + '/mark-paid', {
      method: 'POST',
      body: JSON.stringify({
        payment_method: admPay.selectedMethod,
        payment_date: $('pay-paid-date').value || null,
        note: $('pay-paid-note').value.trim() || null,
      }),
    });
    $('pay-paid-sheet').classList.add('hidden');
    toast(t('payAdm.paidOk'));
    loadAdminPayments();
  } catch (e) {
    toast(e.message);
  } finally {
    btn.disabled = false;
  }
});

// Edit sheet
function openEditSheet(id, desc, amount, due) {
  admPay.currentId = id;
  $('pay-edit-desc').value = desc || '';
  $('pay-edit-amount').value = amount || '';
  $('pay-edit-due').value = (due || '').slice(0, 10);
  $('pay-edit-sheet').classList.remove('hidden');
}
$('pay-edit-cancel')?.addEventListener('click', () => $('pay-edit-sheet').classList.add('hidden'));
$('pay-edit-save')?.addEventListener('click', async () => {
  if (!admPay.currentId) return;
  const btn = $('pay-edit-save');
  btn.disabled = true;
  try {
    await api('/api/payments/' + admPay.currentId, {
      method: 'PATCH',
      body: JSON.stringify({
        description: $('pay-edit-desc').value.trim() || undefined,
        amount: $('pay-edit-amount').value ? Number($('pay-edit-amount').value) : undefined,
        due_date: $('pay-edit-due').value || undefined,
      }),
    });
    $('pay-edit-sheet').classList.add('hidden');
    toast(t('payAdm.savedOk'));
    loadAdminPayments();
  } catch (e) {
    toast(e.message);
  } finally {
    btn.disabled = false;
  }
});

function setMgmtTab(tab) {
  appState.mgmtTab = tab;
  document.querySelectorAll('.mgmt-tab').forEach((b) => b.classList.toggle('active', b.dataset.mt === tab));
  ['approvals', 'payments', 'rules', 'expenses', 'maintenance'].forEach((k) => {
    $('mgmt-' + k)?.classList.toggle('hidden', k !== tab);
  });
  if (tab === 'approvals') loadApprovals();
  if (tab === 'payments') loadAdminPayments();
  if (tab === 'rules') loadPaymentRules();
  if (tab === 'expenses') loadExpenses();
  if (tab === 'maintenance') loadMaintenance();
}
document.querySelectorAll('.mgmt-tab').forEach((b) => b.addEventListener('click', () => setMgmtTab(b.dataset.mt)));
$('open-mgmt-btn')?.addEventListener('click', () => show('management'));
$('open-docs-btn')?.addEventListener('click', () => show('documents'));
$('open-contractors-btn')?.addEventListener('click', () => show('contractors'));
$('open-audit-btn')?.addEventListener('click', () => show('audit'));
$('open-emergency-btn')?.addEventListener('click', openEmergencySheet);

// ---- Payment Rules ----
async function loadPaymentRules() {
  try {
    const { rules } = await api('/api/finance/payment-rules');
    appState.rules = rules;
    const list = $('rules-list');
    if (!rules.length) {
      list.innerHTML = `<div class="empty-cta"><span class="emo">💳</span><h4>${t('rule.emptyTitle')}</h4><p>${t('rule.emptySub')}</p></div>`;
      return;
    }
    list.innerHTML = rules.map((r) => `
      <div class="rule-item" data-rule-id="${escapeAttr(r.id)}">
        <div class="rule-head">
          <div>
            <div class="rule-name" dir="${dir(r.name)}">${escapeHtml(r.name)}</div>
            ${r.description ? `<div class="rule-meta" dir="${dir(r.description)}">${escapeHtml(r.description)}</div>` : ''}
            <div class="rule-meta">
              <span class="rule-freq">${t('freq.' + (r.frequency === 'one_time' ? 'onetime' : r.frequency))}</span>
              ${r.day_of_month ? `<span>${t('rule.domLabel')} ${r.day_of_month}</span>` : ''}
              ${r.applies_to === 'all' ? `<span>${t('rule.allResidents')}</span>` : `<span>🎯 ${(() => { try { const ids = JSON.parse(r.applies_to); return t('rule.audSummaryRes', { n: ids.length }); } catch { return ''; } })()}</span>`}
            </div>
          </div>
          <div class="rule-amount">${fmtMoney(r.amount, r.currency)}</div>
        </div>
        <div class="rule-actions">
          <button class="apply" data-act="apply">${t('rule.applyNow')}</button>
          <button class="del" data-act="del">${t('common.delete')}</button>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('.rule-item').forEach((el) => {
      const id = el.dataset.ruleId;
      el.querySelector('[data-act="apply"]').addEventListener('click', async (ev) => {
        const btn = ev.currentTarget;
        // Guard against double-tap: disable the button for the life of the
        // request so a frustrated second click cannot create duplicate
        // payment rows.
        if (btn.dataset.busy === '1') return;
        btn.dataset.busy = '1';
        btn.disabled = true;
        const origLabel = btn.textContent;
        btn.textContent = t('common.applying') || '...';
        try {
          const res = await api('/api/finance/payment-rules/' + id + '/apply', { method: 'POST' });
          toast(t('rule.applied', { n: res.created }));
        } catch (e) {
          toast(e.message);
        } finally {
          btn.dataset.busy = '0';
          btn.disabled = false;
          btn.textContent = origLabel;
        }
      });
      el.querySelector('[data-act="del"]').addEventListener('click', async () => {
        if (!confirm(t('common.confirmDelete'))) return;
        try {
          await api('/api/finance/payment-rules/' + id, { method: 'DELETE' });
          toast(t('common.deleted'));
          loadPaymentRules();
        } catch (e) { toast(e.message); }
      });
    });
  } catch (e) { console.error(e); }
}

$('rule-new-btn')?.addEventListener('click', () => {
  $('rule-new-form').classList.toggle('hidden');
  if (!$('rule-new-form').classList.contains('hidden')) initAudiencePicker();
});
$('r-cancel')?.addEventListener('click', () => $('rule-new-form').classList.add('hidden'));

// ---- Audience picker state ----
const audState = { mode: 'all', selectedFloors: new Set(), selectedApts: new Set(), selectedResidents: new Set() };

function initAudiencePicker() {
  audState.mode = 'all';
  audState.selectedFloors.clear();
  audState.selectedApts.clear();
  audState.selectedResidents.clear();
  document.querySelectorAll('.aud-mode').forEach((b) => b.classList.toggle('active', b.dataset.mode === 'all'));
  ['aud-floors-picker', 'aud-apts-picker', 'aud-residents-picker'].forEach((id) => $(id)?.classList.add('hidden'));
  updateAudSummary();

  const residents = appState.residents || [];
  // Build floor chips from building total_floors
  const totalFloors = appState.me?.building?.total_floors || 10;
  const floors = [];
  for (let i = 1; i <= totalFloors; i++) floors.push(i);
  $('aud-floor-chips').innerHTML = floors.map((f) => `<div class="aud-chip" data-floor="${f}">${t('rule.floor')} ${f}</div>`).join('');
  $('aud-floor-chips').querySelectorAll('.aud-chip').forEach((c) => {
    c.addEventListener('click', () => {
      const f = Number(c.dataset.floor);
      if (audState.selectedFloors.has(f)) audState.selectedFloors.delete(f);
      else audState.selectedFloors.add(f);
      c.classList.toggle('selected', audState.selectedFloors.has(f));
      updateAudSummary();
    });
  });

  // Build apartment chips
  const apts = [...new Set(residents.map((r) => r.apartment_number).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  $('aud-apt-chips').innerHTML = apts.map((a) => `<div class="aud-chip" data-apt="${escapeAttr(a)}">${t('rule.apt')} ${escapeHtml(a)}</div>`).join('');
  $('aud-apt-chips').querySelectorAll('.aud-chip').forEach((c) => {
    c.addEventListener('click', () => {
      const a = c.dataset.apt;
      if (audState.selectedApts.has(a)) audState.selectedApts.delete(a);
      else audState.selectedApts.add(a);
      c.classList.toggle('selected', audState.selectedApts.has(a));
      updateAudSummary();
    });
  });

  // Build resident list
  renderAudResidentList('');
  $('aud-res-search')?.addEventListener('input', (e) => renderAudResidentList(e.target.value));
}

function renderAudResidentList(query) {
  const residents = appState.residents || [];
  const q = (query || '').toLowerCase();
  const filtered = q ? residents.filter((r) => (r.full_name || '').toLowerCase().includes(q) || String(r.apartment_number || '').includes(q)) : residents;
  $('aud-res-list').innerHTML = filtered.map((r) => `
    <div class="aud-res-row ${audState.selectedResidents.has(r.id) ? 'selected' : ''}" data-res-id="${escapeAttr(r.id)}">
      <div class="aud-check"></div>
      <div class="aud-res-info">
        <b>${escapeHtml(r.full_name || '—')}</b>
        <small>${t('rule.apt')} ${escapeHtml(r.apartment_number || '?')} · ${escapeHtml(r.role || '')}</small>
      </div>
    </div>
  `).join('');
  $('aud-res-list').querySelectorAll('.aud-res-row').forEach((row) => {
    row.addEventListener('click', () => {
      const id = row.dataset.resId;
      if (audState.selectedResidents.has(id)) audState.selectedResidents.delete(id);
      else audState.selectedResidents.add(id);
      row.classList.toggle('selected', audState.selectedResidents.has(id));
      updateAudSummary();
    });
  });
}

function updateAudSummary() {
  const el = $('aud-summary');
  if (audState.mode === 'all') { el.textContent = t('rule.audSummaryAll'); return; }
  if (audState.mode === 'floors') {
    const n = audState.selectedFloors.size;
    el.textContent = n ? t('rule.audSummaryFloors', { n }) : t('rule.audSummaryNone');
    return;
  }
  if (audState.mode === 'apts') {
    const n = audState.selectedApts.size;
    el.textContent = n ? t('rule.audSummaryApts', { n }) : t('rule.audSummaryNone');
    return;
  }
  if (audState.mode === 'residents') {
    const n = audState.selectedResidents.size;
    el.textContent = n ? t('rule.audSummaryRes', { n }) : t('rule.audSummaryNone');
    return;
  }
}

function getAudiencePayload() {
  if (audState.mode === 'all') return 'all';
  if (audState.mode === 'floors') {
    // Resolve floor numbers to resident IDs using resident.floor or computed from apt
    const ids = (appState.residents || [])
      .filter((r) => {
        const floor = r.floor || Math.ceil(Number(r.apartment_number || 0) / 4);
        return audState.selectedFloors.has(floor);
      })
      .map((r) => r.id);
    return ids.length ? ids : 'all';
  }
  if (audState.mode === 'apts') {
    const ids = (appState.residents || [])
      .filter((r) => audState.selectedApts.has(String(r.apartment_number)))
      .map((r) => r.id);
    return ids.length ? ids : 'all';
  }
  if (audState.mode === 'residents') {
    return audState.selectedResidents.size ? [...audState.selectedResidents] : 'all';
  }
  return 'all';
}

document.querySelectorAll('.aud-mode').forEach((b) => {
  b.addEventListener('click', () => {
    audState.mode = b.dataset.mode;
    document.querySelectorAll('.aud-mode').forEach((x) => x.classList.toggle('active', x === b));
    ['aud-floors-picker', 'aud-apts-picker', 'aud-residents-picker'].forEach((id) => $(id)?.classList.add('hidden'));
    if (audState.mode === 'floors') $('aud-floors-picker').classList.remove('hidden');
    if (audState.mode === 'apts') $('aud-apts-picker').classList.remove('hidden');
    if (audState.mode === 'residents') $('aud-residents-picker').classList.remove('hidden');
    updateAudSummary();
  });
});

$('r-submit')?.addEventListener('click', async () => {
  const payload = {
    name: $('r-name').value.trim(),
    description: $('r-desc').value.trim() || null,
    amount: Number($('r-amount').value),
    frequency: $('r-freq').value,
    day_of_month: $('r-dom').value ? Number($('r-dom').value) : null,
    applies_to: getAudiencePayload(),
  };
  if (!payload.name || !payload.amount || !payload.frequency) return toast(t('admin.needAllFields'));
  try {
    await api('/api/finance/payment-rules', { method: 'POST', body: JSON.stringify(payload) });
    ['r-name', 'r-desc', 'r-amount', 'r-dom'].forEach((id) => ($(id).value = ''));
    $('rule-new-form').classList.add('hidden');
    loadPaymentRules();
    toast(t('rule.savedOk'));
  } catch (e) { toast(e.message); }
});

// ---- Expenses ----
async function loadExpenses() {
  try {
    const { expenses } = await api('/api/finance/expenses');
    appState.expenses = expenses;
    const now = new Date();
    const thisMonth = expenses.filter((e) => { const d = new Date(e.expense_date); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); });
    const thisYear = expenses.filter((e) => { const d = new Date(e.expense_date); return d.getFullYear() === now.getFullYear(); });
    $('exp-total-month').textContent = fmtMoney(thisMonth.reduce((s, e) => s + Number(e.amount || 0), 0));
    $('exp-total-year').textContent = fmtMoney(thisYear.reduce((s, e) => s + Number(e.amount || 0), 0));
    const list = $('expenses-list');
    if (!expenses.length) {
      list.innerHTML = `<div class="empty-cta"><span class="emo">🧾</span><h4>${t('expense.emptyTitle')}</h4><p>${t('expense.emptySub')}</p></div>`;
      return;
    }
    list.innerHTML = expenses.map((e) => {
      const icon = { maintenance: '🔧', cleaning: '🧹', utility: '💡', insurance: '🛡️', supplies: '📦', other: '📎' }[e.category] || '💰';
      const catLabel = t('expCat.' + (e.category || 'other'));
      return `
        <div class="exp-item" data-exp-id="${escapeAttr(e.id)}">
          <div class="exp-head">
            <div style="display:flex;gap:10px;align-items:center;flex:1">
              ${e.receipt_data ? `<div class="exp-receipt-thumb" style="background-image:url('${e.receipt_data}')"></div>` : `<div class="exp-receipt-thumb" style="display:grid;place-items:center;font-size:22px">${icon}</div>`}
              <div style="flex:1">
                <div class="exp-title" dir="${dir(e.title)}">${escapeHtml(e.title)}</div>
                <div class="exp-meta">
                  <span>${escapeHtml(catLabel.replace(/^[\\p{Emoji}\\s]+/u, ''))}</span>
                  <span>📅 ${fmtDate(e.expense_date)}</span>
                  <span>👤 ${escapeHtml(e.created_by_name || '—')}</span>
                </div>
              </div>
            </div>
            <div class="exp-amount">${fmtMoney(e.amount, e.currency)}</div>
          </div>
          ${e.notes ? `<div class="exp-meta" style="margin-top:8px" dir="${dir(e.notes)}">📝 ${escapeHtml(e.notes)}</div>` : ''}
        </div>
      `;
    }).join('');
  } catch (e) { console.error(e); }
}

$('exp-new-btn')?.addEventListener('click', () => $('exp-new-form').classList.toggle('hidden'));
$('e-cancel')?.addEventListener('click', () => { $('exp-new-form').classList.add('hidden'); $('e-receipt-preview').classList.add('hidden'); });
$('e-receipt')?.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 1_200_000) return toast(t('expense.fileTooLarge'));
  const reader = new FileReader();
  reader.onload = () => {
    appState.receiptData = reader.result;
    $('e-receipt-preview').classList.remove('hidden');
    $('e-receipt-preview').innerHTML = `<img src="${reader.result}" alt="receipt" />`;
  };
  reader.readAsDataURL(file);
});
$('e-submit')?.addEventListener('click', async () => {
  const payload = {
    title: $('e-title').value.trim(),
    amount: Number($('e-amount').value),
    category: $('e-category').value,
    expense_date: $('e-date').value || new Date().toISOString().slice(0, 10),
    notes: $('e-notes').value.trim() || null,
    receipt_data: appState.receiptData || null,
  };
  if (!payload.title || !payload.amount) return toast(t('admin.needAllFields'));
  try {
    await api('/api/finance/expenses', { method: 'POST', body: JSON.stringify(payload) });
    ['e-title', 'e-amount', 'e-date', 'e-notes'].forEach((id) => ($(id).value = ''));
    appState.receiptData = null;
    $('e-receipt-preview').classList.add('hidden');
    $('e-receipt').value = '';
    $('exp-new-form').classList.add('hidden');
    loadExpenses();
    toast(t('expense.savedOk'));
  } catch (e) { toast(e.message); }
});

// ---- Maintenance ----
async function loadMaintenance() {
  try {
    const { tasks } = await api('/api/maintenance');
    appState.maintenance = tasks;
    const list = $('maintenance-list');
    if (!tasks.length) {
      list.innerHTML = `<div class="empty-cta"><span class="emo">🛠️</span><h4>${t('mt.emptyTitle')}</h4><p>${t('mt.emptySub')}</p></div>`;
      return;
    }
    const now = new Date();
    list.innerHTML = tasks.map((tk) => {
      const icon = { elevator: '🛗', plumbing: '🚿', electrical: '💡', cleaning: '🧹', other: '📦' }[tk.category] || '🛠️';
      const due = new Date(tk.next_due);
      const daysUntil = Math.round((due - now) / (1000 * 60 * 60 * 24));
      let cls = '';
      if (daysUntil < 0) cls = 'overdue';
      else if (daysUntil <= tk.reminder_days_before) cls = 'soon';
      return `
        <div class="mt-item" data-mt-id="${escapeAttr(tk.id)}">
          <div class="mt-head">
            <div>
              <div class="mt-title" dir="${dir(tk.title)}">${icon} ${escapeHtml(tk.title)}</div>
              ${tk.description ? `<div class="mt-meta" dir="${dir(tk.description)}">${escapeHtml(tk.description)}</div>` : ''}
              <div class="mt-meta">
                <span class="mt-freq">${t('freq.' + tk.frequency)}</span>
                ${tk.last_done ? `<span>✓ ${t('mt.lastDone')}: ${fmtDate(tk.last_done)}</span>` : ''}
              </div>
            </div>
            <div class="mt-next-due ${cls}">${daysUntil < 0 ? t('mt.overdueBy', { n: Math.abs(daysUntil) }) : t('mt.dueIn', { n: daysUntil })}</div>
          </div>
          <div class="mt-actions">
            <button class="done" data-act="done">${t('mt.markDone')}</button>
            <button class="del" data-act="del">${t('common.delete')}</button>
          </div>
        </div>
      `;
    }).join('');
    list.querySelectorAll('.mt-item').forEach((el) => {
      const id = el.dataset.mtId;
      el.querySelector('[data-act="done"]').addEventListener('click', async () => {
        try {
          await api('/api/maintenance/' + id + '/done', { method: 'POST' });
          toast(t('mt.doneOk'));
          loadMaintenance();
        } catch (e) { toast(e.message); }
      });
      el.querySelector('[data-act="del"]').addEventListener('click', async () => {
        if (!confirm(t('common.confirmDelete'))) return;
        try {
          await api('/api/maintenance/' + id, { method: 'DELETE' });
          loadMaintenance();
          toast(t('common.deleted'));
        } catch (e) { toast(e.message); }
      });
    });
    // Reminders: notify for any task due within reminder_days_before
    checkMaintenanceReminders(tasks);
  } catch (e) { console.error(e); }
}

function checkMaintenanceReminders(tasks) {
  const now = new Date();
  const remindedKey = 'vaad_mt_reminded';
  const reminded = JSON.parse(localStorage.getItem(remindedKey) || '{}');
  let changed = false;
  (tasks || []).forEach((tk) => {
    if (!tk.active) return;
    const due = new Date(tk.next_due);
    const daysUntil = (due - now) / (1000 * 60 * 60 * 24);
    if (daysUntil <= tk.reminder_days_before && daysUntil >= -1 && !reminded[tk.id + tk.next_due]) {
      sendLocalNotification(t('mt.reminderTitle'), tk.title + ' · ' + t('mt.dueIn', { n: Math.max(0, Math.round(daysUntil)) }));
      reminded[tk.id + tk.next_due] = Date.now();
      changed = true;
    }
  });
  if (changed) localStorage.setItem(remindedKey, JSON.stringify(reminded));
}

$('mt-new-btn')?.addEventListener('click', () => $('mt-new-form').classList.toggle('hidden'));
$('m-cancel')?.addEventListener('click', () => $('mt-new-form').classList.add('hidden'));
$('m-submit')?.addEventListener('click', async () => {
  const payload = {
    title: $('m-title').value.trim(),
    description: $('m-desc').value.trim() || null,
    category: $('m-category').value,
    frequency: $('m-freq').value,
    next_due: $('m-next').value || null,
    reminder_days_before: Number($('m-reminder').value || 3),
  };
  if (!payload.title || !payload.frequency) return toast(t('admin.needAllFields'));
  try {
    await api('/api/maintenance', { method: 'POST', body: JSON.stringify(payload) });
    ['m-title', 'm-desc', 'm-next'].forEach((id) => ($(id).value = ''));
    $('m-reminder').value = '3';
    $('mt-new-form').classList.add('hidden');
    loadMaintenance();
    toast(t('mt.savedOk'));
  } catch (e) { toast(e.message); }
});

// ---------------- Super Admin ----------------
async function loadAdminBuildings() {
  try {
    const { buildings } = await api('/api/admin/buildings');
    appState.buildings = buildings;
    const list = $('admin-buildings-list');
    list.innerHTML = buildings.length ? buildings.map((b) => `
      <div class="admin-building" data-building-id="${escapeAttr(b.id)}">
        <div class="admin-building-head">
          <div>
            <div class="admin-building-name" dir="${dir(b.name)}">🏢 ${escapeHtml(b.name)}</div>
            <div class="admin-building-addr" dir="${dir(b.address)}">${escapeHtml(b.address)}, ${escapeHtml(b.city)}</div>
          </div>
          <span class="admin-building-code">${escapeHtml(b.invite_code)}</span>
        </div>
        <div class="admin-building-stats">
          <div><b>${b.total_apartments}</b><small>${t('home.stat.apts')}</small></div>
          <div><b>${b.resident_count}</b><small>${t('home.stat.residents')}</small></div>
          <div><b>${b.ticket_count}</b><small>${t('nav.tickets')}</small></div>
          <div><b>${b.announcement_count}</b><small>${t('nav.announcements')}</small></div>
        </div>
      </div>
    `).join('') : `<div class="empty">${t('admin.noBuildings')}</div>`;
  } catch (e) {
    console.error(e);
    toast(e.message);
  }
}

$('admin-new-btn')?.addEventListener('click', () => {
  $('admin-new-form').classList.toggle('hidden');
});
$('adm-cancel')?.addEventListener('click', () => $('admin-new-form').classList.add('hidden'));
$('adm-submit')?.addEventListener('click', async () => {
  const payload = {
    name: $('adm-name').value.trim(),
    address: $('adm-address').value.trim(),
    city: $('adm-city').value.trim(),
    total_floors: Number($('adm-floors').value || 0),
    total_apartments: Number($('adm-apts').value || 0),
    invite_code: $('adm-code').value.trim().toUpperCase(),
    admin_name: $('adm-admin-name').value.trim(),
    admin_phone: $('adm-admin-phone').value.trim(),
    admin_apartment: $('adm-admin-apt').value.trim() || '1',
  };
  if (!payload.name || !payload.address || !payload.city || !payload.total_apartments || !payload.invite_code || !payload.admin_name || !payload.admin_phone) {
    return toast(t('admin.needAllFields'));
  }
  try {
    const res = await api('/api/admin/buildings', { method: 'POST', body: JSON.stringify(payload) });
    // Show onboarding success page
    $('onb-building').textContent = res.building.name;
    $('onb-code').textContent = res.building.invite_code;
    $('onb-admin-name').textContent = res.admin.name;
    $('onb-admin-phone').textContent = res.admin.phone;
    appState.lastCreatedAdminPhone = res.admin.phone;
    // Reset form
    ['adm-name', 'adm-address', 'adm-city', 'adm-floors', 'adm-apts', 'adm-code', 'adm-admin-name', 'adm-admin-phone', 'adm-admin-apt'].forEach((id) => ($(id).value = ''));
    $('admin-new-form').classList.add('hidden');
    show('onboarded');
  } catch (e) { toast(e.message); }
});

$('onb-back-btn')?.addEventListener('click', () => show('admin'));
$('onb-login-btn')?.addEventListener('click', async () => {
  const phone = appState.lastCreatedAdminPhone;
  if (!phone) return toast(t('admin.noPhone'));
  try {
    // Generate OTP via super-admin dev endpoint, then verify
    const { code } = await api('/api/admin/login-as', { method: 'POST', body: JSON.stringify({ phone_number: phone }) });
    // Log out current user by clearing token
    store.token = null; store.user = null; appState.me = null;
    // Verify the new OTP
    const res = await api('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: phone, code }),
    });
    store.token = res.accessToken;
    store.user = res.user;
    navStack = [];
    // Clear state from previous session
    appState.announcements = [];
    appState.tickets = [];
    appState.payments = [];
    appState.residents = [];
    appState.polls = [];
    await enterDashboard();
    toast(t('onboard.welcomeNewBuilding'));
  } catch (e) { toast(e.message); }
});

// Switch user (super admin dev tool)
async function openSwitchUserSheet() {
  const sheet = $('switch-user-sheet');
  sheet.classList.remove('hidden');
  // Get all residents across all buildings (via admin buildings + residents)
  try {
    const { buildings } = await api('/api/admin/buildings');
    // For each building, fetch residents. Simpler: use /api/residents but that's scoped. Instead use a dev approach:
    // For now, list all seeded users from current building + known phones
    const list = $('switch-user-list');
    // Get current-building residents via /api/residents
    const { residents } = await api('/api/residents');
    // Also add admins of other buildings (we don't have a cross-building residents endpoint,
    // but we can list the admins from the buildings list's first admin heuristic — skip for simplicity
    // and just show current building residents + known seeded users)
    list.innerHTML = residents.map((r) => `
      <div class="switch-user" data-phone="${escapeAttr(r.phone_number)}">
        <div class="avatar" style="background:${avatarColor(r.full_name)}">${initials(r.full_name)}</div>
        <div class="switch-user-meta">
          <div class="switch-user-name" dir="${dir(r.full_name)}">${escapeHtml(r.full_name)}</div>
          <div class="switch-user-sub">${escapeHtml(r.phone_number)} · ${t('role.' + (r.role || 'resident'))}</div>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('.switch-user').forEach((el) => {
      el.addEventListener('click', () => switchUser(el.dataset.phone));
    });
  } catch (e) { toast(e.message); }
}

async function switchUser(phone) {
  try {
    const { code } = await api('/api/admin/login-as', { method: 'POST', body: JSON.stringify({ phone_number: phone }) });
    store.token = null; store.user = null; appState.me = null;
    const res = await api('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: phone, code }),
    });
    store.token = res.accessToken;
    store.user = res.user;
    navStack = [];
    appState.announcements = []; appState.tickets = []; appState.payments = []; appState.residents = []; appState.polls = [];
    $('switch-user-sheet').classList.add('hidden');
    await enterDashboard();
    toast(t('switch.switched'));
  } catch (e) { toast(e.message); }
}

$('open-admin-btn')?.addEventListener('click', () => show('admin'));
$('switch-user-btn')?.addEventListener('click', openSwitchUserSheet);
$('switch-user-cancel')?.addEventListener('click', () => $('switch-user-sheet').classList.add('hidden'));

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
    const aptNum = Number(user?.apartment_number || 0);
    const floorNum = user?.floor || (aptNum > 0 ? Math.ceil(aptNum / 4) : null);
    $('profile-floor').textContent = floorNum ? t('rule.floor') + ' ' + floorNum : '';
    $('profile-floor').style.display = floorNum ? '' : 'none';
    $('profile-apt').textContent = t('common.apartment') + ' ' + (user?.apartment_number || '—');
    // Show super-admin group if applicable
    $('super-admin-group').classList.toggle('hidden', !user?.is_super_admin);
    // Show vaad-mgmt group for vaad members/admin/treasurer
    const isVaad = ['vaad_admin', 'vaad_member', 'treasurer'].includes(user?.role);
    $('vaad-mgmt-group').classList.toggle('hidden', !isVaad);
    $('vaad-export-group')?.classList.toggle('hidden', !isVaad);
    // Hide vaad-only icon buttons from non-vaad users
    document.querySelectorAll('[data-vaad-only]').forEach((el) => {
      el.style.display = isVaad ? '' : 'none';
    });
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
$('replay-tour-btn')?.addEventListener('click', () => { localStorage.removeItem('vaad_tour_done'); startTour(); });
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
  $('phone-device').style.width = '390px';
  $('screen').style.height = '812px';
});
$('device-pixel').addEventListener('click', () => {
  $('stage').classList.remove('fullscreen');
  $('phone-device').style.width = '412px';
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

// ============================================================
// v2 production features: docs, contractors, audit, emergency,
// skeletons, PTR, haptics, install, offline, legal, danger zone
// ============================================================

// Haptic helper (uses navigator.vibrate — free on Android, silent on iOS)
function haptic(ms = 10) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch {}
}

// Celebratory success animation shown on important actions
function celebrate(msg) {
  const burst = document.createElement('div');
  burst.className = 'success-burst';
  burst.innerHTML = '<div class="check">✓</div>';
  document.getElementById('app-scroll')?.appendChild(burst);
  haptic([30, 40, 30]);
  setTimeout(() => burst.remove(), 900);
  if (msg) setTimeout(() => toast(msg), 200);
}

// Generic skeleton loader. Useful while lists are loading.
function skeletonList(count = 3) {
  return Array.from({ length: count }, () =>
    `<div class="skel-card">
       <div class="skel skel-line w80"></div>
       <div class="skel skel-line w60"></div>
       <div class="skel skel-line w40"></div>
     </div>`
  ).join('');
}

// Offline detection — show a small banner when offline
function setupOfflineBar() {
  let bar = document.getElementById('offline-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'offline-bar';
    bar.className = 'offline-bar';
    bar.textContent = '⚠️ מצב לא מקוון — חלק מהפעולות לא יהיו זמינות';
    const screen = document.querySelector('.phone-screen');
    (screen || document.body).appendChild(bar);
  }
  const update = () => bar.classList.toggle('visible', !navigator.onLine);
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

// PWA install banner
function setupInstallBanner() {
  document.addEventListener('pwa-installable', () => {
    const banner = $('install-banner');
    if (banner) banner.classList.remove('hidden');
  });
  $('install-btn')?.addEventListener('click', async () => {
    const prompt = window.__installPrompt;
    if (!prompt) return;
    prompt.prompt();
    try {
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        $('install-banner')?.classList.add('hidden');
        celebrate(t('install.done'));
      }
    } catch {}
    window.__installPrompt = null;
  });
}

// ---------------- Documents vault ----------------
async function loadDocuments() {
  const list = $('documents-list');
  list.innerHTML = skeletonList(3);
  try {
    const { documents } = await api('/api/v1/documents');
    appState.documents = documents;
    renderDocuments();
  } catch (e) {
    list.innerHTML = `<div class="empty-cta"><span class="emo">⚠️</span><h4>${t('err.loadFailed')}</h4><p>${escapeHtml(e.message)}</p><button class="btn-primary" onclick="loadDocuments()">${t('common.retry')}</button></div>`;
  }
}

function renderDocuments() {
  const list = $('documents-list');
  const search = ($('doc-search')?.value || '').toLowerCase().trim();
  const docs = (appState.documents || []).filter((d) =>
    !search || d.title.toLowerCase().includes(search) || (d.notes || '').toLowerCase().includes(search)
  );
  if (!docs.length) {
    list.innerHTML = `<div class="empty-cta"><span class="emo">📁</span><h4>${t('docs.emptyTitle')}</h4><p>${t('docs.emptySub')}</p></div>`;
    return;
  }
  const isVaad = ['vaad_admin', 'vaad_member', 'treasurer'].includes(appState.me?.user?.role);
  const iconFor = { insurance: '🛡️', contract: '📄', regulations: '📜', plans: '📐', invoice: '🧾', legal: '⚖️', other: '📎' };
  list.innerHTML = docs.map((d) => `
    <div class="doc-item" data-id="${escapeAttr(d.id)}">
      <div class="doc-icon">${iconFor[d.category] || '📁'}</div>
      <div class="doc-body">
        <div class="doc-title" dir="${dir(d.title)}">${escapeHtml(d.title)}</div>
        <div class="doc-meta">
          <span class="doc-cat">${t('docCat.' + (d.category || 'other'))}</span>
          ${d.size_bytes ? `<span>${Math.round(d.size_bytes / 1024)} KB</span>` : ''}
          <span>👤 ${escapeHtml(d.uploaded_by_name || '—')}</span>
        </div>
      </div>
      <div class="doc-actions">
        <button class="doc-act" data-act="view" title="${t('docs.view')}">👁</button>
        ${isVaad ? `<button class="doc-act danger" data-act="del" title="${t('common.delete')}">🗑</button>` : ''}
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.doc-item').forEach((el) => {
    const id = el.dataset.id;
    el.querySelector('[data-act="view"]')?.addEventListener('click', () => downloadDocument(id));
    el.querySelector('[data-act="del"]')?.addEventListener('click', async () => {
      if (!confirm(t('common.confirmDelete'))) return;
      haptic(20);
      try {
        await api('/api/v1/documents/' + id, { method: 'DELETE' });
        loadDocuments();
        toast(t('common.deleted'));
      } catch (e) { toast(e.message); }
    });
  });
}

async function downloadDocument(id) {
  try {
    const d = await api('/api/v1/documents/' + id);
    if (!d.file_data) return toast(t('docs.noData'));
    // Open in a new window or trigger download
    const link = document.createElement('a');
    link.href = d.file_data;
    link.download = d.file_name || d.title || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) { toast(e.message); }
}

// Upload flow
$('doc-new-btn')?.addEventListener('click', () => {
  $('doc-new-form').classList.toggle('hidden');
});
$('d-cancel')?.addEventListener('click', () => $('doc-new-form').classList.add('hidden'));
$('d-file')?.addEventListener('change', (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  if (f.size > 2_000_000) { toast(t('docs.fileTooLarge')); e.target.value = ''; return; }
  const reader = new FileReader();
  reader.onload = () => {
    appState.docFile = { name: f.name, type: f.type, data: reader.result };
    $('d-file-info').textContent = `${f.name} · ${Math.round(f.size / 1024)} KB`;
    $('d-file-info').classList.remove('hidden');
  };
  reader.readAsDataURL(f);
});
$('d-submit')?.addEventListener('click', async () => {
  const title = $('d-title').value.trim();
  const category = $('d-category').value;
  const notes = $('d-notes').value.trim() || null;
  if (!title || !appState.docFile) return toast(t('docs.needFields'));
  try {
    await api('/api/v1/documents', {
      method: 'POST',
      body: JSON.stringify({
        title,
        category,
        file_name: appState.docFile.name,
        file_type: appState.docFile.type,
        file_data: appState.docFile.data,
        notes,
      }),
    });
    $('d-title').value = '';
    $('d-notes').value = '';
    $('d-file').value = '';
    $('d-file-info').classList.add('hidden');
    appState.docFile = null;
    $('doc-new-form').classList.add('hidden');
    celebrate(t('docs.uploaded'));
    loadDocuments();
  } catch (e) { toast(e.message); }
});
$('doc-search')?.addEventListener('input', renderDocuments);

// ---------------- Contractor directory ----------------
async function loadContractors() {
  const list = $('contractors-list');
  list.innerHTML = skeletonList(3);
  try {
    const { contractors } = await api('/api/v1/contractors');
    appState.contractors = contractors;
    renderContractors();
  } catch (e) {
    list.innerHTML = `<div class="empty-cta"><span class="emo">⚠️</span><h4>${t('err.loadFailed')}</h4><p>${escapeHtml(e.message)}</p></div>`;
  }
}

function renderContractors() {
  const list = $('contractors-list');
  const items = appState.contractors || [];
  if (!items.length) {
    list.innerHTML = `<div class="empty-cta"><span class="emo">🧰</span><h4>${t('cont.emptyTitle')}</h4><p>${t('cont.emptySub')}</p></div>`;
    return;
  }
  const isVaad = ['vaad_admin', 'vaad_member', 'treasurer'].includes(appState.me?.user?.role);
  const iconFor = { elevator: '🛗', plumbing: '🚿', electrical: '💡', cleaning: '🧹', gardening: '🌿', security: '🔒', insurance: '🛡️', legal: '⚖️', other: '📦' };
  list.innerHTML = items.map((c) => `
    <div class="cont-item" data-id="${escapeAttr(c.id)}">
      <div class="cont-icon">${iconFor[c.category] || '🧰'}</div>
      <div class="cont-body">
        <div class="cont-title" dir="${dir(c.name)}">${escapeHtml(c.name)}${c.company ? ` <span class="muted">· ${escapeHtml(c.company)}</span>` : ''}</div>
        <div class="cont-meta">
          <span class="doc-cat">${t('contCat.' + (c.category || 'other'))}</span>
          ${c.rating ? `<span class="cont-rating">${'★'.repeat(c.rating)}${'☆'.repeat(5 - c.rating)}</span>` : ''}
        </div>
        ${c.notes ? `<div class="cont-meta" dir="${dir(c.notes)}">📝 ${escapeHtml(c.notes)}</div>` : ''}
      </div>
      <div class="cont-actions">
        ${c.phone ? `<a class="cont-act" href="tel:${escapeAttr(c.phone)}" title="${c.phone}">📞</a>` : ''}
        ${c.email ? `<a class="cont-act" href="mailto:${escapeAttr(c.email)}" title="${c.email}">✉️</a>` : ''}
        ${isVaad ? `<button class="cont-act danger" data-act="del" title="${t('common.delete')}">🗑</button>` : ''}
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.cont-item').forEach((el) => {
    const id = el.dataset.id;
    el.querySelector('[data-act="del"]')?.addEventListener('click', async () => {
      if (!confirm(t('common.confirmDelete'))) return;
      haptic(20);
      try {
        await api('/api/v1/contractors/' + id, { method: 'DELETE' });
        loadContractors();
        toast(t('common.deleted'));
      } catch (e) { toast(e.message); }
    });
  });
}

$('cont-new-btn')?.addEventListener('click', () => $('cont-new-form').classList.toggle('hidden'));
$('c-cancel')?.addEventListener('click', () => $('cont-new-form').classList.add('hidden'));
$('c-submit')?.addEventListener('click', async () => {
  const payload = {
    name: $('c-name').value.trim(),
    company: $('c-company').value.trim() || null,
    category: $('c-category').value,
    phone: $('c-phone').value.trim() || null,
    email: $('c-email').value.trim() || null,
    notes: $('c-notes').value.trim() || null,
  };
  if (!payload.name) return toast(t('cont.needName'));
  try {
    await api('/api/v1/contractors', { method: 'POST', body: JSON.stringify(payload) });
    ['c-name', 'c-company', 'c-phone', 'c-email', 'c-notes'].forEach((id) => ($(id).value = ''));
    $('cont-new-form').classList.add('hidden');
    celebrate(t('cont.added'));
    loadContractors();
  } catch (e) { toast(e.message); }
});

// ---------------- Audit log ----------------
async function loadAuditLog() {
  const list = $('audit-list');
  list.innerHTML = skeletonList(5);
  try {
    const { entries } = await api('/api/v1/audit');
    appState.auditEntries = entries;
    renderAuditLog();
  } catch (e) {
    list.innerHTML = `<div class="empty-cta"><span class="emo">⚠️</span><h4>${t('err.loadFailed')}</h4><p>${escapeHtml(e.message)}</p></div>`;
  }
}

function renderAuditLog() {
  const list = $('audit-list');
  const entries = appState.auditEntries || [];
  if (!entries.length) {
    list.innerHTML = `<div class="empty-cta"><span class="emo">📋</span><h4>${t('audit.emptyTitle')}</h4><p>${t('audit.emptySub')}</p></div>`;
    return;
  }
  const iconFor = {
    'create': { cls: 'create', icon: '➕' },
    'upload': { cls: 'create', icon: '📤' },
    'delete': { cls: 'delete', icon: '🗑' },
    'apply':  { cls: 'apply',  icon: '🔄' },
    'update': { cls: 'update', icon: '✏️' },
    'export': { cls: 'apply',  icon: '📊' },
    'generate': { cls: 'apply', icon: '🧾' },
    'status_change': { cls: 'update', icon: '🔀' },
    'settings_update': { cls: 'update', icon: '⚙️' },
  };
  list.innerHTML = entries.map((e) => {
    const verb = e.action.split('.').pop();
    const meta = iconFor[verb] || { cls: '', icon: '•' };
    const label = t('audit.a.' + e.action, {}, e.action);
    return `
      <div class="audit-item">
        <div class="audit-bullet ${meta.cls}">${meta.icon}</div>
        <div class="audit-body">
          <b>${escapeHtml(label)}</b>
          <div class="audit-meta">
            <span>👤 ${escapeHtml(e.actor_name || '—')}</span>
            ${e.actor_role ? `<span>· ${t('role.' + e.actor_role, {}, e.actor_role)}</span>` : ''}
            ${e.summary ? `<span>· ${escapeHtml(e.summary)}</span>` : ''}
          </div>
        </div>
        <div class="audit-time">${fmtRelTime(e.created_at)}</div>
      </div>
    `;
  }).join('');
}

function fmtRelTime(iso) {
  try {
    const d = new Date(iso.replace(' ', 'T') + (iso.includes('Z') ? '' : 'Z'));
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return t('time.now');
    if (diff < 3600) return t('time.minAgo', { n: Math.round(diff / 60) });
    if (diff < 86400) return t('time.hourAgo', { n: Math.round(diff / 3600) });
    if (diff < 86400 * 7) return t('time.dayAgo', { n: Math.round(diff / 86400) });
    return d.toLocaleDateString();
  } catch { return iso || ''; }
}

// ---------------- Emergency ----------------
function openEmergencySheet() {
  haptic(30);
  const phone = appState.me?.building?.emergency_phone;
  const el = $('emerg-building-call');
  const label = $('emerg-building-phone');
  if (phone) {
    el.href = 'tel:' + phone;
    label.textContent = phone;
    el.style.display = '';
  } else {
    el.style.display = 'none';
  }
  $('emergency-sheet').classList.remove('hidden');
}
document.addEventListener('click', (e) => {
  if (e.target?.id === 'emergency-sheet') e.target.classList.add('hidden');
});
$('emerg-close')?.addEventListener('click', () => $('emergency-sheet').classList.add('hidden'));

// SOS FAB — render once into the screen
function ensureSosFab() {
  if (document.getElementById('sos-fab')) return;
  const btn = document.createElement('button');
  btn.id = 'sos-fab';
  btn.className = 'sos-fab';
  btn.innerHTML = '🚨';
  btn.title = 'חירום';
  btn.addEventListener('click', openEmergencySheet);
  document.querySelector('.phone-screen')?.appendChild(btn);
}

// ---------------- Receipt PDF download ----------------
async function downloadReceipt(paymentId) {
  try {
    const token = store.token;
    const res = await fetch('/api/v1/payments/' + paymentId + '/receipt.pdf', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!res.ok) throw new Error('Failed to generate receipt');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'receipt-' + paymentId.slice(0, 8) + '.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    haptic(20);
  } catch (e) { toast(e.message); }
}
window.downloadReceipt = downloadReceipt;

// ---------------- CSV export ----------------
async function exportCsv(kind) {
  try {
    const token = store.token;
    const res = await fetch('/api/v1/export/' + kind + '.csv', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!res.ok) throw new Error(t('err.exportFailed'));
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = kind + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    celebrate(t('export.done'));
  } catch (e) { toast(e.message); }
}
window.exportCsv = exportCsv;

// ---------------- Pull-to-refresh ----------------
function setupPullToRefresh() {
  const scroll = $('app-scroll');
  if (!scroll) return;

  let indicator = document.getElementById('ptr-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'ptr-indicator';
    indicator.className = 'ptr-indicator';
    indicator.innerHTML = '<div class="ptr-spinner"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 4v4m0 8v4m8-8h-4M8 12H4m12.36-6.36-2.83 2.83M8.46 15.54l-2.83 2.83m0-12.73 2.83 2.83m7.07 7.08 2.83 2.83" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></div>';
    scroll.appendChild(indicator);
  }

  let startY = 0, pulling = false, pulled = 0;
  const threshold = 70;

  scroll.addEventListener('touchstart', (e) => {
    if (scroll.scrollTop === 0) { startY = e.touches[0].clientY; pulling = true; }
  }, { passive: true });

  scroll.addEventListener('touchmove', (e) => {
    if (!pulling) return;
    pulled = e.touches[0].clientY - startY;
    if (pulled > 0 && scroll.scrollTop === 0) {
      const progress = Math.min(pulled / threshold, 1);
      indicator.classList.toggle('visible', pulled > 10);
      indicator.style.transform = `translateY(${Math.min(pulled * 0.4, 40)}px)`;
    }
  }, { passive: true });

  scroll.addEventListener('touchend', () => {
    if (!pulling) return;
    if (pulled > threshold) {
      indicator.querySelector('.ptr-spinner')?.classList.add('loading');
      haptic(30);
      // Reload the current view
      show(currentRoute, { back: true });
      setTimeout(() => {
        indicator.querySelector('.ptr-spinner')?.classList.remove('loading');
        indicator.classList.remove('visible');
        indicator.style.transform = '';
      }, 700);
    } else {
      indicator.classList.remove('visible');
      indicator.style.transform = '';
    }
    pulling = false;
    pulled = 0;
  });
}

// ---------------- Profile extras: legal + data export + delete ----------------
// Legal document metadata — Lobbix (owned and operated by Liam Golan, עוסק פטור)
const LEGAL_VERSION = '1.1';
const LEGAL_EFFECTIVE = '2026-04-14';
const LEGAL_COMPANY = 'ליאם גולן / Liam Golan';
const LEGAL_REG = 'עוסק פטור · ת.ז. 325314755';
const LEGAL_ADDRESS = 'נצח ישראל 21, הוד השרון / Netzach Israel 21, Hod HaSharon, Israel';
const LEGAL_EMAIL_DPO = 'liam@lobbix.co.il';
const LEGAL_EMAIL_PRIVACY = 'liam@lobbix.co.il';
const LEGAL_EMAIL_LEGAL = 'liam@lobbix.co.il';

function openLegal(which) {
  const isTerms = which === 'terms';
  $('legal-title').textContent = isTerms ? t('legal.termsTitle') : t('legal.privacyTitle');
  const lang = store.lang || 'he';
  const body = isTerms ? renderTermsBody(lang) : renderPrivacyBody(lang);
  $('legal-body').innerHTML = renderLegalHeader(isTerms, lang) + body + renderLegalFooter(lang);
  show('legal');
  // Scroll to top
  const scroll = $('app-scroll');
  if (scroll) scroll.scrollTop = 0;
}
window.openLegal = openLegal;

function renderLegalHeader(isTerms, lang) {
  const isHe = lang === 'he';
  const label = isHe
    ? (isTerms ? 'תנאי שימוש' : 'מדיניות פרטיות')
    : (isTerms ? 'Terms of Service' : 'Privacy Policy');
  const versionLabel = isHe ? 'גרסה' : 'Version';
  const effectiveLabel = isHe ? 'בתוקף מיום' : 'Effective from';
  const printLabel = isHe ? '🖨️ הדפסה' : '🖨️ Print';
  const disclaimerTitle = isHe ? '⚠️ הערה חשובה' : '⚠️ Important notice';
  const disclaimerText = isHe
    ? 'מסמך זה מהווה טיוטת התחלה מקצועית. לפני השקה מסחרית ציבורית מומלץ שעורך דין המתמחה בהגנת הפרטיות ובדיני חוזים יעבור על המסמך ויתאים אותו לפעילות העסקית הספציפית שלך. השדות המסומנים בסוגריים מרובעים כגון [שם החברה] יש להחליף בפרטים האמיתיים של הישות המשפטית.'
    : 'This document is a professional starting draft. Before a commercial public launch you should have a lawyer specializing in data protection and contract law review and adapt it to your specific business. Fields shown in square brackets such as [Company Name] must be replaced with the real details of your legal entity.';

  return `
    <div class="legal-meta">
      <div class="legal-meta-row">
        <span>${label}</span>
        <button class="btn-ghost legal-print" onclick="window.print()">${printLabel}</button>
      </div>
      <div class="legal-meta-sub">
        ${versionLabel} ${LEGAL_VERSION} · ${effectiveLabel} ${LEGAL_EFFECTIVE}
      </div>
    </div>
    <div class="legal-disclaimer">
      <b>${disclaimerTitle}</b>
      <p>${disclaimerText}</p>
    </div>
  `;
}

function renderLegalFooter(lang) {
  const isHe = lang === 'he';
  const updated = isHe ? 'עודכן לאחרונה' : 'Last updated';
  return `
    <div class="legal-footer-meta">
      <hr>
      <p class="muted small">${updated}: ${LEGAL_EFFECTIVE} · ${isHe ? 'גרסה' : 'Version'} ${LEGAL_VERSION}</p>
    </div>
  `;
}

// ---------------- Terms of Service ----------------
function renderTermsBody(lang) {
  return lang === 'he' ? renderTermsHebrew() : renderTermsEnglish();
}

function renderTermsHebrew() {
  return `
    <h3>1. הקדמה והסכמה לתנאים</h3>
    <p>תנאי שימוש אלה ("<b>התנאים</b>") מסדירים את השימוש שלך ב-Lobbix ("<b>השירות</b>"), פלטפורמה מקוונת המופעלת על-ידי ${LEGAL_COMPANY} ("<b>אנחנו</b>", "<b>אנו</b>", "<b>שלנו</b>") המאפשרת לוועדי בתים ודיירים לנהל את פעילות הבניין, התקשורת, התשלומים והתחזוקה.</p>
    <p>עצם יצירת חשבון, גישה לשירות או שימוש בו מהווים הסכמה מלאה לתנאים אלה. אם אינך מסכים, אינך רשאי להשתמש בשירות.</p>

    <h3>2. הגדרות</h3>
    <ul>
      <li><b>"משתמש"</b> - כל אדם המשתמש בשירות בכל אמצעי.</li>
      <li><b>"דייר"</b> - משתמש שחשבונו מקושר לבניין ספציפי.</li>
      <li><b>"חבר ועד"</b> - משתמש בעל הרשאות ניהול לבניין (ועד אדמין, חבר ועד או גזבר).</li>
      <li><b>"מנהל-על"</b> - עובד Lobbix בעל הרשאות מערכת כלליות.</li>
      <li><b>"בניין"</b> - בית משותף רשום בשירות כהגדרתו בחוק המקרקעין (בתים משותפים).</li>
      <li><b>"תוכן"</b> - טקסט, תמונות, מסמכים, הצבעות, הערות וכל חומר אחר שמשתמשים מעלים לשירות.</li>
      <li><b>"מידע אישי"</b> - כהגדרתו בחוק הגנת הפרטיות, התשמ"א-1981.</li>
    </ul>

    <h3>3. כשירות</h3>
    <p>עליך להיות בן 16 לפחות כדי להשתמש בשירות. שימוש על-ידי קטינים מתחת לגיל 16 אסור לחלוטין.</p>
    <p>הנך מצהיר ומתחייב כי (א) הנך בעל הזכות החוקית להתגורר בבניין המקושר לחשבונך או לייצג אותו, (ב) הנך משתמש בשירות למטרתו המיועדת כדייר, חבר ועד או מנהל בניין מוסמך, ו-(ג) המידע שסיפקת במהלך הרישום מדויק ועדכני.</p>

    <h3>4. רישום חשבון</h3>
    <p>חשבונות נפתחים באחת מהדרכים הבאות:</p>
    <ul>
      <li>אימות מספר טלפון באמצעות קוד חד-פעמי (OTP)</li>
      <li>כניסה עם חשבון Google</li>
    </ul>
    <p>אתה אחראי באופן בלעדי לשמירה על סודיות חשבונך ולכל פעולה המבוצעת באמצעותו. עליך:</p>
    <ul>
      <li>לספק מידע מדויק, שלם ועדכני ולעדכנו בעת הצורך</li>
      <li>להודיע לנו מיידית על כל גישה לא מורשית לחשבונך או על חשד לגניבת זהות</li>
      <li>לא לשתף את פרטי הגישה שלך עם אחרים</li>
      <li>לשאת באחריות לכל פעולה המתבצעת בחשבונך</li>
    </ul>

    <h3>5. רישיון שימוש</h3>
    <p>בכפוף לעמידה בתנאים אלה, אנו מעניקים לך רישיון אישי, מוגבל, לא בלעדי, שאינו ניתן להעברה או להמחאה, ובר-ביטול, להשתמש בשירות למטרות אישיות וניהול בניין. חל עליך איסור מפורש:</p>
    <ul>
      <li>לבצע הנדסה הפוכה, לפרק, לפענח, או לנסות לחלץ את קוד המקור של השירות</li>
      <li>למכור, להשכיר, להחכיר, להעביר זכויות או לתת רישיון משנה בגישה לשירות</li>
      <li>להשתמש בשירות למטרה בלתי חוקית, מזיקה, מטעה או בלתי מורשית</li>
      <li>לקצור (scrape), לכרות (mine) או לאסוף נתונים מהשירות באמצעים אוטומטיים</li>
      <li>להתחזות לאדם אחר או לטעון באופן כוזב לסמכות שאינה בידיך</li>
      <li>להפריע לפעולתו התקינה של השירות או לאבטחתו</li>
      <li>לעקוף או לפגוע באמצעי האבטחה של השירות</li>
    </ul>

    <h3>6. תוכן משתמש והתנהגות</h3>
    <p>הבעלות בתוכן שאתה מעלה נשארת שלך. בעצם ההעלאה אתה מעניק לנו רישיון עולמי, ללא תמלוגים, לא בלעדי, להעתיק, לאחסן, לשדר, להציג, ולהפיץ את התוכן באופן מוגבל במסגרת הפעלת השירות ולצרכיו בלבד.</p>
    <p>אתה האחראי הבלעדי לתוכן שאתה מעלה. אתה מתחייב שלא להעלות תוכן אשר:</p>
    <ul>
      <li>מפר חוק, תקנה או זכות של צד שלישי (לרבות זכויות יוצרים, פטנטים, סימני מסחר או זכויות פרטיות)</li>
      <li>משמיץ, פוגעני, גזעני, מאיים, מטריד או מעודד לאלימות</li>
      <li>מכיל מידע אישי של אחרים ללא הסכמתם המפורשת</li>
      <li>מכיל וירוסים, תוכנות זדוניות או קוד זדוני כלשהו</li>
      <li>מהווה ספאם, שיווק רב-רמות או פרסומת מסחרית שאינה קשורה לבניין</li>
      <li>פוגע בפרטיות או בכבודם של דיירים אחרים</li>
      <li>מטרתו היא ניהול קמפיין פוליטי או מפלגתי (להבדיל מהצבעות פנימיות של הבניין)</li>
    </ul>
    <p>חברי ועד רשאים למתן, להסיר או להגביל תוכן בבניין שלהם לפי שיקול דעתם, בהתאם לתקנון הבית המשותף. אנו שומרים לעצמנו את הזכות להסיר כל תוכן על-פי שיקול דעתנו הבלעדי, ללא הודעה מוקדמת, אם לדעתנו הוא מפר תנאים אלה.</p>

    <h3>7. סמכות הוועד וניטרליות Lobbix</h3>
    <p>חברי ועד בעלי סמכויות תפעוליות בבניין שלהם, לרבות יצירת חוקי תשלום, רישום הוצאות, שליחת הודעות וניהול גישת דיירים. סמכות זו נובעת מחוק המקרקעין (בתים משותפים), התשכ"ט-1969, ומתקנון הבית המשותף של הבניין, ואינה מוענקת על-ידי Lobbix.</p>
    <p>Lobbix היא <b>פלטפורמה ניטרלית</b>. איננו אחראים ל:</p>
    <ul>
      <li>החלטות הוועד או לתוצאותיהן הכלכליות</li>
      <li>מחלוקות בין דיירים לוועד או בין דיירים ביניהם</li>
      <li>דיוק החישובים של חוקי תשלום שהוועד מגדיר</li>
      <li>תוכן הודעות, הצבעות ומסמכים שהוועד מפרסם</li>
      <li>התאמת הפעילות של הוועד לתקנון הבית המשותף או לחוק</li>
    </ul>
    <p>מחלוקות פנימיות יש ליישב בהתאם לתקנון ולחוק. אנו רשאים לשתף פעולה עם רשויות משפטיות כנדרש בחוק, אך איננו משמשים כמגשרים, שופטים או מפקחים.</p>

    <h3>8. תשלומים ועמלות</h3>
    <p>אם השירות משמש לגביית תשלומים (דמי ועד, היטלים, הוצאות משותפות וכו'):</p>
    <ul>
      <li>התשלומים מעובדים על-ידי ספקי תשלום צד שלישי מורשים (כגון Tranzila, Cardcom). אנו איננו עוסקים בעיבוד תשלומים ישירות ואיננו שומרים פרטי כרטיסי אשראי.</li>
      <li>אתה מאשר חיובים חוזרים כפי שהוגדרו על-ידי הוועד, בהתאם לחוק כרטיסי חיוב, התשמ"ו-1986, וכתבי ההרשאה שתחתום עליהם.</li>
      <li>כל הסכומים מוצגים בשקלים חדשים (₪) אלא אם צוין אחרת, וכוללים מע"מ כחוק.</li>
      <li>Lobbix מופעלת על-ידי ליאם גולן כ<b>עוסק פטור</b>, ולכן המחירים אינם כוללים מע"מ ולא מופקות חשבוניות מס — מופקות קבלות בלבד, בהתאם לתקנות מס הכנסה וחוק מע"מ, התשל"ו-1975.</li>
      <li>דמי מנוי לפלטפורמה משולמים על-ידי ועד הבית (לא על-ידי דיירים בודדים) ומחויבים חודשית.</li>
    </ul>
    <p>במקרה של כשל בחיוב אוטומטי, אנו רשאים לבצע ניסיונות חיוב חוזרים במהלך 7 ימים. לאחר מכן, החוב יסומן כ"באיחור" ותישלח הודעה.</p>

    <h3>9. מדיניות החזרים וביטולים</h3>
    <p><b>דמי מנוי פלטפורמה:</b></p>
    <ul>
      <li>הוועד רשאי לבטל את המנוי בכל עת. הביטול ייכנס לתוקף בסוף תקופת החיוב הנוכחית.</li>
      <li>לא יינתן החזר חלקי על חלקי חודש שלא נוצלו.</li>
      <li>בביטול בתוך 14 יום מהמנוי הראשון, בהתאם לחוק הגנת הצרכן, התשמ"א-1981, ניתן לקבל החזר מלא בניכוי דמי ביטול כחוק.</li>
    </ul>
    <p><b>חיובים שגויים:</b></p>
    <ul>
      <li>אם חויבת בטעות בשל תקלה בשירות, פנה אלינו תוך 30 יום ואנו נחזיר את הסכום במלואו.</li>
      <li>עמלות עיבוד תשלומים שנגבו על-ידי ספקי צד שלישי אינן ניתנות להחזר על-ידינו.</li>
    </ul>
    <p><b>מחלוקות עם הוועד:</b></p>
    <ul>
      <li>מחלוקות בנוגע לחיובי הוועד (לא פלטפורמה) יש ליישב מול הוועד ישירות. Lobbix אינה צד למחלוקות אלה.</li>
      <li>במקרה של חיוב שגוי מטעם הוועד, תוכל לפנות לוועד לבקשת החזר. הוועד יכול לבצע החזר דרך המערכת.</li>
    </ul>

    <h3>10. קניין רוחני</h3>
    <p>כל הזכויות, הבעלות וההנאות בשירות, לרבות התוכנה, הקוד, העיצוב, הלוגו, הטקסטים המקוריים, הגרפיקה, הממשק וכל חומר אחר שהופק על-ידינו, שייכים לנו או למעניקי הרישיון שלנו ומוגנים לפי חוקי זכויות היוצרים והקניין הרוחני של מדינת ישראל והדין הבינלאומי.</p>
    <p>התנאים אינם מעבירים זכויות כלשהן בשירות אליך, למעט הרישיון המוגבל המפורש שבסעיף 5. שימוש בסימני המסחר, לוגואים ושמות מסחריים אסור ללא אישור מראש ובכתב.</p>

    <h3>11. פרטיות</h3>
    <p>השימוש שלך בשירות כפוף גם ל<b>מדיניות הפרטיות</b> שלנו, המשולבת בתנאים אלה בהפניה. אנו פועלים בהתאם לחוק הגנת הפרטיות, התשמ"א-1981, ולתקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017.</p>

    <h3>12. השעיה וסיום</h3>
    <p><b>סיום מטעמך:</b> אתה רשאי לסיים את חשבונך בכל עת דרך "אזור סכנה" בפרופיל שלך. עם סיום:</p>
    <ul>
      <li>חשבונך יושבת ותיחסם הגישה</li>
      <li>המידע האישי שלך יישמר בהתאם למדיניות הפרטיות</li>
      <li>רשומות פיננסיות יישמרו למשך 7 שנים כנדרש לפי סעיף 25 לפקודת מס הכנסה ולחוק מע"מ</li>
      <li>רשומות יומן הפעולות יישמרו בצורה אנונימית כדי לשמר את שקיפות הבניין עבור דיירים אחרים</li>
    </ul>
    <p><b>השעיה או סיום מטעמנו:</b> אנו רשאים להשעות או לסיים את חשבונך, עם או בלי הודעה מוקדמת, במקרים הבאים:</p>
    <ul>
      <li>הפרת התנאים או הדין</li>
      <li>פעילות הונאה, שימוש לרעה או ניסיון לפרוץ למערכת</li>
      <li>אי-תשלום דמי מנוי במשך מעל 30 יום (במקרה של ועדים)</li>
      <li>נטישה ממושכת של החשבון (מעל 24 חודשים)</li>
    </ul>

    <h3>13. הסתייגויות (Disclaimers)</h3>
    <p>השירות מסופק "כפי שהוא" (AS IS) ו"כפי שזמין" (AS AVAILABLE), ללא מצגים או אחריות מכל סוג, במפורש או במשתמע, לרבות אך לא רק: אחריות לסחירות (merchantability), התאמה למטרה מסוימת, אי-הפרה, דיוק, שלמות, אמינות, אבטחה או זמינות בלתי פוסקת.</p>
    <p>איננו מתחייבים ש: (א) השירות יפעל ללא הפרעות או שגיאות; (ב) פגמים יתוקנו; (ג) השירות יהיה חף מווירוסים או רכיבים מזיקים; או (ד) תוצאות השימוש יעמדו בציפיותיך.</p>

    <h3>14. הגבלת אחריות</h3>
    <p>במידה המרבית המותרת לפי הדין החל, האחריות הכוללת המצטברת שלנו לכל תביעה או מחלוקת הנובעת או קשורה לשירות לא תעלה על הגדול מבין:</p>
    <ol>
      <li>הסכום הכולל ששילמת לנו ב-12 החודשים שקדמו למקור התביעה, או</li>
      <li>500 ש"ח.</li>
    </ol>
    <p>בשום מקרה לא נהיה אחראים לנזקים עקיפים, מיוחדים, מקריים, תוצאתיים או עונשיים, לרבות: אובדן רווחים, אובדן מידע, פגיעה במוניטין, הפרעה לעסקים, אובדן הזדמנויות או כל נזק לא-ממוני אחר, גם אם הודענו לך על אפשרות להתרחשות של נזקים כאלה.</p>
    <p><b>הגבלה חשובה:</b> שום דבר בתנאים אלה אינו מגביל את אחריותנו ל: (א) מוות או נזק גוף הנובעים מרשלנות; (ב) הונאה או מצג שווא כוזב; או (ג) כל אחריות אחרת שלא ניתן להחריגה או להגבילה כדין.</p>

    <h3>15. שיפוי</h3>
    <p>אתה מתחייב לשפות, להגן ולפטור אותנו, נושאי המשרה, עובדינו וספקינו, מפני כל תביעה, טענה, הפסד, הוצאה (לרבות שכר טרחת עורך דין סביר) או נזק הנובעים מ: (א) הפרת תנאים אלה על-ידך; (ב) שימושך בשירות; (ג) התוכן שהעלית; או (ד) פגיעה שגרמת בזכויות צד שלישי.</p>

    <h3>16. הודעות</h3>
    <p>הודעות מטעמנו יישלחו אליך באמצעות: (א) הודעה בתוך השירות; (ב) דוא"ל לכתובת שסיפקת; (ג) SMS למספר שסיפקת; או (ד) פרסום באתר ${LEGAL_EMAIL_LEGAL.split('@')[1]}. הודעות תיראנה כאילו התקבלו 24 שעות לאחר השליחה.</p>
    <p>הודעות מטעמך אלינו יישלחו לכתובת: ${LEGAL_EMAIL_LEGAL} או ב${LEGAL_ADDRESS}.</p>

    <h3>17. דין ושיפוט</h3>
    <p>התנאים כפופים אך ורק לדיני מדינת ישראל, ללא התחשבות בכללי ברירת הדין. הנך מסכים באופן בלתי הפיך כי לבתי המשפט המוסמכים בעיר תל אביב-יפו תהא הסמכות הייחודית והבלעדית לדון בכל סכסוך, תביעה או מחלוקת הנובעים מהתנאים או מהשימוש בשירות.</p>

    <h3>18. שינויים בתנאים</h3>
    <p>אנו רשאים לעדכן את התנאים מעת לעת. שינויים מהותיים יפורסמו באמצעות: (א) הודעה בולטת בשירות; (ב) דוא"ל לכתובתך הרשומה; או (ג) התראת Push. השינויים ייכנסו לתוקף 14 יום לאחר פרסומם, אלא אם הדין מחייב תקופה ארוכה יותר.</p>
    <p>המשך השימוש בשירות לאחר מועד כניסת השינויים לתוקף מהווה הסכמה מלאה לשינויים. אם אינך מסכים, עליך להפסיק לאלתר את השימוש בשירות ולסיים את חשבונך.</p>

    <h3>19. הוראות שונות</h3>
    <ul>
      <li><b>הסכם שלם:</b> התנאים, יחד עם מדיניות הפרטיות, מהווים את ההסכם השלם בינך לבינינו ומחליפים כל הסכם או הסדר קודם.</li>
      <li><b>ויתור:</b> אי-אכיפה של סעיף מסעיפי התנאים לא תיחשב כוויתור על הזכות לאכפו בעתיד.</li>
      <li><b>הפרדה:</b> אם סעיף כלשהו ייקבע כבלתי אכיף, שאר הסעיפים יישארו בתוקף מלא.</li>
      <li><b>המחאה:</b> אינך רשאי להמחות את זכויותיך לפי התנאים ללא אישורנו מראש ובכתב. אנו רשאים להמחות את זכויותינו לפי שיקול דעתנו.</li>
      <li><b>כוח עליון:</b> לא נהיה אחראים לעיכובים או כשלים שמקורם בנסיבות שמעבר לשליטתנו הסבירה (כגון מלחמה, אסון טבע, שבתת אינטרנט ארצית, מגפה וכו').</li>
    </ul>

    <h3>20. יצירת קשר</h3>
    <p>לשאלות או הבהרות בנוגע לתנאים:</p>
    <ul>
      <li><b>דוא"ל משפטי:</b> ${LEGAL_EMAIL_LEGAL}</li>
      <li><b>חברה:</b> ${LEGAL_COMPANY}</li>
      <li><b>ח.פ:</b> ${LEGAL_REG}</li>
      <li><b>כתובת:</b> ${LEGAL_ADDRESS}</li>
    </ul>
  `;
}

function renderTermsEnglish() {
  return `
    <h3>1. Introduction and Acceptance</h3>
    <p>These Terms of Service ("<b>Terms</b>") govern your use of Lobbix ("<b>Service</b>"), an online platform operated by ${LEGAL_COMPANY} ("<b>we</b>", "<b>us</b>", "<b>our</b>") that enables building committees (ועד בית) and residents to manage building operations, communications, payments, and maintenance.</p>
    <p>By creating an account, accessing, or using the Service, you agree to be fully bound by these Terms. If you do not agree, you may not use the Service.</p>

    <h3>2. Definitions</h3>
    <ul>
      <li><b>"User"</b> — any individual using the Service by any means.</li>
      <li><b>"Resident"</b> — a User whose account is associated with a specific Building.</li>
      <li><b>"Committee Member"</b> — a User with administrative permissions for a Building (Vaad admin, member, or treasurer).</li>
      <li><b>"Super Admin"</b> — Lobbix staff with system-wide permissions.</li>
      <li><b>"Building"</b> — a multi-unit residential building registered on the Service, as defined in the Israeli Real Estate Law (Condominiums).</li>
      <li><b>"Content"</b> — text, images, documents, votes, comments, and any other material Users submit to the Service.</li>
      <li><b>"Personal Data"</b> — as defined in the Israeli Privacy Protection Law, 5741-1981.</li>
    </ul>

    <h3>3. Eligibility</h3>
    <p>You must be at least 16 years old to use the Service. Use by minors under 16 is strictly prohibited.</p>
    <p>You represent and warrant that (a) you have the legal right to reside in or represent the Building associated with your account, (b) you are using the Service for its intended purpose as a resident, committee member, or authorized building manager, and (c) all information you provided during registration is accurate and current.</p>

    <h3>4. Account Registration</h3>
    <p>Accounts are created via one of the following methods:</p>
    <ul>
      <li>Phone number verification with a one-time code (OTP)</li>
      <li>Google Sign-in</li>
    </ul>
    <p>You are solely responsible for maintaining the confidentiality of your account and for all activities under it. You must:</p>
    <ul>
      <li>Provide accurate, complete, and current information and update it as needed</li>
      <li>Notify us immediately of any unauthorized access or suspected identity theft</li>
      <li>Not share your access credentials with anyone</li>
      <li>Bear full responsibility for all actions taken through your account</li>
    </ul>

    <h3>5. License</h3>
    <p>Subject to your compliance with these Terms, we grant you a personal, limited, non-exclusive, non-transferable, non-sublicensable, revocable license to use the Service for personal and building-management purposes. You are expressly prohibited from:</p>
    <ul>
      <li>Reverse engineering, decompiling, disassembling, or attempting to extract the source code of the Service</li>
      <li>Selling, renting, leasing, transferring rights, or sublicensing access to the Service</li>
      <li>Using the Service for any illegal, harmful, misleading, or unauthorized purpose</li>
      <li>Scraping, mining, or collecting data from the Service by automated means</li>
      <li>Impersonating another person or falsely claiming authority you do not have</li>
      <li>Interfering with the proper operation or security of the Service</li>
      <li>Circumventing or defeating security measures</li>
    </ul>

    <h3>6. User Content and Conduct</h3>
    <p>You retain ownership of the Content you submit. By submitting Content, you grant us a worldwide, royalty-free, non-exclusive license to copy, store, transmit, display, and distribute the Content solely as needed to operate the Service.</p>
    <p>You are solely responsible for your Content. You agree not to submit Content that:</p>
    <ul>
      <li>Violates any law, regulation, or third-party right (including copyright, patent, trademark, or privacy rights)</li>
      <li>Is defamatory, offensive, racist, threatening, harassing, or incites violence</li>
      <li>Contains personal data of others without their explicit consent</li>
      <li>Contains viruses, malware, or any malicious code</li>
      <li>Constitutes spam, multi-level marketing, or commercial advertising unrelated to the Building</li>
      <li>Harms the privacy or dignity of other residents</li>
      <li>Conducts political or partisan campaigns (as distinct from internal building polls)</li>
    </ul>
    <p>Committee Members may moderate, remove, or restrict Content within their Building at their discretion, in accordance with the Building's bylaws. We reserve the right to remove any Content at our sole discretion, without prior notice, if we believe it violates these Terms.</p>

    <h3>7. Committee Authority and Lobbix Neutrality</h3>
    <p>Committee Members have operational authority within their Building, including creating payment rules, recording expenses, sending announcements, and managing resident access. This authority is granted by the Israeli Real Estate Law (Condominiums), 5729-1969, and the Building's bylaws — not by Lobbix.</p>
    <p>Lobbix is a <b>neutral platform</b>. We are not responsible for:</p>
    <ul>
      <li>Committee decisions or their financial consequences</li>
      <li>Disputes between residents and the committee or among residents</li>
      <li>The accuracy of calculations in payment rules configured by the committee</li>
      <li>The content of announcements, polls, and documents published by the committee</li>
      <li>Whether the committee's activities comply with the building bylaws or the law</li>
    </ul>
    <p>Internal disputes should be resolved according to the bylaws and the law. We may cooperate with legal authorities as required by law, but we do not act as mediators, judges, or regulators.</p>

    <h3>8. Payments and Fees</h3>
    <p>If the Service is used to collect payments (Vaad fees, assessments, shared expenses, etc.):</p>
    <ul>
      <li>Payments are processed by authorized third-party payment providers (e.g., Tranzila, Cardcom). We do not process payments directly and do not store credit card details.</li>
      <li>You authorize recurring charges as configured by the committee, subject to the Israeli Debit Cards Law, 5746-1986, and the authorization documents you sign.</li>
      <li>All amounts are displayed in Israeli New Shekels (₪) unless otherwise specified, and include VAT as required by law.</li>
      <li>Lobbix is operated by Liam Golan as a <b>tax-exempt dealer (עוסק פטור)</b>; prices do not include VAT and tax invoices are not issued — only receipts, in accordance with Israeli tax regulations and the VAT Law, 5736-1975.</li>
      <li>Platform subscription fees are paid by the Building Committee (not individual residents) and are billed monthly.</li>
    </ul>
    <p>In case of automatic charge failure, we may retry the charge for up to 7 days. After that, the debt will be marked "overdue" and a notification sent.</p>

    <h3>9. Refunds and Cancellations</h3>
    <p><b>Platform subscription:</b></p>
    <ul>
      <li>The committee may cancel the subscription at any time. Cancellation takes effect at the end of the current billing period.</li>
      <li>No partial refund for unused portions of a month.</li>
      <li>For cancellation within 14 days of initial subscription, in accordance with the Israeli Consumer Protection Law, 5741-1981, a full refund is available less statutory cancellation fees.</li>
    </ul>
    <p><b>Erroneous charges:</b></p>
    <ul>
      <li>If you are charged in error due to a Service malfunction, contact us within 30 days for a full refund of the erroneous amount.</li>
      <li>Payment processing fees charged by third-party providers are not refundable by us.</li>
    </ul>
    <p><b>Disputes with the committee:</b></p>
    <ul>
      <li>Disputes regarding committee charges (not platform charges) must be resolved directly with the committee. Lobbix is not a party to such disputes.</li>
      <li>In case of an incorrect charge by the committee, you may contact the committee to request a refund. The committee can process refunds through the system.</li>
    </ul>

    <h3>10. Intellectual Property</h3>
    <p>All rights, title, and interest in the Service, including software, code, design, logo, original text, graphics, interface, and any other material produced by us, are owned by us or our licensors and are protected under the copyright and intellectual property laws of the State of Israel and international law.</p>
    <p>These Terms do not transfer any rights in the Service to you, except for the limited express license in Section 5. Use of trademarks, logos, and trade names is prohibited without prior written approval.</p>

    <h3>11. Privacy</h3>
    <p>Your use of the Service is also subject to our <b>Privacy Policy</b>, which is incorporated into these Terms by reference. We operate in accordance with the Israeli Privacy Protection Law, 5741-1981, and the Privacy Protection (Information Security) Regulations, 5777-2017.</p>

    <h3>12. Suspension and Termination</h3>
    <p><b>Termination by you:</b> You may terminate your account at any time via the "Danger Zone" in your profile. Upon termination:</p>
    <ul>
      <li>Your account will be deactivated and access revoked</li>
      <li>Your personal data will be retained as described in the Privacy Policy</li>
      <li>Financial records will be retained for 7 years as required by Section 25 of the Israeli Income Tax Ordinance and the VAT Law</li>
      <li>Audit log entries will be retained in anonymized form to preserve building transparency for other residents</li>
    </ul>
    <p><b>Suspension or termination by us:</b> We may suspend or terminate your account, with or without prior notice, in the following cases:</p>
    <ul>
      <li>Violation of these Terms or the law</li>
      <li>Fraud, abuse, or attempted system intrusion</li>
      <li>Non-payment of subscription fees for more than 30 days (for committees)</li>
      <li>Prolonged account abandonment (over 24 months)</li>
    </ul>

    <h3>13. Disclaimers</h3>
    <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO: WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, COMPLETENESS, RELIABILITY, SECURITY, OR UNINTERRUPTED AVAILABILITY.</p>
    <p>We do not warrant that: (a) the Service will operate without interruption or error; (b) defects will be corrected; (c) the Service will be free of viruses or harmful components; or (d) the results of using the Service will meet your expectations.</p>

    <h3>14. Limitation of Liability</h3>
    <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, OUR TOTAL AGGREGATE LIABILITY FOR ANY CLAIM OR DISPUTE ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE GREATER OF:</p>
    <ol>
      <li>The total amount you paid to us in the 12 months preceding the origin of the claim, or</li>
      <li>₪500.</li>
    </ol>
    <p>IN NO EVENT SHALL WE BE LIABLE FOR INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING: LOSS OF PROFITS, LOSS OF DATA, REPUTATIONAL HARM, BUSINESS INTERRUPTION, LOSS OF OPPORTUNITIES, OR ANY OTHER NON-PECUNIARY DAMAGE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
    <p><b>Important limitation:</b> Nothing in these Terms limits our liability for: (a) death or personal injury caused by negligence; (b) fraud or false misrepresentation; or (c) any other liability that cannot be lawfully excluded or limited.</p>

    <h3>15. Indemnification</h3>
    <p>You agree to indemnify, defend, and hold us, our officers, employees, and suppliers harmless from any claim, demand, loss, expense (including reasonable attorney fees), or damage arising from: (a) your breach of these Terms; (b) your use of the Service; (c) Content you submitted; or (d) infringement of third-party rights caused by you.</p>

    <h3>16. Notices</h3>
    <p>Notices from us to you will be delivered via: (a) in-service notification; (b) email to the address you provided; (c) SMS to the number you provided; or (d) publication on our website. Notices will be deemed received 24 hours after sending.</p>
    <p>Notices from you to us should be sent to: ${LEGAL_EMAIL_LEGAL} or ${LEGAL_ADDRESS}.</p>

    <h3>17. Governing Law and Jurisdiction</h3>
    <p>These Terms are governed solely by the laws of the State of Israel, without regard to conflict-of-law rules. You irrevocably agree that the competent courts in the city of Tel Aviv-Jaffa shall have exclusive jurisdiction over any dispute, claim, or controversy arising from these Terms or your use of the Service.</p>

    <h3>18. Changes to Terms</h3>
    <p>We may update these Terms from time to time. Material changes will be announced via: (a) a prominent notice in the Service; (b) email to your registered address; or (c) push notification. Changes will take effect 14 days after publication, unless a longer period is required by law.</p>
    <p>Continued use of the Service after the effective date of changes constitutes full agreement to the changes. If you do not agree, you must immediately cease using the Service and terminate your account.</p>

    <h3>19. Miscellaneous</h3>
    <ul>
      <li><b>Entire agreement:</b> These Terms, together with the Privacy Policy, constitute the entire agreement between you and us and supersede any prior agreement or arrangement.</li>
      <li><b>Waiver:</b> Failure to enforce any provision shall not be deemed a waiver of the right to enforce it in the future.</li>
      <li><b>Severability:</b> If any provision is found unenforceable, the remaining provisions shall remain in full effect.</li>
      <li><b>Assignment:</b> You may not assign your rights under these Terms without our prior written approval. We may assign our rights at our discretion.</li>
      <li><b>Force majeure:</b> We shall not be liable for delays or failures due to circumstances beyond our reasonable control (e.g., war, natural disaster, nationwide internet outage, pandemic, etc.).</li>
    </ul>

    <h3>20. Contact</h3>
    <p>For questions or clarifications regarding these Terms:</p>
    <ul>
      <li><b>Legal email:</b> ${LEGAL_EMAIL_LEGAL}</li>
      <li><b>Company:</b> ${LEGAL_COMPANY}</li>
      <li><b>Registration:</b> ${LEGAL_REG}</li>
      <li><b>Address:</b> ${LEGAL_ADDRESS}</li>
    </ul>
  `;
}

// ---------------- Privacy Policy ----------------
function renderPrivacyBody(lang) {
  return lang === 'he' ? renderPrivacyHebrew() : renderPrivacyEnglish();
}

function renderPrivacyHebrew() {
  return `
    <h3>1. הקדמה</h3>
    <p>מדיניות פרטיות זו מתארת כיצד Lobbix ("<b>אנחנו</b>", "<b>אנו</b>", "<b>שלנו</b>"), המופעלת על-ידי ${LEGAL_COMPANY}, אוספת, משתמשת, חושפת ומגנה על המידע האישי שלך בעת השימוש בשירות.</p>
    <p>אנו מחויבים להגנה על פרטיותך ופועלים בהתאם ל:</p>
    <ul>
      <li><b>חוק הגנת הפרטיות, התשמ"א-1981</b> ותקנותיו</li>
      <li><b>תקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017</b></li>
      <li><b>תקנות הגנת הפרטיות (העברת מידע אל מאגרי מידע שמחוץ לגבולות המדינה), התשס"א-2001</b></li>
      <li><b>תקנת הגנת הנתונים הכללית של האיחוד האירופי (GDPR)</b> במידה שהיא חלה על משתמשים במרחב הכלכלי האירופי</li>
    </ul>

    <h3>2. ממונה הגנת מידע (DPO)</h3>
    <p>לכל פנייה בנושאי פרטיות או לממוש זכויותיך לפי החוק, פנה אל ממונה הגנת המידע שלנו:</p>
    <ul>
      <li><b>דוא"ל:</b> ${LEGAL_EMAIL_DPO}</li>
      <li><b>דואר:</b> ${LEGAL_ADDRESS}</li>
    </ul>
    <p>אנו נענה לכל פנייה תוך 30 יום (ובמקרים מורכבים — עד 60 יום עם הודעה מוקדמת).</p>

    <h3>3. המידע שאנו אוספים</h3>

    <h3>3.1 מידע שאתה מספק לנו</h3>
    <ul>
      <li>שם מלא</li>
      <li>מספר טלפון (להזדהות ולקבלת קודי OTP)</li>
      <li>כתובת דוא"ל (אופציונלי, לקבלת הודעות)</li>
      <li>מספר דירה וקומה</li>
      <li>בניין בו אתה מתגורר</li>
      <li>העדפות תשלום (טוקנים של כרטיסי אשראי, <b>לא</b> מספרי כרטיס)</li>
      <li>תוכן שאתה מעלה לשירות: קריאות שירות, הודעות, הצבעות, הערות, מסמכים, קבלות, תמונות</li>
    </ul>

    <h3>3.2 מידע הנאסף באופן אוטומטי</h3>
    <ul>
      <li>כתובת IP</li>
      <li>סוג מכשיר, מערכת הפעלה, גרסת דפדפן</li>
      <li>אסימון התראות Push (רק אם אישרת)</li>
      <li>יומני שימוש (עמודים שנצפו, פעולות, חותמות זמן)</li>
      <li>מיקום מקורב הנגזר מכתובת ה-IP (לא GPS)</li>
      <li>נתוני ביצוע השירות (לצורך אבחון תקלות)</li>
    </ul>

    <h3>3.3 מידע מצדדים שלישיים</h3>
    <ul>
      <li><b>כניסה עם Google:</b> כתובת דוא"ל, שם מלא ותמונת פרופיל (רק אם אתה בוחר להשתמש באפשרות זו)</li>
      <li><b>ספקי תשלום:</b> מזהי עסקה, סטטוס תשלום וארבע ספרות אחרונות של כרטיס (לא מספר כרטיס מלא)</li>
    </ul>

    <h3>4. בסיסים חוקיים לעיבוד</h3>
    <p>לפי GDPR ולפי חוק הגנת הפרטיות, אנו מעבדים מידע על בסיס אחד או יותר מהעילות הבאות:</p>
    <ul>
      <li><b>ביצוע חוזה:</b> לספק לך את השירות אליו נרשמת</li>
      <li><b>אינטרסים לגיטימיים:</b> להפעיל, לשפר ולאבטח את השירות, למנוע הונאה ולהגן על משתמשים אחרים</li>
      <li><b>הסכמה:</b> לתכונות אופציונליות (כגון התראות Push, הודעות דוא"ל שיווקיות)</li>
      <li><b>חובה חוקית:</b> לעמוד בחוקי מיסוי, דיני חשבונאות וצווי רשויות אכיפה</li>
    </ul>

    <h3>5. כיצד אנו משתמשים במידע שלך</h3>
    <ul>
      <li>לספק, לתחזק ולשפר את השירות</li>
      <li>לעבד תשלומים ולהפיק קבלות וחשבוניות מס</li>
      <li>ליצור איתך קשר לגבי חשבונך, הבניין ועדכוני שירות חיוניים</li>
      <li>לשלוח התראות (Push, SMS, דוא"ל) כפי שהגדרת בהעדפותיך</li>
      <li>לאכוף את התנאים ולמנוע הונאה, שימוש לרעה או הפרות אבטחה</li>
      <li>לעמוד בחובות חוקיות (רשומות מס, דיווחים, צווי בית משפט)</li>
      <li>לנתח ביצועים ולאבחן תקלות</li>
      <li>ליצור סטטיסטיקות מצטברות ואנונימיות לצורך פיתוח השירות</li>
    </ul>
    <p>אנו <b>לא</b> משתמשים במידע שלך לקבלת החלטות אוטומטיות בעלות השלכות משפטיות עליך.</p>

    <h3>6. עם מי אנו חולקים מידע</h3>

    <h3>6.1 דיירים אחרים בבניין שלך</h3>
    <p>משתמשים אחרים בבניין שלך עשויים לראות את המידע הבא:</p>
    <ul>
      <li>שמך המלא ומספר דירתך (במדריך הדיירים)</li>
      <li>סטטוס תשלומים מצטבר (למשל "שולם" / "ממתין") — שקיפות בניין</li>
      <li>הודעות, הצבעות וסקרים שפרסמת בפני הבניין</li>
      <li>קריאות תחזוקה שפתחת (רק למנהלי הבניין)</li>
      <li>פעולות שבוצעו על-ידך ביומן הפעולות של הוועד (רק חברי ועד)</li>
    </ul>
    <p><b>דיירים לעולם לא יראו:</b></p>
    <ul>
      <li>את מספר הטלפון שלך (אלא אם תבחר לפרסמו מרצונך)</li>
      <li>את כתובת הדוא"ל שלך</li>
      <li>פרטי כרטיס אשראי או אמצעי תשלום</li>
      <li>מידע אישי מבניינים אחרים</li>
      <li>היסטוריית ההתחברויות שלך</li>
    </ul>

    <h3>6.2 ספקי שירות</h3>
    <p>אנו חולקים מידע עם ספקים אמינים רק במידה הנדרשת להפעלת השירות:</p>
    <ul>
      <li><b>Twilio, Inc.</b> (ארה"ב) — שליחת SMS לאימות OTP</li>
      <li><b>SendGrid (Twilio, Inc.)</b> (ארה"ב) — שליחת מיילים שירותיים</li>
      <li><b>Tranzila / Cardcom</b> (ישראל) — עיבוד תשלומים וחיובים חוזרים</li>
      <li><b>Firebase Cloud Messaging</b> (Google LLC, ארה"ב) — התראות Push לאנדרואיד</li>
      <li><b>Apple Push Notification Service</b> (Apple Inc., ארה"ב) — התראות Push ל-iOS</li>
      <li><b>ספק אירוח ענן</b> (כגון Railway, DigitalOcean, Supabase) — תשתית שרתים ומסד נתונים</li>
      <li><b>Sentry</b> (ארה"ב) — ניטור שגיאות (עם סינון של מידע אישי רגיש)</li>
      <li><b>EZcount / GreenInvoice</b> (ישראל) — הפקת חשבוניות מס דיגיטליות מורשות</li>
    </ul>
    <p>כל הספקים מחויבים חוזית לעבד מידע רק לפי הנחיותינו, לעמוד בתקני אבטחה מתאימים, ולציית לחוקי הגנת הפרטיות הרלוונטיים.</p>

    <h3>6.3 רשויות חוק</h3>
    <p>אנו עשויים לחשוף מידע אם נדרש לכך: (א) על-פי חוק, צו בית משפט או דרישה חוקית מחייבת של רשות מוסמכת; (ב) לצורך הגנה על זכויותינו, רכושנו או בטיחותנו; (ג) לצורך מניעת הונאה, פשע או פגיעה במשתמשים אחרים.</p>

    <h3>6.4 העברות עסקיות</h3>
    <p>אם Lobbix תעבור מיזוג, רכישה, מכירת נכסים או פירוק, המידע שלך עשוי להיות מועבר כחלק מהעסקה. נודיע לך לפחות 14 יום לפני שהמידע יהיה כפוף למדיניות פרטיות אחרת.</p>

    <h3>6.5 איננו מוכרים את המידע שלך</h3>
    <p>אנו <b>לעולם לא</b> מוכרים, משכירים, מעבירים בתמורה או מעניקים רישיון למידע האישי שלך למפרסמים, מתווכי מידע, חברות אנליטיקה או כל צד שלישי למטרותיהם הם. השירות <b>אינו נתמך בפרסומות</b>.</p>

    <h3>7. העברות מידע בינלאומיות</h3>
    <p>חלק מספקי השירות שלנו ממוקמים מחוץ לישראל (בעיקר ארה"ב ומדינות האיחוד האירופי). כאשר אנו מעבירים את המידע שלך בינלאומית:</p>
    <ul>
      <li>אנו פועלים בהתאם לתקנות הגנת הפרטיות (העברת מידע אל מאגרי מידע שמחוץ לגבולות המדינה), התשס"א-2001</li>
      <li>אנו מסתמכים על סעיפי חוזה סטנדרטיים (Standard Contractual Clauses) של הנציבות האירופית עבור העברות ליעד שאינו בעל "הגנה נאותה"</li>
      <li>אנו מוודאים שהספקים עומדים בתקני אבטחת מידע מתאימים</li>
      <li>עבור ספקים בארה"ב, אנו מסתמכים על מסגרת פרטיות הנתונים EU-US (Data Privacy Framework) במידת האפשר</li>
    </ul>

    <h3>8. שמירת מידע</h3>
    <table class="legal-table">
      <tr><td><b>נתוני חשבון</b></td><td>כל עוד החשבון פעיל, ועד 90 יום לאחר מחיקה</td></tr>
      <tr><td><b>רשומות פיננסיות</b> (תשלומים, קבלות, חשבוניות)</td><td>7 שנים מיום העסקה — כנדרש לפי פקודת מס הכנסה וחוק מע"מ</td></tr>
      <tr><td><b>יומן פעולות ועד</b></td><td>ללא הגבלת זמן, בצורה אנונימית (ללא שמות אישיים) — לשקיפות מול דיירים אחרים</td></tr>
      <tr><td><b>אסימוני Push</b></td><td>נמחקים כאשר אתה מסיר את האפליקציה או משבית התראות</td></tr>
      <tr><td><b>תקשורת תמיכה</b></td><td>3 שנים</td></tr>
      <tr><td><b>יומני מערכת (לוגים טכניים)</b></td><td>90 יום (למעט אירועי אבטחה — עד 12 חודשים)</td></tr>
      <tr><td><b>מידע שנדרש לגבי מחלוקת משפטית פעילה</b></td><td>עד סיום ההליך ו-6 שנים נוספות (התיישנות)</td></tr>
    </table>
    <p>עם מחיקת החשבון, אנו מבצעים מחיקה רכה של הפרופיל ומסירים גישה פעילה. מחיקה מלאה (hard-delete) מתבצעת לאחר תום תקופות השמירה לעיל.</p>

    <h3>9. זכויותיך</h3>
    <p><b>לפי חוק הגנת הפרטיות בישראל, יש לך את הזכות:</b></p>
    <ul>
      <li><b>לעיין במידע שלך</b> (סעיף 13 לחוק)</li>
      <li><b>לדרוש תיקון מידע לא מדויק</b> (סעיף 14 לחוק)</li>
      <li><b>לדרוש מחיקה</b> של מידע בנסיבות המותרות בחוק</li>
      <li><b>להתנגד לדיוור ישיר</b></li>
    </ul>
    <p><b>לפי GDPR (אם חל עליך), יש לך בנוסף את הזכות:</b></p>
    <ul>
      <li><b>ניידות נתונים (Data Portability):</b> לקבל את המידע שלך בפורמט מובנה, נפוץ וקריא למכונה (JSON)</li>
      <li><b>להתנגד (Right to Object)</b> לעיבוד על בסיס אינטרסים לגיטימיים</li>
      <li><b>להגביל עיבוד (Right to Restriction)</b> בנסיבות מסוימות</li>
      <li><b>לחזור בך מהסכמה (Withdraw Consent)</b> בכל עת</li>
      <li>לא להיות כפוף להחלטות המבוססות <b>אך ורק</b> על עיבוד אוטומטי</li>
      <li><b>להגיש תלונה</b> לרשות פיקוח</li>
    </ul>
    <p><b>כיצד לממש את זכויותיך:</b></p>
    <ul>
      <li><b>באפליקציה (הדרך המהירה):</b> פרופיל ← אזור סכנה ← "ייצוא הנתונים שלי" או "מחק את חשבוני"</li>
      <li><b>בדוא"ל:</b> ${LEGAL_EMAIL_DPO} — נענה תוך 30 יום</li>
      <li><b>אימות זהות:</b> ייתכן שנבקש ממך לאמת את זהותך לפני עיבוד הבקשה, כדי להגן מפני ניסיונות התחזות</li>
    </ul>

    <h3>10. אבטחת מידע</h3>
    <p>אנו מיישמים אמצעים טכניים וארגוניים להגנה על המידע שלך, בהתאם לרמת האבטחה "בינונית" המוגדרת בתקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017:</p>
    <ul>
      <li><b>הצפנת תעבורה:</b> HTTPS/TLS 1.3 בכל התקשורת בין האפליקציה לשרתים</li>
      <li><b>הצפנת מידע במנוחה:</b> מסד הנתונים מוצפן בדיסק</li>
      <li><b>אימות ללא סיסמאות:</b> חיבור בקודים חד-פעמיים או OAuth — איננו שומרים סיסמאות</li>
      <li><b>אסימונים בטוחים:</b> JWT חתומים וקצרי-טווח (שעה), עם refresh token ארוך-טווח</li>
      <li><b>הגבלת קצב:</b> מנגנוני אנטי-brute-force על נתיבי ההזדהות</li>
      <li><b>בקרת גישה:</b> רק עובדים מורשים יכולים לגשת למידע אישי, ורק לצרכים מוגדרים</li>
      <li><b>יומן ביקורת:</b> תיעוד של כל פעולות הוועד בבניין — שקוף לכל דייר</li>
      <li><b>גיבוי ושחזור:</b> גיבויים יומיים מוצפנים עם אפשרות שחזור לנקודת-זמן</li>
      <li><b>ביקורות אבטחה:</b> בדיקות תקופתיות והערכות חשיפה</li>
    </ul>
    <p>למרות אמצעים אלה, שום מערכת אינה מאובטחת בצורה מושלמת. <b>במקרה של אירוע אבטחה מהותי,</b> נודיע לך ולרשות להגנת הפרטיות כנדרש לפי סעיף 11 לתקנות הגנת הפרטיות (אבטחת מידע), תוך 72 שעות מרגע שהתגלה.</p>

    <h3>11. עוגיות (Cookies) ואחסון מקומי</h3>
    <p>אנו משתמשים בעוגיות <b>חיוניות</b> ובאחסון מקומי של הדפדפן (localStorage, IndexedDB) אך ורק לצרכים הבאים:</p>
    <ul>
      <li><b>שמירת כניסה:</b> אסימוני JWT להישארות מחוברים</li>
      <li><b>העדפות משתמש:</b> שפה, מצב כהה, הגדרות התראות</li>
      <li><b>גישה לא מקוונת:</b> Service Worker מאחסן תוכן סטטי כדי שהאפליקציה תעבוד גם בלי אינטרנט</li>
      <li><b>מצב onboarding:</b> האם סיימת את ההדרכה הראשונית</li>
    </ul>
    <p><b>איננו משתמשים</b> בעוגיות פרסום, מעקב בין-אתרי או ניתוחים של צדדים שלישיים. השירות <b>אינו עוקב אחריך באתרים אחרים</b> ואינו משתף מידע עם רשתות פרסום.</p>
    <p>עוגיות חיוניות אינן דורשות הסכמה לפי הדין הישראלי, אך תוכל למחוק אותן בכל עת מהגדרות הדפדפן או באמצעות "אזור סכנה" באפליקציה.</p>

    <h3>12. פרטיות ילדים</h3>
    <p>השירות אינו מיועד לילדים מתחת לגיל 16. איננו אוספים במודע מידע אישי מילדים. אם נגלה שאספנו מידע מילד מתחת לגיל 16 ללא אישור הורה או אפוטרופוס חוקי, נמחק אותו מיידית.</p>
    <p>אם אתה הורה או אפוטרופוס וחושד שילדך מסר לנו מידע, פנה אלינו ב-${LEGAL_EMAIL_DPO}.</p>

    <h3>13. שינויים במדיניות</h3>
    <p>אנו רשאים לעדכן מדיניות זו מעת לעת כדי לשקף שינויים בפעילותנו, בדין החל, או באמצעים הטכנולוגיים שלנו. שינויים מהותיים יפורסמו באמצעות:</p>
    <ul>
      <li>הודעה בולטת בשירות</li>
      <li>דוא"ל לכתובת הרשומה שלך</li>
      <li>התראת Push</li>
    </ul>
    <p>השינויים ייכנסו לתוקף 14 יום לאחר פרסומם. אנו ממליצים לבדוק דף זה מעת לעת.</p>

    <h3>14. תלונות ופניות לרשויות</h3>
    <p>אם אתה סבור כי הפרנו את פרטיותך או את הדין החל:</p>
    <ol>
      <li><b>פנה אלינו תחילה</b> ב-${LEGAL_EMAIL_DPO}. נעשה כל מאמץ לפתור את הסוגיה במהירות, לרוב תוך 30 יום.</li>
      <li><b>אם התשובה אינה משביעת רצון,</b> ניתן להגיש תלונה לרשויות הבאות:</li>
    </ol>
    <ul>
      <li><b>הרשות להגנת הפרטיות בישראל</b> — <a href="https://www.gov.il/he/departments/the_privacy_protection_authority" target="_blank" rel="noopener">www.gov.il/he/departments/the_privacy_protection_authority</a></li>
      <li><b>רשות הגנת הנתונים המקומית באיחוד האירופי</b> (אם אתה תושב EEA) — <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener">edpb.europa.eu/about-edpb/about-edpb/members</a></li>
    </ul>

    <h3>15. יצירת קשר</h3>
    <ul>
      <li><b>ממונה הגנת מידע (DPO):</b> ${LEGAL_EMAIL_DPO}</li>
      <li><b>שאלות פרטיות כלליות:</b> ${LEGAL_EMAIL_PRIVACY}</li>
      <li><b>דואר:</b> ${LEGAL_ADDRESS}</li>
      <li><b>חברה:</b> ${LEGAL_COMPANY}</li>
      <li><b>ח.פ:</b> ${LEGAL_REG}</li>
    </ul>
  `;
}

function renderPrivacyEnglish() {
  return `
    <h3>1. Introduction</h3>
    <p>This Privacy Policy describes how Lobbix ("<b>we</b>", "<b>us</b>", "<b>our</b>"), operated by ${LEGAL_COMPANY}, collects, uses, discloses, and protects your personal information when you use the Service.</p>
    <p>We are committed to protecting your privacy and operate in accordance with:</p>
    <ul>
      <li><b>The Israeli Privacy Protection Law, 5741-1981</b> and its regulations</li>
      <li><b>The Privacy Protection (Information Security) Regulations, 5777-2017</b></li>
      <li><b>The Privacy Protection (Transfer of Data to Databases Abroad) Regulations, 5761-2001</b></li>
      <li><b>The EU General Data Protection Regulation (GDPR)</b> where applicable to users in the European Economic Area</li>
    </ul>

    <h3>2. Data Protection Officer (DPO)</h3>
    <p>For any privacy-related inquiry or to exercise your rights under the law, contact our Data Protection Officer:</p>
    <ul>
      <li><b>Email:</b> ${LEGAL_EMAIL_DPO}</li>
      <li><b>Postal:</b> ${LEGAL_ADDRESS}</li>
    </ul>
    <p>We will respond to any inquiry within 30 days (in complex cases — up to 60 days with prior notice).</p>

    <h3>3. Information We Collect</h3>

    <h3>3.1 Information you provide to us</h3>
    <ul>
      <li>Full name</li>
      <li>Phone number (for identification and receiving OTP codes)</li>
      <li>Email address (optional, for notifications)</li>
      <li>Apartment number and floor</li>
      <li>Building association</li>
      <li>Payment preferences (credit card tokens, <b>not</b> card numbers)</li>
      <li>Content you upload: tickets, announcements, votes, comments, documents, receipts, photos</li>
    </ul>

    <h3>3.2 Information collected automatically</h3>
    <ul>
      <li>IP address</li>
      <li>Device type, operating system, browser version</li>
      <li>Push notification token (only if you opted in)</li>
      <li>Usage logs (pages visited, actions taken, timestamps)</li>
      <li>Approximate location derived from IP (not GPS)</li>
      <li>Service performance data (for debugging)</li>
    </ul>

    <h3>3.3 Information from third parties</h3>
    <ul>
      <li><b>Google Sign-in:</b> email address, full name, and profile picture (only if you choose this option)</li>
      <li><b>Payment providers:</b> transaction IDs, payment status, and last four digits of card (not the full card number)</li>
    </ul>

    <h3>4. Legal Bases for Processing</h3>
    <p>Under the GDPR and the Israeli Privacy Protection Law, we process data on one or more of the following bases:</p>
    <ul>
      <li><b>Contract:</b> to provide the Service you signed up for</li>
      <li><b>Legitimate interests:</b> to operate, improve, and secure the Service, prevent fraud, and protect other users</li>
      <li><b>Consent:</b> for optional features (e.g., push notifications, marketing emails)</li>
      <li><b>Legal obligation:</b> to comply with tax, accounting, and enforcement authorities' orders</li>
    </ul>

    <h3>5. How We Use Your Information</h3>
    <ul>
      <li>To provide, maintain, and improve the Service</li>
      <li>To process payments and issue receipts and tax invoices</li>
      <li>To communicate with you about your account, the Building, and essential service updates</li>
      <li>To send notifications (Push, SMS, email) as per your preferences</li>
      <li>To enforce our Terms and prevent fraud, abuse, or security violations</li>
      <li>To comply with legal obligations (tax records, reporting, court orders)</li>
      <li>To analyze performance and debug issues</li>
      <li>To produce aggregated, anonymized statistics for Service development</li>
    </ul>
    <p>We <b>do not</b> use your data to make automated decisions with legal or similarly significant effects on you.</p>

    <h3>6. Who We Share With</h3>

    <h3>6.1 Other residents in your Building</h3>
    <p>Other users in your Building may see the following information:</p>
    <ul>
      <li>Your full name and apartment number (in the resident directory)</li>
      <li>Aggregate payment status (e.g., "paid" / "pending") — for building transparency</li>
      <li>Announcements, votes, and polls you publish to the Building</li>
      <li>Maintenance tickets you open (visible only to building managers)</li>
      <li>Actions you take in the committee audit log (only committee members)</li>
    </ul>
    <p><b>Residents will never see:</b></p>
    <ul>
      <li>Your phone number (unless you choose to publish it)</li>
      <li>Your email address</li>
      <li>Credit card details or payment methods</li>
      <li>Personal data from other buildings</li>
      <li>Your login history</li>
    </ul>

    <h3>6.2 Service Providers</h3>
    <p>We share data with trusted providers strictly as needed to operate the Service:</p>
    <ul>
      <li><b>Twilio, Inc.</b> (USA) — SMS delivery for OTP authentication</li>
      <li><b>SendGrid (Twilio, Inc.)</b> (USA) — transactional emails</li>
      <li><b>Tranzila / Cardcom</b> (Israel) — payment processing and recurring charges</li>
      <li><b>Firebase Cloud Messaging</b> (Google LLC, USA) — Android push notifications</li>
      <li><b>Apple Push Notification Service</b> (Apple Inc., USA) — iOS push notifications</li>
      <li><b>Cloud hosting provider</b> (e.g., Railway, DigitalOcean, Supabase) — server infrastructure and database</li>
      <li><b>Sentry</b> (USA) — error monitoring (with sensitive PII scrubbed)</li>
      <li><b>EZcount / GreenInvoice</b> (Israel) — authorized digital tax invoice generation</li>
    </ul>
    <p>All providers are contractually bound to process data only on our instructions, maintain appropriate security standards, and comply with applicable data protection laws.</p>

    <h3>6.3 Legal Authorities</h3>
    <p>We may disclose information if required: (a) by law, court order, or binding legal demand from a competent authority; (b) to protect our rights, property, or safety; (c) to prevent fraud, crime, or harm to other users.</p>

    <h3>6.4 Business Transfers</h3>
    <p>If Lobbix undergoes a merger, acquisition, sale of assets, or dissolution, your data may be transferred as part of the transaction. We will notify you at least 14 days before your data becomes subject to a different privacy policy.</p>

    <h3>6.5 We do not sell your data</h3>
    <p>We <b>never</b> sell, rent, trade for consideration, or license your personal data to advertisers, data brokers, analytics companies, or any third party for their own purposes. The Service is <b>not ad-supported</b>.</p>

    <h3>7. International Data Transfers</h3>
    <p>Some of our service providers are located outside Israel (primarily the USA and EU member states). When we transfer your data internationally:</p>
    <ul>
      <li>We comply with the Privacy Protection (Transfer of Data to Databases Abroad) Regulations, 5761-2001</li>
      <li>We rely on the European Commission's Standard Contractual Clauses (SCCs) for transfers to destinations lacking "adequate protection"</li>
      <li>We ensure providers maintain appropriate information security standards</li>
      <li>For US-based providers, we rely on the EU-US Data Privacy Framework where available</li>
    </ul>

    <h3>8. Data Retention</h3>
    <table class="legal-table">
      <tr><td><b>Account data</b></td><td>While the account is active, and up to 90 days after deletion</td></tr>
      <tr><td><b>Financial records</b> (payments, receipts, invoices)</td><td>7 years from the transaction date — as required by the Israeli Income Tax Ordinance and VAT Law</td></tr>
      <tr><td><b>Committee audit log</b></td><td>Indefinitely, in anonymized form (no personal names) — for transparency to other residents</td></tr>
      <tr><td><b>Push tokens</b></td><td>Deleted when you uninstall the app or disable notifications</td></tr>
      <tr><td><b>Support communications</b></td><td>3 years</td></tr>
      <tr><td><b>System logs (technical)</b></td><td>90 days (security events — up to 12 months)</td></tr>
      <tr><td><b>Data subject to active legal dispute</b></td><td>Until proceeding ends, plus 6 additional years (limitation period)</td></tr>
    </table>
    <p>Upon account deletion, we soft-delete the profile and remove active access. Full hard-delete is performed after the retention periods above expire.</p>

    <h3>9. Your Rights</h3>
    <p><b>Under the Israeli Privacy Protection Law you have the right to:</b></p>
    <ul>
      <li><b>Access your data</b> (Section 13 of the Law)</li>
      <li><b>Request correction</b> of inaccurate data (Section 14 of the Law)</li>
      <li><b>Request deletion</b> of data in legally permissible circumstances</li>
      <li><b>Opt out of direct marketing</b></li>
    </ul>
    <p><b>Under the GDPR (if applicable) you additionally have the right to:</b></p>
    <ul>
      <li><b>Data Portability:</b> receive your data in a structured, commonly used, machine-readable format (JSON)</li>
      <li><b>Right to Object</b> to processing based on legitimate interests</li>
      <li><b>Right to Restriction</b> of processing under certain circumstances</li>
      <li><b>Withdraw Consent</b> at any time</li>
      <li>Not be subject to decisions based <b>solely</b> on automated processing</li>
      <li><b>Lodge a complaint</b> with a supervisory authority</li>
    </ul>
    <p><b>How to exercise your rights:</b></p>
    <ul>
      <li><b>In-app (fastest):</b> Profile → Danger Zone → "Export my data" or "Delete my account"</li>
      <li><b>By email:</b> ${LEGAL_EMAIL_DPO} — we respond within 30 days</li>
      <li><b>Identity verification:</b> we may ask you to verify your identity before processing your request, to guard against impersonation</li>
    </ul>

    <h3>10. Information Security</h3>
    <p>We implement technical and organizational measures to protect your data, in accordance with the "medium" security level defined in the Privacy Protection (Information Security) Regulations, 5777-2017:</p>
    <ul>
      <li><b>Transport encryption:</b> HTTPS/TLS 1.3 for all communication between the app and servers</li>
      <li><b>Encryption at rest:</b> the database is encrypted on disk</li>
      <li><b>Password-less authentication:</b> login via one-time codes or OAuth — we do not store passwords</li>
      <li><b>Secure tokens:</b> signed, short-lived JWTs (1 hour) with long-lived refresh tokens</li>
      <li><b>Rate limiting:</b> anti-brute-force mechanisms on authentication endpoints</li>
      <li><b>Access control:</b> only authorized staff can access personal data, and only for defined purposes</li>
      <li><b>Audit log:</b> full record of committee actions in the building — transparent to every resident</li>
      <li><b>Backup and recovery:</b> daily encrypted backups with point-in-time restore capability</li>
      <li><b>Security reviews:</b> periodic audits and vulnerability assessments</li>
    </ul>
    <p>Despite these measures, no system is perfectly secure. <b>In the event of a material security incident,</b> we will notify you and the Israeli Privacy Protection Authority within 72 hours of discovery, as required by Section 11 of the Privacy Protection (Information Security) Regulations.</p>

    <h3>11. Cookies and Local Storage</h3>
    <p>We use <b>essential</b> cookies and browser local storage (localStorage, IndexedDB) solely for the following purposes:</p>
    <ul>
      <li><b>Session persistence:</b> JWT tokens to keep you logged in</li>
      <li><b>User preferences:</b> language, dark mode, notification settings</li>
      <li><b>Offline access:</b> Service Worker caches static content so the app works without internet</li>
      <li><b>Onboarding state:</b> whether you completed the initial tutorial</li>
    </ul>
    <p>We <b>do not use</b> advertising cookies, cross-site tracking, or third-party analytics. The Service <b>does not track you across other websites</b> and does not share data with advertising networks.</p>
    <p>Essential cookies do not require consent under Israeli law, but you can delete them at any time from browser settings or via "Danger Zone" in the app.</p>

    <h3>12. Children's Privacy</h3>
    <p>The Service is not directed to children under 16. We do not knowingly collect personal information from children. If we learn we have collected data from a child under 16 without parental or legal guardian consent, we will delete it immediately.</p>
    <p>If you are a parent or guardian and suspect your child has provided us with information, contact us at ${LEGAL_EMAIL_DPO}.</p>

    <h3>13. Changes to this Policy</h3>
    <p>We may update this Policy from time to time to reflect changes in our operations, applicable law, or technological measures. Material changes will be announced via:</p>
    <ul>
      <li>A prominent notice in the Service</li>
      <li>Email to your registered address</li>
      <li>Push notification</li>
    </ul>
    <p>Changes take effect 14 days after publication. We encourage you to review this page periodically.</p>

    <h3>14. Complaints and Authority Contacts</h3>
    <p>If you believe we have mishandled your privacy or violated applicable law:</p>
    <ol>
      <li><b>Contact us first</b> at ${LEGAL_EMAIL_DPO}. We will make every effort to resolve the issue quickly, usually within 30 days.</li>
      <li><b>If the response is unsatisfactory,</b> you may file a complaint with the following authorities:</li>
    </ol>
    <ul>
      <li><b>The Israeli Privacy Protection Authority</b> — <a href="https://www.gov.il/he/departments/the_privacy_protection_authority" target="_blank" rel="noopener">www.gov.il/he/departments/the_privacy_protection_authority</a></li>
      <li><b>Your local EU Data Protection Authority</b> (if you are an EEA resident) — <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener">edpb.europa.eu/about-edpb/about-edpb/members</a></li>
    </ul>

    <h3>15. Contact Us</h3>
    <ul>
      <li><b>Data Protection Officer (DPO):</b> ${LEGAL_EMAIL_DPO}</li>
      <li><b>General privacy inquiries:</b> ${LEGAL_EMAIL_PRIVACY}</li>
      <li><b>Postal:</b> ${LEGAL_ADDRESS}</li>
      <li><b>Company:</b> ${LEGAL_COMPANY}</li>
      <li><b>Registration:</b> ${LEGAL_REG}</li>
    </ul>
  `;
}

async function exportMyData() {
  try {
    const data = await api('/api/v1/me/data');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vaadapp-my-data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    celebrate(t('export.done'));
  } catch (e) { toast(e.message); }
}
window.exportMyData = exportMyData;

async function deleteMyAccount() {
  if (!confirm(t('danger.confirmDelete'))) return;
  if (!confirm(t('danger.confirmDelete2'))) return;
  try {
    await api('/api/v1/me', { method: 'DELETE' });
    toast(t('danger.deleted'));
    store.token = null;
    store.user = null;
    setTimeout(() => { location.reload(); }, 1200);
  } catch (e) { toast(e.message); }
}
window.deleteMyAccount = deleteMyAccount;

// ---------------- Init hooks (run once on DOMContentLoaded-like) ----------------
setupOfflineBar();
setupInstallBanner();
setupPullToRefresh();
// Put SOS FAB only once the dashboard is shown
const origEnterDashboard = enterDashboard;
window.enterDashboard = async function() {
  const r = await origEnterDashboard.apply(this, arguments);
  ensureSosFab();
  return r;
};

// ---------------- Init ----------------
// Fetch public config and decide whether demo-only UI should render.
// Defaults to demo mode ON if the endpoint is unreachable (local dev).
(async () => {
  let cfg = { demoMode: true, brand: 'Lobbix', version: '1.1.0' };
  try {
    const res = await fetch('/api/config', { cache: 'no-store' });
    if (res.ok) cfg = await res.json();
  } catch {}
  window.__lobbix_config = cfg;
  document.body.classList.toggle('demo-mode', cfg.demoMode !== false);
})();

applyTheme();
if (store.token) {
  enterDashboard();
  ensureSosFab();
} else {
  show('login');
}
