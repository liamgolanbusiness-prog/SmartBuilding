import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { query } from '../config/database';

const router = Router();
router.use(authenticate);

(async () => {
  try {
    await query(`CREATE TABLE IF NOT EXISTS maintenance_tasks (
      id TEXT PRIMARY KEY,
      building_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      frequency TEXT NOT NULL,
      interval_days INTEGER,
      next_due TEXT,
      last_done TEXT,
      reminder_days_before INTEGER DEFAULT 3,
      active INTEGER DEFAULT 1,
      created_by_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
  } catch (e) { console.error('maintenance init', e); }
})();

const isVaad = (req: AuthRequest) =>
  ['vaad_admin', 'vaad_member', 'treasurer'].includes(req.user!.role);

// List maintenance tasks
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT mt.id, mt.title, mt.description, mt.category, mt.frequency, mt.interval_days,
            mt.next_due, mt.last_done, mt.reminder_days_before, mt.active, mt.created_at,
            r.full_name AS created_by_name
     FROM maintenance_tasks mt
     LEFT JOIN residents r ON r.id = mt.created_by_id
     WHERE mt.building_id = $1 AND mt.active = 1
     ORDER BY mt.next_due ASC`,
    [req.user!.buildingId]
  );
  res.json({ tasks: result.rows });
}));

// Create task
router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  const { title, description, category, frequency, interval_days, next_due, reminder_days_before } = req.body;
  if (!title || !frequency) throw new AppError('title, frequency required', 400);

  // Compute interval_days if not provided
  const intervals: Record<string, number> = {
    weekly: 7, biweekly: 14, monthly: 30, quarterly: 91, semiannual: 182, yearly: 365,
  };
  const days = interval_days || intervals[frequency] || 30;

  // Next due: if provided use it, else today + interval
  const due = next_due || new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  await query(
    `INSERT INTO maintenance_tasks (building_id, title, description, category, frequency, interval_days, next_due, reminder_days_before, created_by_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      req.user!.buildingId,
      String(title).slice(0, 160),
      description || null,
      category || 'other',
      frequency,
      days,
      due,
      reminder_days_before != null ? Number(reminder_days_before) : 3,
      req.user!.id,
    ]
  );
  res.status(201).json({ message: 'Task created' });
}));

// Mark task as done → bump last_done and compute next_due
router.post('/:id/done', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  const row = await query(
    `SELECT * FROM maintenance_tasks WHERE id = $1 AND building_id = $2`,
    [req.params.id, req.user!.buildingId]
  );
  const task = row.rows[0];
  if (!task) throw new AppError('Task not found', 404);
  const now = new Date();
  const next = new Date(now.getTime() + (Number(task.interval_days) || 30) * 24 * 60 * 60 * 1000);
  await query(
    `UPDATE maintenance_tasks SET last_done = $1, next_due = $2 WHERE id = $3`,
    [now.toISOString().slice(0, 10), next.toISOString().slice(0, 10), req.params.id]
  );
  res.json({ message: 'Marked done', next_due: next.toISOString().slice(0, 10) });
}));

// Delete (soft: deactivate)
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  await query(
    `UPDATE maintenance_tasks SET active = 0 WHERE id = $1 AND building_id = $2`,
    [req.params.id, req.user!.buildingId]
  );
  res.json({ message: 'Task deleted' });
}));

export default router;
