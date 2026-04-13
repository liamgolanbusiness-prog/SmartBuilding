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
    'tour.s1.t': 'ברוכים הבאים ל‑VaadApp 👋',
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
    'invite.shareMsg': 'הצטרפו לבניין {bld} ב‑VaadApp עם קוד ההזמנה: {code}',
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
    'tour.s1.t': 'Welcome to VaadApp 👋',
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
    'invite.shareMsg': 'Join {bld} on VaadApp with invite code: {code}',
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
const views = ['login', 'home', 'announcements', 'tickets', 'payments', 'residents', 'profile', 'ticket-detail', 'ann-detail', 'admin', 'onboarded', 'management'];
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
  if (route === 'admin') loadAdminBuildings();
  if (route === 'management') loadManagement();
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
    const res = await api('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phoneNumber }) });
    $('step-phone').classList.add('hidden');
    $('step-otp').classList.remove('hidden');
    $$('.otp-input input')[0].focus();
    toast(t('login.codeSent'));
    // DEMO_MODE: backend returns the OTP directly so phone users without
    // server-log access can still log in. Auto-fill and trigger verify.
    if (res && res.demoOtp) {
      const digits = String(res.demoOtp).slice(0, 6).split('');
      const inputs = $$('.otp-input input');
      inputs.forEach((inp, idx) => { inp.value = digits[idx] || ''; });
      toast('Demo mode: code auto-filled (' + res.demoOtp + ')');
      if (digits.length === 6) setTimeout(() => $('verify-otp').click(), 400);
    }
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
    // First-time tour
    if (!localStorage.getItem('vaad_tour_done')) {
      setTimeout(() => startTour(), 800);
    }
  } catch (e) {
    console.error(e);
    store.token = null; store.user = null;
    show('login');
  }
}

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
  if (!appState.mgmtTab) appState.mgmtTab = 'rules';
  setMgmtTab(appState.mgmtTab);
}

function setMgmtTab(tab) {
  appState.mgmtTab = tab;
  document.querySelectorAll('.mgmt-tab').forEach((b) => b.classList.toggle('active', b.dataset.mt === tab));
  ['rules', 'expenses', 'maintenance'].forEach((k) => {
    $('mgmt-' + k)?.classList.toggle('hidden', k !== tab);
  });
  if (tab === 'rules') loadPaymentRules();
  if (tab === 'expenses') loadExpenses();
  if (tab === 'maintenance') loadMaintenance();
}
document.querySelectorAll('.mgmt-tab').forEach((b) => b.addEventListener('click', () => setMgmtTab(b.dataset.mt)));
$('open-mgmt-btn')?.addEventListener('click', () => show('management'));

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
      el.querySelector('[data-act="apply"]').addEventListener('click', async () => {
        try {
          const res = await api('/api/finance/payment-rules/' + id + '/apply', { method: 'POST' });
          toast(t('rule.applied', { n: res.created }));
        } catch (e) { toast(e.message); }
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
    start_date: $('r-start').value || null,
    applies_to: getAudiencePayload(),
  };
  if (!payload.name || !payload.amount || !payload.frequency) return toast(t('admin.needAllFields'));
  try {
    await api('/api/finance/payment-rules', { method: 'POST', body: JSON.stringify(payload) });
    ['r-name', 'r-desc', 'r-amount', 'r-dom', 'r-start'].forEach((id) => ($(id).value = ''));
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

// ---------------- Init ----------------
applyTheme();
if (store.token) {
  enterDashboard();
} else {
  show('login');
}
