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
        typeof apartment_number === 'string' ? apartment_number.trim() : '',
        floor != null && floor !== '' ? Number(floor) : null,
        typeof role === 'string' ? role.trim() : '',
      ]
    );
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
