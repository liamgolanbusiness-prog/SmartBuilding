import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { query } from '../config/database';
import { runReminderSweep } from '../services/reminders.service';

const router = Router();
router.use(authenticate);

// Current resident's notifications (most recent 50).
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const rows = await query(
      `SELECT id, kind, title, body, ref_id, read, created_at
         FROM notifications
        WHERE resident_id = $1
        ORDER BY created_at DESC
        LIMIT 50`,
      [req.user!.id]
    );
    const unread = rows.rows.filter((r: any) => !r.read).length;
    res.json({ notifications: rows.rows, unread });
  })
);

// Mark a single notification as read.
router.post(
  '/:id/read',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await query(
      `UPDATE notifications SET read = TRUE WHERE id = $1 AND resident_id = $2`,
      [req.params.id, req.user!.id]
    );
    res.json({ ok: true });
  })
);

// Mark all as read.
router.post(
  '/read-all',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await query(
      `UPDATE notifications SET read = TRUE WHERE resident_id = $1 AND read = FALSE`,
      [req.user!.id]
    );
    res.json({ ok: true });
  })
);

// Manual trigger for the reminder sweep (useful from the admin panel or
// for testing). Anyone authenticated can poke it — idempotent by design.
router.post(
  '/run-sweep',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const result = await runReminderSweep();
    res.json(result);
  })
);

export default router;
