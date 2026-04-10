import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { query } from '../config/database';

const router = Router();

router.use(authenticate);

// List residents in the current user's building
router.get(
  '/',
  authorize('vaad_member', 'vaad_admin', 'treasurer', 'resident'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await query(
      `SELECT id, full_name, apartment_number, phone_number, role, email
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
      `SELECT id, full_name, apartment_number, phone_number, email, role, building_id, is_super_admin
       FROM residents WHERE id = $1`,
      [req.user!.id]
    );
    const b = await query(
      `SELECT id, name, address, city, total_apartments, invite_code
       FROM buildings WHERE id = $1`,
      [req.user!.buildingId]
    );
    res.json({ user: u.rows[0], building: b.rows[0] });
  })
);

export default router;
