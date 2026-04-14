import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validate, schemas } from '../middleware/validate';
import { audit } from '../middleware/audit';
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
              r.full_name AS created_by_name, r.apartment_number,
              (SELECT COUNT(*) FROM ticket_attachments WHERE ticket_id = t.id) AS attachment_count
       FROM tickets t
       LEFT JOIN residents r ON r.id = t.created_by_resident_id
       WHERE t.building_id = $1
       ORDER BY t.created_at DESC`,
      [req.user!.buildingId]
    );
    res.json({ tickets: result.rows });
  })
);

// Get attachments for a ticket
router.get(
  '/:id/attachments',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await query(
      `SELECT id, file_data, file_type, created_at FROM ticket_attachments WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );
    res.json({ attachments: result.rows });
  })
);

// Create a ticket (with optional image attachment)
router.post(
  '/',
  validate(schemas.ticketCreate),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, description, category, priority, location, attachment } = req.body;
    if (attachment && attachment.length > 2_800_000) throw new AppError('Attachment too large (max 2MB)', 400);

    // Get the id by inserting then reading the most recent
    const rows = await query(
      `INSERT INTO tickets (building_id, created_by_resident_id, title, description, category, priority, location, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')`,
      [
        req.user!.buildingId,
        req.user!.id,
        title,
        description || '',
        category,
        priority || 'medium',
        location || null,
      ]
    );

    // Fetch the newly-created ticket id
    const latest = await query(
      `SELECT id FROM tickets WHERE building_id = $1 AND created_by_resident_id = $2 ORDER BY created_at DESC LIMIT 1`,
      [req.user!.buildingId, req.user!.id]
    );
    const newId = latest.rows[0]?.id;

    if (attachment && newId) {
      await query(
        `INSERT INTO ticket_attachments (ticket_id, file_data, file_type, uploaded_by_id) VALUES ($1, $2, $3, $4)`,
        [newId, attachment, 'image/jpeg', req.user!.id]
      );
    }

    audit(req, { action: 'ticket.create', entity_type: 'ticket', entity_id: newId, summary: title });
    res.status(201).json({ message: 'Ticket created', id: newId });
  })
);

// Update ticket status (vaad-only)
router.patch(
  '/:id/status',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const isVaad = ['vaad_admin', 'vaad_member', 'treasurer'].includes(req.user!.role);
    if (!isVaad) throw new AppError('Admin access required', 403);
    const { status } = req.body;
    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }
    await query(
      `UPDATE tickets SET status = $1, resolved_at = $2 WHERE id = $3 AND building_id = $4`,
      [status, status === 'resolved' ? new Date().toISOString() : null, req.params.id, req.user!.buildingId]
    );
    audit(req, { action: 'ticket.status_change', entity_type: 'ticket', entity_id: req.params.id, summary: status });
    res.json({ message: 'Updated' });
  })
);

export default router;
