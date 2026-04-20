import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { audit } from '../middleware/audit';
import { query } from '../config/database';

const router = Router();
router.use(authenticate);

const isVaad = (req: AuthRequest) =>
  ['vaad_admin', 'vaad_member', 'treasurer'].includes(req.user!.role);

const requireVaad = (req: AuthRequest) => {
  if (!isVaad(req)) throw new AppError('Vaad access required', 403);
};

// Flip any pending payment whose due_date has passed to status='overdue'.
// Ultra-cheap to run on every list read — it's a single UPDATE with an
// indexed WHERE. Avoids standing up a cron just for status hygiene.
async function autoFlipOverdue(buildingId: string) {
  try {
    await query(
      `UPDATE payments
          SET status = 'overdue', updated_at = NOW()
        WHERE building_id = $1
          AND status = 'pending'
          AND due_date < CURRENT_DATE`,
      [buildingId]
    );
  } catch (err) {
    // Don't block the read if this ever hiccups — just log.
    console.error('autoFlipOverdue failed:', (err as Error).message);
  }
}

// Guarantee the payment belongs to the current user's building before any
// vaad action. Prevents a member of building A from touching building B.
async function loadPaymentForBuilding(id: string, buildingId: string) {
  const r = await query(
    `SELECT * FROM payments WHERE id = $1 AND building_id = $2`,
    [id, buildingId]
  );
  if (r.rows.length === 0) throw new AppError('Payment not found', 404);
  return r.rows[0];
}

// List payments for current user's building. Supports optional search +
// status / month / resident filters so the admin panel can do everything
// in one round-trip. Runs auto-flip-to-overdue first so the returned
// statuses are always fresh.
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await autoFlipOverdue(req.user!.buildingId);
    const { search, status, resident_id, month } = req.query as Record<string, string>;
    const params: any[] = [req.user!.buildingId];
    const where: string[] = ['p.building_id = $1'];

    if (status && ['pending', 'paid', 'overdue', 'cancelled'].includes(status)) {
      params.push(status);
      where.push(`p.status = $${params.length}`);
    }
    if (resident_id) {
      params.push(resident_id);
      where.push(`p.resident_id = $${params.length}`);
    }
    // month = YYYY-MM → filter by due_date within that calendar month
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      params.push(month + '-01');
      where.push(
        `p.due_date >= $${params.length}::date AND p.due_date < ($${params.length}::date + INTERVAL '1 month')`
      );
    }
    if (search && search.trim()) {
      params.push('%' + search.trim().toLowerCase() + '%');
      const i = params.length;
      where.push(
        `(LOWER(r.full_name) LIKE $${i} OR LOWER(p.description) LIKE $${i} OR CAST(p.amount AS TEXT) LIKE $${i} OR r.apartment_number LIKE $${i})`
      );
    }

    const result = await query(
      `SELECT p.id, p.payment_type, p.description, p.amount, p.currency,
              p.due_date, p.payment_date, p.status, p.payment_method,
              p.metadata, p.created_at, p.resident_id,
              r.full_name, r.apartment_number, r.floor,
              CASE
                WHEN p.status = 'paid' THEN 0
                ELSE GREATEST(0, (CURRENT_DATE - p.due_date)::int)
              END AS days_overdue
       FROM payments p
       LEFT JOIN residents r ON r.id = p.resident_id
       WHERE ${where.join(' AND ')}
       ORDER BY
         CASE p.status WHEN 'overdue' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END,
         p.due_date DESC`,
      params
    );
    res.json({ payments: result.rows });
  })
);

// Debtors aggregate — who's behind, how much, how long. Powers the red
// "in arrears" card at the top of the vaad payments panel.
router.get(
  '/debtors',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    requireVaad(req);
    await autoFlipOverdue(req.user!.buildingId);
    const result = await query(
      `SELECT r.id AS resident_id,
              r.full_name,
              r.apartment_number,
              r.floor,
              r.phone_number,
              COUNT(p.id)::int AS unpaid_count,
              COALESCE(SUM(p.amount), 0)::numeric AS total_owed,
              MAX(GREATEST(0, (CURRENT_DATE - p.due_date)::int))::int AS oldest_days_overdue,
              MIN(p.due_date) AS oldest_due
         FROM payments p
         JOIN residents r ON r.id = p.resident_id
        WHERE p.building_id = $1
          AND p.status IN ('pending', 'overdue')
          AND p.due_date < CURRENT_DATE
        GROUP BY r.id, r.full_name, r.apartment_number, r.floor, r.phone_number
        ORDER BY oldest_days_overdue DESC, total_owed DESC
        LIMIT 50`,
      [req.user!.buildingId]
    );
    res.json({ debtors: result.rows });
  })
);

// 12-month rolling analytics: per-month due vs collected, plus breakdowns
// by payment method and category. Powers the charts on the vaad panel.
router.get(
  '/analytics',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    requireVaad(req);
    await autoFlipOverdue(req.user!.buildingId);

    const months = await query(
      `WITH month_series AS (
         SELECT generate_series(
           DATE_TRUNC('month', NOW() - INTERVAL '11 months'),
           DATE_TRUNC('month', NOW()),
           INTERVAL '1 month'
         ) AS m
       )
       SELECT TO_CHAR(ms.m, 'YYYY-MM') AS month,
              COALESCE(SUM(p.amount) FILTER (
                WHERE p.due_date >= ms.m AND p.due_date < ms.m + INTERVAL '1 month'
              ), 0)::numeric AS due_total,
              COALESCE(SUM(p.amount) FILTER (
                WHERE p.status = 'paid'
                  AND p.payment_date >= ms.m AND p.payment_date < ms.m + INTERVAL '1 month'
              ), 0)::numeric AS collected_total,
              COUNT(p.id) FILTER (
                WHERE p.status = 'paid'
                  AND p.payment_date >= ms.m AND p.payment_date < ms.m + INTERVAL '1 month'
              )::int AS paid_count
         FROM month_series ms
         LEFT JOIN payments p ON p.building_id = $1
        GROUP BY ms.m
        ORDER BY ms.m`,
      [req.user!.buildingId]
    );

    const methods = await query(
      `SELECT COALESCE(payment_method, 'other') AS method,
              COUNT(*)::int AS n,
              COALESCE(SUM(amount), 0)::numeric AS total
         FROM payments
        WHERE building_id = $1 AND status = 'paid'
        GROUP BY method
        ORDER BY total DESC`,
      [req.user!.buildingId]
    );

    const ytdPaid = await query(
      `SELECT COALESCE(SUM(amount), 0)::numeric AS total
         FROM payments
        WHERE building_id = $1 AND status = 'paid'
          AND payment_date >= DATE_TRUNC('year', NOW())`,
      [req.user!.buildingId]
    );

    const ytdDue = await query(
      `SELECT COALESCE(SUM(amount), 0)::numeric AS total
         FROM payments
        WHERE building_id = $1
          AND due_date >= DATE_TRUNC('year', NOW())
          AND due_date <= CURRENT_DATE`,
      [req.user!.buildingId]
    );

    res.json({
      months: months.rows.map((r: any) => ({
        month: r.month,
        due: Number(r.due_total) || 0,
        collected: Number(r.collected_total) || 0,
        paid_count: Number(r.paid_count) || 0,
      })),
      methods: methods.rows.map((r: any) => ({
        method: r.method,
        n: Number(r.n) || 0,
        total: Number(r.total) || 0,
      })),
      ytd: {
        paid: Number(ytdPaid.rows[0].total) || 0,
        due: Number(ytdDue.rows[0].total) || 0,
      },
    });
  })
);

// Aggregated stats — the single source of truth for every payments view
// (personal Payments tab, vaad management panel, resident profile card).
// Intentionally available to all residents: the whole product promise is
// transparency of the building's finances.
router.get(
  '/stats',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await autoFlipOverdue(req.user!.buildingId);
    const b = req.user!.buildingId;
    const paidThisMonth = await query(
      `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n
         FROM payments
        WHERE building_id = $1 AND status = 'paid'
          AND payment_date >= DATE_TRUNC('month', NOW())`,
      [b]
    );
    const pending = await query(
      `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n
         FROM payments
        WHERE building_id = $1 AND status IN ('pending', 'overdue')`,
      [b]
    );
    const overdue = await query(
      `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n,
              COUNT(DISTINCT resident_id) AS debtors
         FROM payments
        WHERE building_id = $1
          AND status IN ('pending', 'overdue')
          AND due_date < CURRENT_DATE`,
      [b]
    );
    const totalDue = await query(
      `SELECT COALESCE(SUM(amount), 0) AS total
         FROM payments
        WHERE building_id = $1
          AND due_date >= DATE_TRUNC('month', NOW())
          AND due_date < DATE_TRUNC('month', NOW()) + INTERVAL '1 month'`,
      [b]
    );
    const paidMonthTotal = Number(paidThisMonth.rows[0].total) || 0;
    const dueMonthTotal = Number(totalDue.rows[0].total) || 0;
    const collectionRate = dueMonthTotal > 0
      ? Math.round((paidMonthTotal / dueMonthTotal) * 100)
      : null;
    res.json({
      paid_this_month: { total: paidMonthTotal, count: Number(paidThisMonth.rows[0].n) || 0 },
      pending: { total: Number(pending.rows[0].total) || 0, count: Number(pending.rows[0].n) || 0 },
      overdue: {
        total: Number(overdue.rows[0].total) || 0,
        count: Number(overdue.rows[0].n) || 0,
        debtors: Number(overdue.rows[0].debtors) || 0,
      },
      collection_rate: collectionRate,
    });
  })
);

// Create a one-off payment on demand (vaad adding an ad-hoc charge).
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    requireVaad(req);
    const { resident_id, description, amount, due_date, payment_type } = req.body || {};
    if (!resident_id || !description || !amount) {
      throw new AppError('resident_id, description, amount required', 400);
    }
    const resCheck = await query(
      `SELECT id FROM residents WHERE id = $1 AND building_id = $2`,
      [resident_id, req.user!.buildingId]
    );
    if (resCheck.rows.length === 0) throw new AppError('Resident not in building', 400);
    const r = await query(
      `INSERT INTO payments (building_id, resident_id, payment_type, description, amount, currency, due_date, status)
       VALUES ($1, $2, $3, $4, $5, 'ILS', $6, 'pending')
       RETURNING id`,
      [
        req.user!.buildingId,
        resident_id,
        String(payment_type || 'one_time').slice(0, 40),
        String(description).slice(0, 200),
        Number(amount),
        due_date || new Date().toISOString().slice(0, 10),
      ]
    );
    audit(req, { action: 'payment.create', entity_type: 'payment', entity_id: r.rows[0].id, summary: `${description} · ₪${amount}` });
    res.json({ id: r.rows[0].id });
  })
);

// Mark a payment as paid. Vaad supplies the method (cash, check, bank_transfer,
// app) so the audit trail explains how the money arrived.
router.post(
  '/:id/mark-paid',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    requireVaad(req);
    const payment = await loadPaymentForBuilding(req.params.id, req.user!.buildingId);
    const { payment_method, payment_date, note } = req.body || {};
    const method = ['cash', 'check', 'bank_transfer', 'app', 'other'].includes(payment_method)
      ? payment_method
      : 'other';
    const date = payment_date || new Date().toISOString().slice(0, 10);
    const metadata = { ...(payment.metadata || {}), manual_note: note || null, marked_by: req.user!.id, marked_at: new Date().toISOString() };
    await query(
      `UPDATE payments
          SET status = 'paid',
              payment_method = $2,
              payment_date = $3,
              metadata = $4::jsonb,
              updated_at = NOW()
        WHERE id = $1`,
      [req.params.id, method, date, JSON.stringify(metadata)]
    );
    audit(req, { action: 'payment.mark_paid', entity_type: 'payment', entity_id: req.params.id, summary: `${payment.description} · ${method}` });
    res.json({ ok: true });
  })
);

// Revert a paid payment back to pending — e.g. the check bounced.
router.post(
  '/:id/mark-pending',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    requireVaad(req);
    const payment = await loadPaymentForBuilding(req.params.id, req.user!.buildingId);
    await query(
      `UPDATE payments
          SET status = 'pending',
              payment_date = NULL,
              payment_method = NULL,
              updated_at = NOW()
        WHERE id = $1`,
      [req.params.id]
    );
    audit(req, { action: 'payment.mark_pending', entity_type: 'payment', entity_id: req.params.id, summary: `${payment.description}` });
    res.json({ ok: true });
  })
);

// Edit amount / description / due_date. Other fields stay immutable.
router.patch(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    requireVaad(req);
    const payment = await loadPaymentForBuilding(req.params.id, req.user!.buildingId);
    const { description, amount, due_date } = req.body || {};
    const next = {
      description: typeof description === 'string' && description.trim() ? description.trim() : payment.description,
      amount: amount != null && !isNaN(Number(amount)) ? Number(amount) : Number(payment.amount),
      due_date: due_date || payment.due_date,
    };
    await query(
      `UPDATE payments SET description=$2, amount=$3, due_date=$4, updated_at=NOW() WHERE id=$1`,
      [req.params.id, next.description, next.amount, next.due_date]
    );
    audit(req, { action: 'payment.update', entity_type: 'payment', entity_id: req.params.id, summary: `${next.description} · ₪${next.amount}` });
    res.json({ ok: true });
  })
);

// Delete a single payment. Useful to remove a duplicate or a mistake.
router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    requireVaad(req);
    const payment = await loadPaymentForBuilding(req.params.id, req.user!.buildingId);
    await query(`DELETE FROM payments WHERE id = $1`, [req.params.id]);
    audit(req, { action: 'payment.delete', entity_type: 'payment', entity_id: req.params.id, summary: `${payment.description} · ₪${payment.amount}` });
    res.json({ ok: true });
  })
);

export default router;
