// SQLite-backed shim that mimics the subset of `pg` used by this app.
// Swapped in so the backend can run without a Postgres server.
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'vaad.sqlite');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('✅ Database connected (SQLite at ' + dbPath + ')');

// Convert a JS value into something better-sqlite3 can bind.
const bindValue = (v: any): any => {
  if (v === undefined) return null;
  if (v === null) return null;
  if (v instanceof Date) {
    // Store as 'YYYY-MM-DD HH:MM:SS' so comparisons with datetime('now') work.
    return v.toISOString().replace('T', ' ').slice(0, 19);
  }
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'object') return JSON.stringify(v);
  return v;
};

// Translate a Postgres-flavored SQL string into SQLite-compatible SQL.
const translateSql = (sql: string): string => {
  let out = sql;

  // NOW() +/- INTERVAL '<n> <unit>'  ->  datetime('now', '+n unit')
  out = out.replace(
    /NOW\(\)\s*([+-])\s*INTERVAL\s*'(\d+)\s*(\w+)'/gi,
    (_m, sign: string, n: string, unit: string) =>
      `datetime('now', '${sign}${n} ${unit.toLowerCase()}')`
  );

  // Remaining bare NOW() -> datetime('now')
  out = out.replace(/\bNOW\(\)/gi, `datetime('now')`);

  // gen_random_uuid() -> lower(hex(randomblob(16)))
  out = out.replace(/gen_random_uuid\(\)/gi, `lower(hex(randomblob(16)))`);

  // $1, $2, ... positional params -> ?
  out = out.replace(/\$(\d+)/g, '?');

  return out;
};

// Reorder params to match the order the $N placeholders appeared in the SQL.
// pg uses positional $N references; SQLite `?` is ordinal. If the original
// SQL re-uses a placeholder (e.g. $1 twice) we expand params accordingly.
const reorderParams = (sql: string, params: any[] = []): any[] => {
  const result: any[] = [];
  const re = /\$(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    const idx = parseInt(m[1], 10) - 1;
    result.push(bindValue(params[idx]));
  }
  return result;
};

const isSelectLike = (sql: string): boolean => {
  const s = sql.trim().toUpperCase();
  return (
    s.startsWith('SELECT') ||
    s.startsWith('WITH') ||
    s.startsWith('PRAGMA') ||
    / RETURNING /i.test(sql)
  );
};

// Auto-inject a generated id for INSERT ... (col, col...) VALUES ($n, ...)
// when the target table has a TEXT PRIMARY KEY `id` and the INSERT doesn't
// already list `id`. This replicates Postgres `DEFAULT gen_random_uuid()`.
const tablesWithUuidPk = new Set<string>([
  'buildings',
  'residents',
  'otp_codes',
  'refresh_tokens',
  'payment_methods',
  'payments',
  'tickets',
  'ticket_comments',
  'announcements',
  'announcement_reads',
  'polls',
  'poll_votes',
]);

const injectId = (
  sql: string,
  params: any[]
): { sql: string; params: any[] } => {
  const insertRe = /^\s*INSERT\s+INTO\s+(\w+)\s*\(([^)]*)\)\s*VALUES\s*\(([^)]*)\)(.*)$/is;
  const m = sql.match(insertRe);
  if (!m) return { sql, params };
  const [, table, cols, values, rest] = m;
  if (!tablesWithUuidPk.has(table.toLowerCase())) return { sql, params };
  const colList = cols.split(',').map((c) => c.trim().toLowerCase());
  if (colList.includes('id')) return { sql, params };

  const newId = crypto.randomUUID();
  const newCols = 'id, ' + cols.trim();
  const newVals = "'" + newId + "', " + values.trim();
  const newSql = `INSERT INTO ${table} (${newCols}) VALUES (${newVals})${rest}`;
  return { sql: newSql, params };
};

export const query = async (text: string, params: any[] = []): Promise<{
  rows: any[];
  rowCount: number;
}> => {
  const start = Date.now();
  try {
    const injected = injectId(text, params);
    const translated = translateSql(injected.sql);
    const boundParams = reorderParams(injected.sql, injected.params);
    const stmt = db.prepare(translated);

    let rows: any[] = [];
    let rowCount = 0;

    if (isSelectLike(translated)) {
      rows = stmt.all(...boundParams) as any[];
      rowCount = rows.length;
    } else {
      const info = stmt.run(...boundParams);
      rowCount = info.changes;
    }

    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log('Executed query', {
        text: text.replace(/\s+/g, ' ').slice(0, 120),
        duration,
        rows: rowCount,
      });
    }
    return { rows, rowCount };
  } catch (error) {
    console.error('Query error:', error, '\nSQL:', text);
    throw error;
  }
};

// No real pooled client — return a minimal object with the same `query` API.
export const getClient = async () => ({
  query,
  release: () => {},
});

export default { query };
