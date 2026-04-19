// Database adapter — picks between real Postgres (via `pg`) and a local
// SQLite shim based on the DATABASE_URL env var. Both expose the same
// `{ query, getClient }` surface used across the app.
//
//   postgres:// or postgresql://  → real Postgres, no SQL translation.
//   anything else (or unset)      → SQLite shim that translates the app's
//                                   Postgres-flavored SQL on the fly.
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

type QueryResult = { rows: any[]; rowCount: number };
type QueryFn = (text: string, params?: any[]) => Promise<QueryResult>;

const databaseUrl = (process.env.DATABASE_URL || '').trim();
const usePostgres = /^postgres(ql)?:\/\//i.test(databaseUrl);

// ============================================================
//   Postgres path — used in production + when DATABASE_URL set
// ============================================================
function createPostgresAdapter(): { query: QueryFn; getClient: () => Promise<any> } {
  // Require lazily so SQLite-only dev doesn't need pg installed in RAM.
  // (pg is a declared dep; this just avoids construction cost.)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Pool } = require('pg');

  const needsSsl =
    /supabase\.(co|com|net)|neon\.tech|render\.com|railway\.app|amazonaws\.com/i.test(
      databaseUrl
    ) || process.env.PGSSLMODE === 'require';

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: parseInt(process.env.PG_POOL_MAX || '10', 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  pool.on('error', (err: Error) => {
    console.error('⚠️  Unexpected Postgres pool error:', err);
  });

  const host = (() => {
    try { return new URL(databaseUrl).host; } catch { return 'postgres'; }
  })();
  console.log(`✅ Database connected (Postgres at ${host})`);

  // A few route files have startup CREATE TABLE IF NOT EXISTS statements
  // written in SQLite dialect (datetime('now'), INTEGER flags). Translate
  // them inline so the same app code runs against either backend.
  const normalizeForPg = (sql: string): string => {
    let out = sql;
    out = out.replace(/datetime\(\s*'now'\s*\)/gi, 'NOW()');
    out = out.replace(/\bINTEGER\b/g, 'INTEGER'); // keep, harmless
    return out;
  };

  const query: QueryFn = async (text, params = []) => {
    const start = Date.now();
    const sql = normalizeForPg(text);
    try {
      const result = await pool.query(sql, params);
      if (process.env.NODE_ENV !== 'production') {
        console.log('Executed query', {
          text: sql.replace(/\s+/g, ' ').slice(0, 120),
          duration: Date.now() - start,
          rows: result.rowCount ?? (result.rows ? result.rows.length : 0),
        });
      }
      return { rows: result.rows || [], rowCount: result.rowCount ?? 0 };
    } catch (error) {
      console.error('Query error:', error, '\nSQL:', sql);
      throw error;
    }
  };

  const getClient = async () => {
    const client = await pool.connect();
    return {
      query: (text: string, params?: any[]) => client.query(text, params),
      release: () => client.release(),
    };
  };

  return { query, getClient };
}

// ============================================================
//   SQLite path — local dev when no Postgres URL is provided
// ============================================================
function createSqliteAdapter(): { query: QueryFn; getClient: () => Promise<any> } {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Database = require('better-sqlite3');

  const dbDir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  const dbPath = path.join(dbDir, 'vaad.sqlite');

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  console.log('✅ Database connected (SQLite at ' + dbPath + ')');

  // Auto-apply the base schema on boot. Every CREATE statement is
  // IF NOT EXISTS, so this is safe to run repeatedly and guarantees
  // that tables like otp_codes exist before the first request lands.
  try {
    const schemaPath = path.resolve(__dirname, '../db/schema.sqlite.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      db.exec(schemaSql);
    }
  } catch (err) {
    console.error('⚠️  Failed to apply schema on boot:', err);
  }

  const bindValue = (v: any): any => {
    if (v === undefined) return null;
    if (v === null) return null;
    if (v instanceof Date) {
      return v.toISOString().replace('T', ' ').slice(0, 19);
    }
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  };

  const translateSql = (sql: string): string => {
    let out = sql;
    out = out.replace(
      /NOW\(\)\s*([+-])\s*INTERVAL\s*'(\d+)\s*(\w+)'/gi,
      (_m, sign: string, n: string, unit: string) =>
        `datetime('now', '${sign}${n} ${unit.toLowerCase()}')`
    );
    out = out.replace(/\bNOW\(\)/gi, `datetime('now')`);
    out = out.replace(/gen_random_uuid\(\)/gi, `lower(hex(randomblob(16)))`);
    out = out.replace(/\$(\d+)/g, '?');
    return out;
  };

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
    'payment_rules',
    'expenses',
    'maintenance_tasks',
    'audit_log',
    'building_documents',
    'contractors',
    'ticket_attachments',
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

  const query: QueryFn = async (text, params = []) => {
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

      if (process.env.NODE_ENV !== 'production') {
        console.log('Executed query', {
          text: text.replace(/\s+/g, ' ').slice(0, 120),
          duration: Date.now() - start,
          rows: rowCount,
        });
      }
      return { rows, rowCount };
    } catch (error) {
      console.error('Query error:', error, '\nSQL:', text);
      throw error;
    }
  };

  const getClient = async () => ({ query, release: () => {} });

  return { query, getClient };
}

const adapter = usePostgres ? createPostgresAdapter() : createSqliteAdapter();

export const query: QueryFn = adapter.query;
export const getClient = adapter.getClient;

export default { query };
