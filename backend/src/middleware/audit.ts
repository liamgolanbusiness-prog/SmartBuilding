import { query } from '../config/database';
import { AuthRequest } from './auth';

// Small in-memory cache of resident id → name so audit logging stays fast
const nameCache = new Map<string, string>();

/**
 * Records an audit entry. Fire-and-forget — logging failure must
 * never break the user's request.
 */
export async function audit(
  req: AuthRequest,
  opts: {
    action: string;
    entity_type?: string;
    entity_id?: string;
    summary?: string;
    details?: any;
  }
) {
  try {
    const user = req.user;
    if (!user) return;

    // Look up full name (cached)
    let fullName = nameCache.get(user.id);
    if (!fullName) {
      try {
        const r = await query(`SELECT full_name FROM residents WHERE id = $1`, [user.id]);
        fullName = r.rows[0]?.full_name || null;
        if (fullName) nameCache.set(user.id, fullName);
      } catch { /* ignore */ }
    }

    await query(
      `INSERT INTO audit_log (building_id, actor_id, actor_name, actor_role, action, entity_type, entity_id, summary, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        user.buildingId,
        user.id,
        fullName || null,
        user.role,
        opts.action,
        opts.entity_type || null,
        opts.entity_id || null,
        opts.summary || null,
        opts.details ? JSON.stringify(opts.details).slice(0, 4000) : null,
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null,
      ]
    );
  } catch (e) {
    // Swallow — logging must never break the request.
    console.error('[audit] failed', e);
  }
}
