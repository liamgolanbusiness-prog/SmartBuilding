import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { query } from '../config/database';

const router = Router();
router.use(authenticate);

// List tickets for current user's building
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await query(
      `SELECT t.id, t.title, t.description, t.category, t.priority, t.status,
              t.location, t.created_at, t.resolved_at,
              r.full_name AS created_by_name, r.apartment_number
       FROM tickets t
       LEFT JOIN residents r ON r.id = t.created_by_resident_id
       WHERE t.building_id = $1
       ORDER BY t.created_at DESC`,
      [req.user!.buildingId]
    );
    res.json({ tickets: result.rows });
  })
);

// Create a ticket
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, description, category, priority, location } = req.body;
    if (!title || !description || !category) {
      res.status(400).json({ error: 'title, description, category required' });
      return;
    }
    await query(
      `INSERT INTO tickets (building_id, created_by_resident_id, title, description, category, priority, location, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')`,
      [
        req.user!.buildingId,
        req.user!.id,
        title,
        description,
        category,
        priority || 'normal',
        location || null,
      ]
    );
    res.status(201).json({ message: 'Ticket created' });
  })
);

export default router;
