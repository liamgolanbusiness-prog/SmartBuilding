import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { query } from '../config/database';

const router = Router();

router.use(authenticate);

// Ensure the caller is a super admin for every route below.
router.use(asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const me = await query(
    `SELECT is_super_admin FROM residents WHERE id = $1`,
    [req.user!.id]
  );
  if (!me.rows[0] || !me.rows[0].is_super_admin) {
    throw new AppError('Super admin access required', 403);
  }
  next();
}));

// List all buildings with basic stats
router.get(
  '/buildings',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const result = await query(
      `SELECT b.id, b.name, b.address, b.city, b.total_apartments, b.invite_code, b.created_at,
              (SELECT COUNT(*) FROM residents r WHERE r.building_id = b.id) AS resident_count,
              (SELECT COUNT(*) FROM tickets t WHERE t.building_id = b.id) AS ticket_count,
              (SELECT COUNT(*) FROM announcements a WHERE a.building_id = b.id) AS announcement_count
       FROM buildings b
       ORDER BY b.created_at DESC`,
      []
    );
    res.json({ buildings: result.rows });
  })
);

// Create a new building + its first admin resident
router.post(
  '/buildings',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      name,
      address,
      city,
      total_floors,
      total_apartments,
      invite_code,
      admin_phone,
      admin_name,
      admin_apartment,
    } = req.body;

    if (!name || !address || !city || !total_apartments || !invite_code || !admin_phone || !admin_name) {
      throw new AppError('Missing required fields', 400);
    }

    // Normalize phone
    let phone = String(admin_phone).replace(/\s/g, '');
    if (phone.startsWith('0')) phone = '+972' + phone.substring(1);
    else if (!phone.startsWith('+')) phone = '+972' + phone;

    // Check invite code is unique
    const existing = await query(
      `SELECT id FROM buildings WHERE invite_code = $1`,
      [invite_code]
    );
    if (existing.rows.length > 0) {
      throw new AppError('Invite code already in use', 400);
    }

    // Check phone isn't already a resident in some building (would cause conflict on login)
    const existingUser = await query(
      `SELECT id, building_id FROM residents WHERE phone_number = $1`,
      [phone]
    );
    if (existingUser.rows.length > 0) {
      throw new AppError('Phone number already registered in another building', 400);
    }

    // Insert building
    await query(
      `INSERT INTO buildings (name, address, city, total_floors, total_apartments, invite_code)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, address, city, Number(total_floors || 1), Number(total_apartments), invite_code]
    );
    // Fetch it
    const bldRow = await query(
      `SELECT id FROM buildings WHERE invite_code = $1`,
      [invite_code]
    );
    const buildingId = bldRow.rows[0]?.id;

    // Insert first admin resident
    await query(
      `INSERT INTO residents (building_id, phone_number, phone_verified, full_name, apartment_number, role)
       VALUES ($1, $2, true, $3, $4, 'vaad_admin')`,
      [buildingId, phone, admin_name, admin_apartment || '1']
    );

    res.status(201).json({
      message: 'Building created',
      building: {
        id: buildingId,
        name,
        invite_code,
      },
      admin: {
        phone,
        name: admin_name,
      },
    });
  })
);

// Delete a building (cascade)
router.delete(
  '/buildings/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await query(`DELETE FROM buildings WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Building deleted' });
  })
);

// Dev helper: generate an OTP for any seeded phone (super admin only).
// This lets the super admin log in as another user quickly for testing.
router.post(
  '/login-as',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { phone_number } = req.body;
    if (!phone_number) throw new AppError('phone_number required', 400);
    const existing = await query(
      `SELECT id FROM residents WHERE phone_number = $1`,
      [phone_number]
    );
    if (existing.rows.length === 0) throw new AppError('No such resident', 404);

    // Issue a one-time OTP valid for 5 minutes
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await query(
      `INSERT INTO otp_codes (phone_number, code, expires_at)
       VALUES ($1, $2, datetime('now', '+5 minutes'))`,
      [phone_number, code]
    );
    res.json({ phoneNumber: phone_number, code });
  })
);

export default router;
