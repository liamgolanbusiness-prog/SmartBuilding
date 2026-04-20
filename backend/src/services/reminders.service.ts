// Payment reminder scheduler.
//
// Runs a lightweight daily sweep that finds residents with pending or
// overdue payments and writes one notification per dedup key so the same
// reminder can't double-fire. The dedup key includes the current day and
// a milestone bucket (due_today, day_1, day_7, day_30), so each resident
// gets at most one reminder per payment per bucket per day.
//
// Nothing fancy: we rely on an in-process interval rather than external
// cron so local dev and production stay identical.
import { query } from '../config/database';
import { Server as SocketIOServer } from 'socket.io';

let started = false;
let ioRef: SocketIOServer | null = null;

export function startReminderScheduler(io: SocketIOServer) {
  if (started) return;
  started = true;
  ioRef = io;

  // Fire once shortly after boot so the admin sees fresh reminders even
  // if they just logged in, then every 6 hours afterwards.
  setTimeout(() => runReminderSweep().catch((e) => console.error('reminder sweep failed:', e)), 30 * 1000);
  setInterval(() => runReminderSweep().catch((e) => console.error('reminder sweep failed:', e)), 6 * 60 * 60 * 1000);
  console.log('⏰ Reminder scheduler armed');
}

export async function runReminderSweep(): Promise<{ created: number }> {
  // Upcoming (due today) and overdue payments with the resident info we
  // need for a well-formed notification.
  const rows = await query(
    `SELECT p.id,
            p.resident_id,
            p.building_id,
            p.description,
            p.amount,
            p.currency,
            p.due_date,
            p.status,
            GREATEST(0, (CURRENT_DATE - p.due_date)::int) AS days_overdue
       FROM payments p
      WHERE p.status IN ('pending', 'overdue')
        AND p.due_date <= CURRENT_DATE`,
    []
  );

  let created = 0;
  // For every payment, fire at most one notification per milestone bucket
  // over its lifetime. We walk the buckets ascending — each one that the
  // payment has already crossed gets a notification (dedup prevents
  // re-firing on future sweeps).
  const BUCKETS: Array<{ key: string; min: number }> = [
    { key: 'due_today', min: 0 },
    { key: 'day_1', min: 1 },
    { key: 'day_7', min: 7 },
    { key: 'day_30', min: 30 },
  ];

  for (const p of rows.rows) {
    const days = Number(p.days_overdue) || 0;
    for (const b of BUCKETS) {
      if (days < b.min) break; // next buckets are further out, skip
      const bucket = b.key;
      const dedup = `payment:${p.id}:${bucket}`;
      const title = titleFor(bucket);
      const body = `${p.description} · ₪${Number(p.amount).toFixed(0)}${days > 0 ? ` · ${days} ${daysLabel(days)}` : ''}`;

      try {
        const ins = await query(
          `INSERT INTO notifications (building_id, resident_id, kind, title, body, ref_id, dedup_key)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (resident_id, dedup_key) DO NOTHING
           RETURNING id`,
          [p.building_id, p.resident_id, 'payment_reminder', title, body, p.id, dedup]
        );
        if (ins.rowCount > 0) {
          created++;
          // Best-effort socket push — client shows a toast if connected.
          if (ioRef) {
            ioRef.to(`building:${p.building_id}`).emit('notification', {
              resident_id: p.resident_id,
              kind: 'payment_reminder',
              title,
              body,
            });
          }
        }
      } catch (err) {
        // Dedup race is fine; anything else is worth logging.
        if (!String((err as Error).message).includes('duplicate key')) {
          console.error('reminder insert failed:', (err as Error).message);
        }
      }
    }
  }
  if (created > 0) console.log(`⏰ Reminder sweep: created ${created} notification(s)`);
  return { created };
}

function titleFor(bucket: string): string {
  // Hebrew titles — the app is Hebrew-first. Client can swap to English
  // based on user language when displaying.
  switch (bucket) {
    case 'due_today': return 'תזכורת: יום פירעון היום';
    case 'day_1': return 'תשלום באיחור של יום';
    case 'day_7': return 'תשלום באיחור של שבוע';
    case 'day_30': return 'תשלום באיחור של חודש ומעלה';
    default: return 'תזכורת תשלום';
  }
}

function daysLabel(n: number): string {
  return n === 1 ? 'יום' : 'ימים';
}
