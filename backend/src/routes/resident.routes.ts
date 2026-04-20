import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { query } from '../config/database';

const router = Router();

router.use(authenticate);

const requireVaad = (req: AuthRequest) => {
  if (!['vaad_admin', 'vaad_member', 'treasurer'].includes(req.user!.role)) {
    throw new AppError('Vaad access required', 403);
  }
};

// List residents in the current user's building
router.get(
  '/',
  authorize('vaad_member', 'vaad_admin', 'treasurer', 'resident'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await query(
      `SELECT id, full_name, apartment_number, floor, phone_number, role, email
       FROM residents
       WHERE building_id = $1
       ORDER BY CAST(apartment_number AS INTEGER)`,
      [req.user!.buildingId]
    );
    res.json({ residents: result.rows });
  })
);

// Current user profile + building info
router.get(
  '/me',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const u = await query(
      `SELECT id, full_name, apartment_number, floor, phone_number, email, role, building_id, is_super_admin, approval_status
       FROM residents WHERE id = $1`,
      [req.user!.id]
    );
    const b = await query(
      `SELECT id, name, address, city, total_apartments, total_floors, invite_code,
              emergency_phone, annual_budget, reserve_fund_balance
       FROM buildings WHERE id = $1`,
      [req.user!.buildingId]
    );
    res.json({ user: u.rows[0], building: b.rows[0] });
  })
);

// Bulk pre-create residents so they can log in and land inside directly
// without waiting for approval. Vaad supplies a list of {phone, name,
// apt, floor} rows — we deduplicate and validate per row, return a
// per-row outcome so the UI can show which ones failed.
router.post(
  '/bulk-invite',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    requireVaad(req);
    const rows: any[] = Array.isArray(req.body?.residents) ? req.body.residents : [];
    if (!rows.length) throw new AppError('residents array required', 400);
    if (rows.length > 200) throw new AppError('Too many rows (max 200)', 400);

    const buildingId = req.user!.buildingId;
    const results: Array<{ row: number; ok: boolean; error?: string; phone?: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || {};
      const rawPhone = String(r.phone || r.phone_number || '').replace(/\D/g, '');
      let phone = rawPhone;
      if (phone.startsWith('0')) phone = '+972' + phone.slice(1);
      else if (!phone.startsWith('972')) phone = '+972' + phone;
      else phone = '+' + phone;
      const fullName = String(r.name || r.full_name || '').trim() || 'דייר';
      const apt = String(r.apt || r.apartment_number || '').trim() || null;
      const floor = r.floor != null && String(r.floor).trim() !== '' ? Number(r.floor) : null;

      if (!/^\+972\d{7,9}$/.test(phone)) {
        results.push({ row: i, ok: false, error: 'invalid phone', phone });
        continue;
      }

      try {
        // If phone already exists anywhere, skip.
        const existing = await query(
          `SELECT id, building_id FROM residents WHERE phone_number = $1`,
          [phone]
        );
        if (existing.rows.length > 0) {
          results.push({ row: i, ok: false, error: 'already registered', phone });
          continue;
        }
        await query(
          `INSERT INTO residents
             (building_id, phone_number, phone_verified, full_name, apartment_number, floor,
              approval_status, approved_by, approved_at, role, is_active)
           VALUES ($1, $2, true, $3, $4, $5, 'approved', $6, NOW(), 'resident', true)`,
          [buildingId, phone, fullName, apt, floor, req.user!.id]
        );
        results.push({ row: i, ok: true, phone });
      } catch (err: any) {
        if (String(err?.code) === '23505') {
          results.push({ row: i, ok: false, error: 'apartment already taken', phone });
        } else {
          results.push({ row: i, ok: false, error: err?.message || 'unknown', phone });
        }
      }
    }

    const added = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok).length;
    res.json({ added, failed, results });
  })
);

// ---- Approval workflow (vaad-only) ----
// List pending residents in the current user's building.
router.get(
  '/pending',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    requireVaad(req);
    const result = await query(
      `SELECT id, full_name, apartment_number, floor, phone_number, email,
              approval_requested_at
       FROM residents
       WHERE building_id = $1 AND approval_status = 'pending'
       ORDER BY approval_requested_at ASC NULLS LAST, created_at ASC`,
      [req.user!.buildingId]
    );
    res.json({ residents: result.rows });
  })
);

// Approve a pending resident. Optionally update their details
// (full_name, apartment_number, floor, role) at the same time.
router.post(
  '/:id/approve',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    requireVaad(req);
    const { id } = req.params;
    const row = await query(
      `SELECT id, building_id, approval_status FROM residents WHERE id = $1`,
      [id]
    );
    if (row.rows.length === 0) throw new AppError('Resident not found', 404);
    if (row.rows[0].building_id !== req.user!.buildingId) {
      throw new AppError('Not in your building', 403);
    }
    const { full_name, apartment_number, floor, role } = req.body || {};
    const cleanedApt = typeof apartment_number === 'string' ? apartment_number.trim() : '';

    // Apt collision check: the DB has a UNIQUE(building_id, apartment_number)
    // constraint, so we return a human-readable 409 instead of the opaque
    // 500 Postgres would throw on the ON CONFLICT.
    if (cleanedApt) {
      const dup = await query(
        `SELECT id, full_name FROM residents
          WHERE building_id = $1 AND apartment_number = $2 AND id <> $3
          LIMIT 1`,
        [req.user!.buildingId, cleanedApt, id]
      );
      if (dup.rows.length > 0) {
        throw new AppError(
          `דירה ${cleanedApt} כבר משויכת ל${dup.rows[0].full_name || 'דייר אחר'}. בחר מספר דירה אחר או סמן את המבקש כשותף.`,
          409
        );
      }
    }

    try {
      await query(
        `UPDATE residents
           SET approval_status = 'approved',
               approved_by = $2,
               approved_at = NOW(),
               full_name = COALESCE(NULLIF($3, ''), full_name),
               apartment_number = COALESCE(NULLIF($4, ''), apartment_number),
               floor = COALESCE($5, floor),
               role = COALESCE(NULLIF($6, ''), role),
               updated_at = NOW()
         WHERE id = $1`,
        [
          id,
          req.user!.id,
          typeof full_name === 'string' ? full_name.trim() : '',
          cleanedApt,
          floor != null && floor !== '' ? Number(floor) : null,
          typeof role === 'string' ? role.trim() : '',
        ]
      );
    } catch (err: any) {
      if (String(err?.code) === '23505') {
        throw new AppError('מספר הדירה כבר תפוס בבניין. בחר מספר אחר.', 409);
      }
      throw err;
    }

    // Tell the newly approved resident they're in.
    try {
      await query(
        `INSERT INTO notifications (building_id, resident_id, kind, title, body, ref_id, dedup_key)
         VALUES ($1, $2, 'approval_granted', $3, $4, $1, $5)
         ON CONFLICT (resident_id, dedup_key) DO NOTHING`,
        [
          req.user!.buildingId,
          id,
          'בקשת ההצטרפות שלך אושרה ✅',
          'אתה בפנים — אפשר להתחיל להשתמש באפליקציה',
          `approval_granted:${id}`,
        ]
      );
    } catch (_) { /* best-effort, never block */ }

    res.json({ ok: true });
  })
);

// Reject a pending resident. Keeps the row (so they can see the rejection
// on next login) but flips is_active to false.
router.post(
  '/:id/reject',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    requireVaad(req);
    const { id } = req.params;
    const row = await query(
      `SELECT id, building_id FROM residents WHERE id = $1`,
      [id]
    );
    if (row.rows.length === 0) throw new AppError('Resident not found', 404);
    if (row.rows[0].building_id !== req.user!.buildingId) {
      throw new AppError('Not in your building', 403);
    }
    await query(
      `UPDATE residents
         SET approval_status = 'rejected', is_active = false, updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
    res.json({ ok: true });
  })
);

// Full profile for one resident: basic info + payment ledger + ticket
// history. Any logged-in user in the same building can view it (neighbors
// seeing each other's charges is the whole point of a transparent vaad).
router.get(
  '/:id/profile',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRes = await query(
      `SELECT id, full_name, apartment_number, floor, phone_number, email, role,
              building_id, is_super_admin, created_at, last_login_at, approval_status
       FROM residents WHERE id = $1`,
      [req.params.id]
    );
    if (userRes.rows.length === 0) throw new AppError('Resident not found', 404);
    const user = userRes.rows[0];
    if (user.building_id !== req.user!.buildingId) {
      throw new AppError('Not in your building', 403);
    }

    const paymentsRes = await query(
      `SELECT id, payment_type, description, amount, currency,
              due_date, payment_date, status, payment_method, metadata, created_at
         FROM payments
        WHERE resident_id = $1
        ORDER BY
          CASE status WHEN 'overdue' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END,
          due_date DESC`,
      [req.params.id]
    );

    const ticketsRes = await query(
      `SELECT id, title, description, category, priority, status,
              resolved_at, created_at, updated_at
         FROM tickets
        WHERE created_by_resident_id = $1
        ORDER BY
          CASE status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
          created_at DESC`,
      [req.params.id]
    );

    // Totals for the summary bar at the top of the profile card.
    const totals = {
      paid: 0,
      pending: 0,
      overdue: 0,
      open_tickets: 0,
      total_tickets: ticketsRes.rows.length,
    };
    const today = new Date().toISOString().slice(0, 10);
    for (const p of paymentsRes.rows) {
      const amt = Number(p.amount) || 0;
      if (p.status === 'paid') totals.paid += amt;
      else if (p.due_date && String(p.due_date).slice(0, 10) < today) totals.overdue += amt;
      else totals.pending += amt;
    }
    for (const t of ticketsRes.rows) {
      if (t.status === 'open' || t.status === 'in_progress') totals.open_tickets += 1;
    }

    res.json({
      user,
      payments: paymentsRes.rows,
      tickets: ticketsRes.rows,
      totals,
    });
  })
);

// Let a pending user cancel their request — useful if they picked the
// wrong building. Deletes the resident row entirely so they can start
// over with a different invite code.
router.post(
  '/me/cancel-pending',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const me = await query(
      `SELECT id, approval_status FROM residents WHERE id = $1`,
      [req.user!.id]
    );
    if (me.rows.length === 0) throw new AppError('Resident not found', 404);
    if (me.rows[0].approval_status !== 'pending') {
      throw new AppError('Only pending requests can be cancelled', 400);
    }
    // Clean up refresh tokens + notifications tied to this user first
    // (FK-safe on Postgres, belt-and-braces on SQLite).
    await query(`DELETE FROM refresh_tokens WHERE resident_id = $1`, [req.user!.id]);
    await query(`DELETE FROM notifications WHERE resident_id = $1`, [req.user!.id]);
    await query(`DELETE FROM residents WHERE id = $1 AND approval_status = 'pending'`, [req.user!.id]);
    res.json({ ok: true });
  })
);

// Public-to-pending-users endpoint: minimal info for the "waiting for
// approval" screen. Doesn't leak building internals beyond name.
router.get(
  '/me/pending',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const u = await query(
      `SELECT id, full_name, apartment_number, phone_number, approval_status, approval_requested_at
       FROM residents WHERE id = $1`,
      [req.user!.id]
    );
    const b = await query(
      `SELECT name FROM buildings WHERE id = $1`,
      [req.user!.buildingId]
    );
    res.json({ user: u.rows[0], building: b.rows[0] });
  })
);

export default router;
