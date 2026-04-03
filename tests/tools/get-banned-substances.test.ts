import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleGetBannedSubstances } from '../../src/tools/get-banned-substances.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-banned.db';

describe('get_banned_substances tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns all banned substances', () => {
    const result = handleGetBannedSubstances(db, {});
    expect(result).toHaveProperty('banned_substances');
    const substances = (result as { banned_substances: unknown[] }).banned_substances;
    expect(substances.length).toBeGreaterThan(0);
  });

  test('includes chloramphenicol', () => {
    const result = handleGetBannedSubstances(db, {});
    const substances = (result as { banned_substances: { substance: string }[] }).banned_substances;
    const chlor = substances.find(s => s.substance === 'Chloramphenicol');
    expect(chlor).toBeDefined();
  });

  test('includes criminal offence warning', () => {
    const result = handleGetBannedSubstances(db, {});
    expect(result).toHaveProperty('warning');
    const warning = (result as { warning: string }).warning;
    expect(warning).toContain('criminal offence');
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleGetBannedSubstances(db, { jurisdiction: 'US' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });

  test('includes _meta', () => {
    const result = handleGetBannedSubstances(db, {});
    expect(result).toHaveProperty('_meta');
  });
});
