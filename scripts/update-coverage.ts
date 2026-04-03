/**
 * Update coverage.json from the current database state.
 */
import { createDatabase } from '../src/db.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'database.db');
const COVERAGE_PATH = join(__dirname, '..', 'data', 'coverage.json');

const db = createDatabase(DB_PATH);

const medicines = db.all('SELECT COUNT(*) as count FROM medicines', []) as { count: number }[];
const withdrawal = db.all('SELECT COUNT(*) as count FROM withdrawal_periods', []) as { count: number }[];
const banned = db.all('SELECT COUNT(*) as count FROM banned_substances', []) as { count: number }[];
const cascade = db.all('SELECT COUNT(*) as count FROM cascade_rules', []) as { count: number }[];
const records = db.all('SELECT COUNT(*) as count FROM record_requirements', []) as { count: number }[];
const buildDate = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['build_date']);

db.close();

const coverage = {
  mcp_name: 'UK Vet Medicines MCP',
  jurisdiction: 'GB',
  build_date: buildDate?.value ?? new Date().toISOString().split('T')[0],
  medicines: medicines[0].count,
  withdrawal_periods: withdrawal[0].count,
  banned_substances: banned[0].count,
  cascade_rules: cascade[0].count,
  record_requirements: records[0].count,
};

writeFileSync(COVERAGE_PATH, JSON.stringify(coverage, null, 2) + '\n');
console.log('Coverage updated:', coverage);
