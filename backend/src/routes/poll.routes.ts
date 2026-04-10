import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { query } from '../config/database';

const router = Router();
router.use(authenticate);

// Ensure tables exist (idempotent)
(async () => {
  try {
    await query(`CREATE TABLE IF NOT EXISTS polls (
      id TEXT PRIMARY KEY,
      building_id TEXT,
      announcement_id TEXT,
      created_by_id TEXT,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      expires_at TEXT,
      closed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
    await query(`CREATE TABLE IF NOT EXISTS poll_votes (
      id TEXT PRIMARY KEY,
      poll_id TEXT,
      resident_id TEXT,
      option_index INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(poll_id, resident_id)
    )`);
  } catch (e) {
    console.error('poll table init error', e);
  }
})();

// List polls for the current building, with aggregated vote counts and
// whether the current user has already voted.
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const polls = await query(
      `SELECT p.id, p.question, p.options, p.expires_at, p.closed, p.created_at,
              p.announcement_id, p.created_by_id,
              r.full_name AS author_name
       FROM polls p
       LEFT JOIN residents r ON r.id = p.created_by_id
       WHERE p.building_id = $1
       ORDER BY p.created_at DESC`,
      [req.user!.buildingId]
    );

    // Attach vote aggregation + my vote
    const out: any[] = [];
    for (const p of polls.rows) {
      let options: string[] = [];
      try { options = JSON.parse(p.options); } catch {}
      const counts = await query(
        `SELECT option_index, COUNT(*) AS c FROM poll_votes WHERE poll_id = $1 GROUP BY option_index`,
        [p.id]
      );
      const totals = new Array(options.length).fill(0);
      counts.rows.forEach((row: any) => {
        const idx = Number(row.option_index);
        if (idx >= 0 && idx < totals.length) totals[idx] = Number(row.c || 0);
      });
      const mine = await query(
        `SELECT option_index FROM poll_votes WHERE poll_id = $1 AND resident_id = $2 LIMIT 1`,
        [p.id, req.user!.id]
      );
      out.push({
        id: p.id,
        question: p.question,
        options,
        totals,
        total_votes: totals.reduce((a: number, b: number) => a + b, 0),
        my_vote: mine.rows[0] ? Number(mine.rows[0].option_index) : null,
        expires_at: p.expires_at,
        closed: !!p.closed,
        created_at: p.created_at,
        announcement_id: p.announcement_id,
        author_name: p.author_name,
      });
    }
    res.json({ polls: out });
  })
);

// Create a poll (vaad only). Optionally links to an announcement.
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!['vaad_admin', 'vaad_member'].includes(req.user!.role)) {
      res.status(403).json({ error: "Only Va'ad members can create polls" });
      return;
    }
    const { question, options, announcement_id, expires_at } = req.body;
    if (!question || !Array.isArray(options) || options.length < 2) {
      res.status(400).json({ error: 'question and at least 2 options required' });
      return;
    }
    const optionsJson = JSON.stringify(options.map((o: any) => String(o).slice(0, 120)));
    const result = await query(
      `INSERT INTO polls (building_id, announcement_id, created_by_id, question, options, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user!.buildingId,
        announcement_id || null,
        req.user!.id,
        String(question).slice(0, 200),
        optionsJson,
        expires_at || null,
      ]
    );
    // Return the newly-created poll id by looking it up
    const created = await query(
      `SELECT id FROM polls WHERE building_id = $1 AND created_by_id = $2 ORDER BY created_at DESC LIMIT 1`,
      [req.user!.buildingId, req.user!.id]
    );
    res.status(201).json({ message: 'Poll created', id: created.rows[0]?.id });
  })
);

// Cast a vote. One vote per resident per poll (enforced by UNIQUE).
router.post(
  '/:id/vote',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const pollId = req.params.id;
    const { option_index } = req.body;
    if (option_index == null || Number.isNaN(Number(option_index))) {
      res.status(400).json({ error: 'option_index required' });
      return;
    }

    // Validate poll
    const poll = await query(
      `SELECT id, options, closed, expires_at FROM polls WHERE id = $1 AND building_id = $2`,
      [pollId, req.user!.buildingId]
    );
    if (!poll.rows[0]) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }
    if (poll.rows[0].closed) {
      res.status(400).json({ error: 'Poll is closed' });
      return;
    }
    let opts: string[] = [];
    try { opts = JSON.parse(poll.rows[0].options); } catch {}
    const idx = Number(option_index);
    if (idx < 0 || idx >= opts.length) {
      res.status(400).json({ error: 'Invalid option index' });
      return;
    }

    // Remove previous vote (allow changing vote)
    await query(`DELETE FROM poll_votes WHERE poll_id = $1 AND resident_id = $2`, [pollId, req.user!.id]);

    await query(
      `INSERT INTO poll_votes (poll_id, resident_id, option_index) VALUES ($1, $2, $3)`,
      [pollId, req.user!.id, idx]
    );
    res.status(201).json({ message: 'Vote recorded' });
  })
);

// Close a poll (admin)
router.post(
  '/:id/close',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!['vaad_admin', 'vaad_member'].includes(req.user!.role)) {
      res.status(403).json({ error: "Only Va'ad members can close polls" });
      return;
    }
    await query(
      `UPDATE polls SET closed = 1 WHERE id = $1 AND building_id = $2`,
      [req.params.id, req.user!.buildingId]
    );
    res.json({ message: 'Poll closed' });
  })
);

export default router;
