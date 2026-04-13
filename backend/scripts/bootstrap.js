// Runs once at container startup BEFORE the server.
// - Ensures the SQLite schema is applied
// - Adds any new columns that may be missing on an existing DB (idempotent)
// - Seeds the latest full demo dataset via scripts/reset-seed.js so the
//   deployed instance is immediately usable from a phone.
//
// Idempotent: if the `buildings` table already has rows, nothing is re-seeded.

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'vaad.sqlite');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---- Schema ----
const schemaPath = path.join(__dirname, '..', 'src', 'db', 'schema.sqlite.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);
console.log('✅ Schema applied');

// ---- Safety migrations for older on-disk databases ----
// SQLite ALTER TABLE ADD COLUMN errors if the column already exists; we
// swallow those so the script stays idempotent across deploys.
const safeAddColumn = (table, column, type) => {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    console.log(`  + ${table}.${column}`);
  } catch (e) {
    // duplicate column — nothing to do
  }
};
safeAddColumn('buildings', 'total_floors', 'INTEGER DEFAULT 1');
safeAddColumn('residents', 'floor', 'INTEGER');

// ---- Seed (only if empty) ----
const { c: buildingCount } = db.prepare('SELECT COUNT(*) c FROM buildings').get();
if (buildingCount > 0) {
  console.log(`ℹ️  Database already has ${buildingCount} building(s) — skipping seed.`);
  db.close();
  return;
}

console.log('🌱 Empty database — running full reset-seed...');
db.close();

// reset-seed.js opens its own connection to data/vaad.sqlite (relative to
// cwd, which is the backend/ workdir). It wipes any existing rows and
// creates the full test building "מגדלי הים התיכון".
try {
  require('./reset-seed.js');
  console.log('\n🎉 Bootstrap finished. Demo credentials:');
  console.log('  Building: מגדלי הים התיכון  (invite code: SEA2026)');
  console.log('  Admin:    +972501000000  (vaad_admin, super admin)');
  console.log('  Member:   +972501000001  (vaad_member)');
  console.log('  Resident: +972501000002  (regular resident)');
  console.log('  …38 residents total. Any +97250100000N (N = 0-9) or');
  console.log('  +9725010000NN (NN = 10-37) works.');
  console.log('  Pre-seeded OTP: 123456 (also returned in DEMO_MODE response)\n');
} catch (err) {
  console.error('❌ reset-seed failed:', err && err.message);
  process.exit(1);
}
