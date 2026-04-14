import { Router, Response } from 'express';
import PDFDocument from 'pdfkit';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validate, schemas } from '../middleware/validate';
import { audit } from '../middleware/audit';
import { query } from '../config/database';

const router = Router();
router.use(authenticate);

const isVaad = (req: AuthRequest) =>
  ['vaad_admin', 'vaad_member', 'treasurer'].includes(req.user!.role);

// ---------- Audit log ----------
// Transparency: every resident can see the log for their building.
router.get('/audit', asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const result = await query(
    `SELECT id, actor_name, actor_role, action, entity_type, summary, created_at
     FROM audit_log
     WHERE building_id = $1
     ORDER BY created_at DESC
     LIMIT ${limit}`,
    [req.user!.buildingId]
  );
  res.json({ entries: result.rows });
}));

// ---------- Building documents ----------
router.get('/documents', asyncHandler(async (req: AuthRequest, res: Response) => {
  // Everyone sees the document list (titles, categories) — transparency.
  // File data is only returned on explicit fetch.
  const result = await query(
    `SELECT d.id, d.title, d.category, d.file_name, d.file_type, d.size_bytes, d.notes, d.created_at,
            r.full_name AS uploaded_by_name
     FROM building_documents d
     LEFT JOIN residents r ON r.id = d.uploaded_by_id
     WHERE d.building_id = $1
     ORDER BY d.created_at DESC`,
    [req.user!.buildingId]
  );
  res.json({ documents: result.rows });
}));

router.get('/documents/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT title, file_name, file_type, file_data
     FROM building_documents
     WHERE id = $1 AND building_id = $2`,
    [req.params.id, req.user!.buildingId]
  );
  if (result.rows.length === 0) throw new AppError('Not found', 404);
  res.json(result.rows[0]);
}));

router.post('/documents', validate(schemas.documentCreate), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  const { title, category, file_name, file_type, file_data, notes } = req.body;
  // Cap file at ~2MB
  if (file_data && file_data.length > 2_800_000) throw new AppError('File too large (max 2MB)', 400);
  await query(
    `INSERT INTO building_documents (building_id, title, category, file_name, file_type, file_data, size_bytes, notes, uploaded_by_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      req.user!.buildingId,
      title,
      category,
      file_name || null,
      file_type || null,
      file_data,
      Math.floor((file_data?.length || 0) * 0.75), // approx decoded size
      notes || null,
      req.user!.id,
    ]
  );
  audit(req, { action: 'document.upload', entity_type: 'document', summary: `${title} (${category})` });
  res.status(201).json({ message: 'Document uploaded' });
}));

router.delete('/documents/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  const row = await query(`SELECT title FROM building_documents WHERE id = $1 AND building_id = $2`, [req.params.id, req.user!.buildingId]);
  await query(`DELETE FROM building_documents WHERE id = $1 AND building_id = $2`, [req.params.id, req.user!.buildingId]);
  audit(req, { action: 'document.delete', entity_type: 'document', summary: row.rows[0]?.title });
  res.json({ message: 'Deleted' });
}));

// ---------- Contractors ----------
router.get('/contractors', asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT * FROM contractors WHERE building_id = $1 ORDER BY COALESCE(last_used, created_at) DESC`,
    [req.user!.buildingId]
  );
  res.json({ contractors: result.rows });
}));

router.post('/contractors', validate(schemas.contractorCreate), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  const { name, company, category, phone, email, notes, rating } = req.body;
  await query(
    `INSERT INTO contractors (building_id, name, company, category, phone, email, notes, rating, created_by_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [req.user!.buildingId, name, company || null, category, phone || null, email || null, notes || null, rating || null, req.user!.id]
  );
  audit(req, { action: 'contractor.create', entity_type: 'contractor', summary: `${name}${company ? ' — ' + company : ''}` });
  res.status(201).json({ message: 'Contractor added' });
}));

router.delete('/contractors/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  await query(`DELETE FROM contractors WHERE id = $1 AND building_id = $2`, [req.params.id, req.user!.buildingId]);
  audit(req, { action: 'contractor.delete', entity_type: 'contractor', entity_id: req.params.id });
  res.json({ message: 'Deleted' });
}));

// ---------- Building settings (emergency phone, budget, reserve) ----------
router.get('/building/settings', asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT id, name, emergency_phone, annual_budget, reserve_fund_balance FROM buildings WHERE id = $1`,
    [req.user!.buildingId]
  );
  res.json(result.rows[0] || {});
}));

router.put('/building/settings', validate(schemas.buildingUpdate), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  const updates: string[] = [];
  const params: any[] = [];
  let idx = 1;
  ['emergency_phone', 'annual_budget', 'reserve_fund_balance'].forEach((f) => {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = $${idx++}`);
      params.push(req.body[f]);
    }
  });
  if (!updates.length) return res.json({ message: 'Nothing to update' });
  params.push(req.user!.buildingId);
  await query(`UPDATE buildings SET ${updates.join(', ')} WHERE id = $${idx}`, params);
  audit(req, { action: 'building.settings_update', summary: Object.keys(req.body).join(', ') });
  res.json({ message: 'Updated' });
}));

// ---------- CSV export ----------
function csvEscape(v: any): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

router.get('/export/payments.csv', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  const result = await query(
    `SELECT p.id, p.payment_type, p.description, p.amount, p.currency,
            p.due_date, p.payment_date, p.status, r.full_name, r.apartment_number
     FROM payments p
     LEFT JOIN residents r ON r.id = p.resident_id
     WHERE p.building_id = $1
     ORDER BY p.due_date DESC`,
    [req.user!.buildingId]
  );
  const header = 'Resident,Apartment,Type,Description,Amount,Currency,Due Date,Paid Date,Status,ID';
  const rows = result.rows.map((p: any) =>
    [p.full_name, p.apartment_number, p.payment_type, p.description, p.amount, p.currency, p.due_date, p.payment_date || '', p.status, p.id].map(csvEscape).join(',')
  );
  const csv = '\ufeff' + header + '\n' + rows.join('\n'); // BOM for Excel UTF-8
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="payments.csv"');
  res.send(csv);
  audit(req, { action: 'export.payments_csv', summary: `${rows.length} rows` });
}));

router.get('/export/expenses.csv', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isVaad(req)) throw new AppError('Admin access required', 403);
  const result = await query(
    `SELECT e.id, e.title, e.amount, e.currency, e.category, e.expense_date, e.notes, r.full_name
     FROM expenses e
     LEFT JOIN residents r ON r.id = e.created_by_id
     WHERE e.building_id = $1
     ORDER BY e.expense_date DESC`,
    [req.user!.buildingId]
  );
  const header = 'Date,Title,Category,Amount,Currency,Notes,Added by,ID';
  const rows = result.rows.map((e: any) =>
    [e.expense_date, e.title, e.category, e.amount, e.currency, e.notes || '', e.full_name || '', e.id].map(csvEscape).join(',')
  );
  const csv = '\ufeff' + header + '\n' + rows.join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
  res.send(csv);
  audit(req, { action: 'export.expenses_csv', summary: `${rows.length} rows` });
}));

// ---------- PDF receipt ----------
router.get('/payments/:id/receipt.pdf', asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT p.id, p.payment_type, p.description, p.amount, p.currency, p.due_date, p.payment_date, p.status, p.resident_id,
            r.full_name, r.apartment_number, b.name AS building_name, b.address, b.city
     FROM payments p
     LEFT JOIN residents r ON r.id = p.resident_id
     LEFT JOIN buildings b ON b.id = p.building_id
     WHERE p.id = $1 AND p.building_id = $2`,
    [req.params.id, req.user!.buildingId]
  );
  const p = result.rows[0];
  if (!p) throw new AppError('Payment not found', 404);
  // Resident can only download their own, vaad can download any
  if (!isVaad(req) && p.resident_id !== req.user!.id) throw new AppError('Forbidden', 403);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="receipt-${p.id.slice(0, 8)}.pdf"`);
  doc.pipe(res);

  // Header
  doc.fontSize(22).font('Helvetica-Bold').text('Lobbix — Payment Receipt', { align: 'left' });
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica').fillColor('#666').text(`Generated ${new Date().toLocaleString('en-IL')}`);
  doc.moveDown(1);

  // Building box
  doc.fillColor('#000').fontSize(12).font('Helvetica-Bold').text('Building');
  doc.font('Helvetica').fontSize(11).text(p.building_name || '-');
  if (p.address || p.city) doc.text([p.address, p.city].filter(Boolean).join(', '));
  doc.moveDown(0.8);

  // Payer
  doc.font('Helvetica-Bold').text('Payer');
  doc.font('Helvetica').text(p.full_name || '-');
  if (p.apartment_number) doc.text(`Apartment ${p.apartment_number}`);
  doc.moveDown(0.8);

  // Receipt info
  doc.font('Helvetica-Bold').text('Receipt details');
  doc.font('Helvetica');
  doc.text(`Receipt ID: ${p.id}`);
  doc.text(`Type: ${p.payment_type}`);
  if (p.description) doc.text(`Description: ${p.description}`);
  doc.text(`Due date: ${p.due_date}`);
  doc.text(`Paid date: ${p.payment_date || '-'}`);
  doc.text(`Status: ${p.status}`);
  doc.moveDown(1);

  // Amount (big)
  doc.rect(50, doc.y, 500, 70).fill('#f3f4ff').stroke('#e5e7eb');
  doc.fillColor('#4f46e5').fontSize(14).font('Helvetica-Bold').text('AMOUNT PAID', 70, doc.y - 58);
  doc.fillColor('#111').fontSize(32).text(`${p.currency} ${Number(p.amount).toFixed(2)}`, 70, doc.y - 10);
  doc.fillColor('#000').fontSize(11).font('Helvetica');
  doc.moveDown(3);

  // Footer
  doc.moveDown(2);
  doc.fontSize(9).fillColor('#999').text('This is an automatically generated receipt from Lobbix. Keep it for your records. · lobbix.co.il', { align: 'center' });

  doc.end();
  audit(req, { action: 'receipt.generate', entity_type: 'payment', entity_id: p.id, summary: `${p.currency} ${p.amount}` });
}));

// ---------- Data export & account deletion (GDPR-ish) ----------
router.get('/me/data', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await query(`SELECT * FROM residents WHERE id = $1`, [req.user!.id]);
  const payments = await query(`SELECT * FROM payments WHERE resident_id = $1`, [req.user!.id]);
  const tickets = await query(`SELECT * FROM tickets WHERE created_by_resident_id = $1`, [req.user!.id]);
  const votes = await query(`SELECT * FROM poll_votes WHERE resident_id = $1`, [req.user!.id]);
  audit(req, { action: 'data.export_self' });
  res.json({
    exported_at: new Date().toISOString(),
    user: user.rows[0],
    payments: payments.rows,
    tickets: tickets.rows,
    poll_votes: votes.rows,
  });
}));

router.delete('/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  // Hard rule: the last vaad_admin of a building cannot delete themselves.
  if (req.user!.role === 'vaad_admin') {
    const count = await query(
      `SELECT COUNT(*) AS n FROM residents WHERE building_id = $1 AND role = 'vaad_admin' AND id != $2`,
      [req.user!.buildingId, req.user!.id]
    );
    if ((count.rows[0]?.n ?? count.rows[0]?.n) === 0 || (count.rows[0] && Number(count.rows[0].n) === 0)) {
      throw new AppError('Cannot delete last admin. Transfer admin role first.', 400);
    }
  }
  // Soft-delete (deactivate) to preserve audit trail
  await query(`UPDATE residents SET is_active = 0 WHERE id = $1`, [req.user!.id]);
  audit(req, { action: 'account.delete_self' });
  res.json({ message: 'Account deactivated' });
}));

export default router;
