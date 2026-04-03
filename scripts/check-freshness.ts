/**
 * Check data freshness and exit non-zero if stale.
 */
import { createDatabase } from '../src/db.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'database.db');
const STALENESS_THRESHOLD_DAYS = 90;

const db = createDatabase(DB_PATH);
const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);
db.close();

if (!lastIngest?.value) {
  console.log('UNKNOWN: No ingestion date found.');
  process.exit(1);
}

const ingestDate = new Date(lastIngest.value);
const now = new Date();
const daysSince = Math.floor((now.getTime() - ingestDate.getTime()) / (1000 * 60 * 60 * 24));

if (daysSince > STALENESS_THRESHOLD_DAYS) {
  console.log(`STALE: Data is ${daysSince} days old (threshold: ${STALENESS_THRESHOLD_DAYS}).`);
  process.exit(1);
} else {
  console.log(`FRESH: Data is ${daysSince} days old (threshold: ${STALENESS_THRESHOLD_DAYS}).`);
  process.exit(0);
}
