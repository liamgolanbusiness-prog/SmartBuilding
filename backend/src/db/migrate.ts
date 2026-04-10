import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'vaad.sqlite');

const schemaPath = path.resolve(__dirname, 'schema.sqlite.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.exec(schema);
console.log('✅ Schema applied to', dbPath);
db.close();
