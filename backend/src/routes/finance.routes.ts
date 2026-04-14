import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { audit } from '../middleware/audit';
import { query } from '../config/database';

const router = Router();
router.use(authenticate);

// Ensure tables exist at startup (idempotent)
(async () => {
  try {
    await query(`CREATE TABLE IF NOT EXISTS payment_rules (
      id TEXT PRIMARY KEY,
      building_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'ILS',
      frequency TEXT NOT NULL,
      day_of_month INTEGER,
      start_date TEXT,
      applies_to TEXT DEFAULT 'all',
      active INTEGER DEFAULT 1,
      created_by_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
    await query(`CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      building_id TEXT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'ILS',
      category TEXT,
      expense_date TEXT,
      receipt_data TEXT,
      notes TEXT,
      created_by_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
  } catch (e) { console.error('finance table init', e); }
})();

const isVaad = (req: AuthRequest) =>
  ['vaad_admin', 'vaad_member', 'treasurer'].includes(req.user!.role);

// ---------- Payment rules ----------
router.get('/payment-rules', asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT pr.id, pr.name, pr.description, pr.amount, pr.currency, pr.frequency,
            pr.day_of_month, pr.start_date, pr.applies_to, pr.active, pr.created_at,
            r.full_name AS created_by_name
     FROM payment_rules pr
     LEFT JOIN residents r ON r.id = pr.created_by_id
     WHERE pr.building_id = $1
     ORDER BY pr.active DESC, pr.created_at DESC`,
    [req.user!.buildingId]
  );
  res.json({ rules: result.rows });
}));

router.post('/payment-rules', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  const { name, description, amount, frequency, day_of_month, start_date, applies_to } = req.body;
  if (!name || !amount || !frequency) throw new AppError('name, amount, frequency required', 400);
  await query(
    `INSERT INTO payment_rules (building_id, name, description, amount, frequency, day_of_month, start_date, applies_to, created_by_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      req.user!.buildingId,
      String(name).slice(0, 120),
      description || null,
      Number(amount),
      frequency,
      day_of_month != null ? Number(day_of_month) : null,
      start_date || null,
      applies_to ? JSON.stringify(applies_to) : 'all',
      req.user!.id,
    ]
  );
  audit(req, { action: 'payment_rule.create', entity_type: 'payment_rule', summary: `${name} — ₪${amount}/${frequency}` });
  res.status(201).json({ message: 'Rule created' });
}));

router.delete('/payment-rules/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  await query(
    `DELETE FROM payment_rules WHERE id = $1 AND building_id = $2`,
    [req.params.id, req.user!.buildingId]
  );
  res.json({ message: 'Rule deleted' });
}));

// Apply a rule now → create payments for all applicable residents
router.post('/payment-rules/:id/apply', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  const ruleRes = await query(
    `SELECT * FROM payment_rules WHERE id = $1 AND building_id = $2`,
    [req.params.id, req.user!.buildingId]
  );
  const rule = ruleRes.rows[0];
  if (!rule) throw new AppError('Rule not found', 404);

  // Determine who it applies to
  let targetIds: string[] = [];
  if (rule.applies_to && rule.applies_to !== 'all') {
    try { targetIds = JSON.parse(rule.applies_to); } catch { targetIds = []; }
  }
  let residents;
  if (targetIds.length > 0) {
    // Fetch specific residents
    const rows = await query(
      `SELECT id FROM residents WHERE building_id = $1`,
      [req.user!.buildingId]
    );
    residents = rows.rows.filter((r: any) => targetIds.includes(r.id));
  } else {
    const rows = await query(
      `SELECT id FROM residents WHERE building_id = $1 AND role = 'resident'`,
      [req.user!.buildingId]
    );
    residents = rows.rows;
  }

  // Compute due date: next occurrence based on frequency + day_of_month
  const today = new Date();
  let dueDate: Date;
  if (rule.frequency === 'monthly') {
    const d = rule.day_of_month || 1;
    dueDate = new Date(today.getFullYear(), today.getMonth(), d);
    if (dueDate < today) dueDate = new Date(today.getFullYear(), today.getMonth() + 1, d);
  } else if (rule.frequency === 'quarterly') {
    dueDate = new Date(today.getFullYear(), today.getMonth() + 3, 1);
  } else if (rule.frequency === 'yearly') {
    dueDate = new Date(today.getFullYear() + 1, today.getMonth(), 1);
  } else {
    dueDate = today;
  }
  const dueStr = dueDate.toISOString().slice(0, 10);

  // Insert one payment per resident
  let created = 0;
  for (const r of residents) {
    try {
      await query(
        `INSERT INTO payments (building_id, resident_id, payment_type, description, amount, currency, due_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
        [
          req.user!.buildingId,
          r.id,
          'rule',
          rule.name,
          Number(rule.amount),
          rule.currency || 'ILS',
          dueStr,
        ]
      );
      created++;
    } catch (e) { /* ignore dup */ }
  }
  audit(req, { action: 'payment_rule.apply', entity_type: 'payment_rule', entity_id: req.params.id, summary: `${rule.name} → ${created} payments created` });
  res.json({ message: 'Rule applied', created });
}));

// ---------- Expenses ----------
router.get('/expenses', asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT e.id, e.title, e.amount, e.currency, e.category, e.expense_date, e.notes, e.receipt_data, e.created_at,
            r.full_name AS created_by_name
     FROM expenses e
     LEFT JOIN residents r ON r.id = e.created_by_id
     WHERE e.building_id = $1
     ORDER BY e.expense_date DESC, e.created_at DESC`,
    [req.user!.buildingId]
  );
  res.json({ expenses: result.rows });
}));

router.post('/expenses', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  const { title, amount, category, expense_date, receipt_data, notes } = req.body;
  if (!title || !amount) throw new AppError('title and amount required', 400);
  // Cap base64 receipt at ~1MB to avoid blowing the DB
  const receipt = receipt_data && String(receipt_data).length < 1_400_000 ? receipt_data : null;
  await query(
    `INSERT INTO expenses (building_id, title, amount, category, expense_date, receipt_data, notes, created_by_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      req.user!.buildingId,
      String(title).slice(0, 160),
      Number(amount),
      category || 'other',
      expense_date || new Date().toISOString().slice(0, 10),
      receipt,
      notes || null,
      req.user!.id,
    ]
  );
  audit(req, { action: 'expense.create', entity_type: 'expense', summary: `${title} — ₪${amount} (${category || 'other'})` });
  res.status(201).json({ message: 'Expense created' });
}));

router.delete('/expenses/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  await query(
    `DELETE FROM expenses WHERE id = $1 AND building_id = $2`,
    [req.params.id, req.user!.buildingId]
  );
  res.json({ message: 'Expense deleted' });
}));

export default router;
