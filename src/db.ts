import BetterSqlite3 from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export interface Database {
  get<T>(sql: string, params?: unknown[]): T | undefined;
  all<T>(sql: string, params?: unknown[]): T[];
  run(sql: string, params?: unknown[]): void;
  close(): void;
  readonly instance: BetterSqlite3.Database;
}

export function createDatabase(dbPath?: string): Database {
  const resolvedPath =
    dbPath ??
    join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'database.db');
  const db = new BetterSqlite3(resolvedPath);

  db.pragma('journal_mode = DELETE');
  db.pragma('foreign_keys = ON');

  initSchema(db);

  return {
    get<T>(sql: string, params: unknown[] = []): T | undefined {
      return db.prepare(sql).get(...params) as T | undefined;
    },
    all<T>(sql: string, params: unknown[] = []): T[] {
      return db.prepare(sql).all(...params) as T[];
    },
    run(sql: string, params: unknown[] = []): void {
      db.prepare(sql).run(...params);
    },
    close(): void {
      db.close();
    },
    get instance() {
      return db;
    },
  };
}

function initSchema(db: BetterSqlite3.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      product_name TEXT NOT NULL,
      ma_number TEXT,
      active_substances TEXT,
      species_authorised TEXT,
      pharmaceutical_form TEXT,
      legal_category TEXT,
      ma_holder TEXT,
      spc_url TEXT,
      status TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'GB'
    );

    CREATE TABLE IF NOT EXISTS withdrawal_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medicine_id TEXT REFERENCES medicines(id),
      species TEXT NOT NULL,
      product_type TEXT,
      period_days INTEGER NOT NULL,
      notes TEXT,
      zero_day_allowed INTEGER DEFAULT 0,
      jurisdiction TEXT NOT NULL DEFAULT 'GB'
    );

    CREATE TABLE IF NOT EXISTS banned_substances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      substance TEXT NOT NULL,
      category TEXT,
      applies_to TEXT,
      regulation_ref TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'GB'
    );

    CREATE TABLE IF NOT EXISTS cascade_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      step_order INTEGER NOT NULL,
      description TEXT NOT NULL,
      documentation_required TEXT,
      default_withdrawal_meat_days INTEGER,
      default_withdrawal_milk_days INTEGER,
      source TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'GB'
    );

    CREATE TABLE IF NOT EXISTS record_requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      holding_type TEXT,
      species TEXT,
      requirement TEXT NOT NULL,
      retention_period TEXT,
      regulation_ref TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'GB'
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
      title, body, species, jurisdiction
    );

    CREATE TABLE IF NOT EXISTS db_metadata (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('schema_version', '1.0');
    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('mcp_name', 'UK Vet Medicines MCP');
    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('jurisdiction', 'GB');
  `);
}

export function ftsSearch(
  db: Database,
  query: string,
  limit: number = 20
): { title: string; body: string; species: string; jurisdiction: string; rank: number }[] {
  return db.all(
    `SELECT title, body, species, jurisdiction, rank
     FROM search_index
     WHERE search_index MATCH ?
     ORDER BY rank
     LIMIT ?`,
    [query, limit]
  );
}
