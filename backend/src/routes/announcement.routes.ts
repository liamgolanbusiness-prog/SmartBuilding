import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { query } from '../config/database';

const router = Router();
router.use(authenticate);

// List announcements for current user's building
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await query(
      `SELECT a.id, a.title, a.content, a.category, a.published_at, a.is_pinned, a.created_at,
              r.full_name AS author_name
       FROM announcements a
       LEFT JOIN residents r ON r.id = a.created_by_id
       WHERE a.building_id = $1
       ORDER BY a.is_pinned DESC, a.created_at DESC`,
      [req.user!.buildingId]
    );
    res.json({ announcements: result.rows });
  })
);

// Create an announcement (va'ad only)
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!['vaad_admin', 'vaad_member'].includes(req.user!.role)) {
      res.status(403).json({ error: 'Only Va\'ad members can post announcements' });
      return;
    }
    const { title, content, category } = req.body;
    if (!title || !content || !category) {
      res.status(400).json({ error: 'title, content, category required' });
      return;
    }
    await query(
      `INSERT INTO announcements (building_id, created_by_id, title, content, category, published_at)
       VALUES ($1, $2, $3, $4, $5, datetime('now'))`,
      [req.user!.buildingId, req.user!.id, title, content, category]
    );
    res.status(201).json({ message: 'Announcement created' });
  })
);

export default router;
