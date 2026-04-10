import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { query } from '../config/database';

const router = Router();
router.use(authenticate);

// List payments for current user's building
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await query(
      `SELECT p.id, p.payment_type, p.description, p.amount, p.currency,
              p.due_date, p.payment_date, p.status, p.created_at,
              r.full_name, r.apartment_number
       FROM payments p
       LEFT JOIN residents r ON r.id = p.resident_id
       WHERE p.building_id = $1
       ORDER BY p.due_date DESC`,
      [req.user!.buildingId]
    );
    res.json({ payments: result.rows });
  })
);

export default router;
