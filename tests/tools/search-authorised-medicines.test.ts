import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleSearchAuthorisedMedicines } from '../../src/tools/search-authorised-medicines.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-search-medicines.db';

describe('search_authorised_medicines tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns results for oxytetracycline query', () => {
    const result = handleSearchAuthorisedMedicines(db, { query: 'oxytetracycline' });
    expect(result).toHaveProperty('medicines');
    const medicines = (result as { medicines: unknown[] }).medicines;
    expect(medicines.length).toBeGreaterThan(0);
  });

  test('returns FTS results for broad search', () => {
    const result = handleSearchAuthorisedMedicines(db, { query: 'injection' });
    expect(result).toHaveProperty('fts_results');
  });

  test('filters by species', () => {
    const result = handleSearchAuthorisedMedicines(db, { query: 'Engemycin', species: 'cattle' });
    expect(result).toHaveProperty('medicines');
    const medicines = (result as { medicines: { species_authorised: string }[] }).medicines;
    for (const m of medicines) {
      expect(m.species_authorised.toLowerCase()).toContain('cattle');
    }
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleSearchAuthorisedMedicines(db, { query: 'test', jurisdiction: 'FR' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });

  test('includes _meta in results', () => {
    const result = handleSearchAuthorisedMedicines(db, { query: 'Engemycin' });
    expect(result).toHaveProperty('_meta');
    expect((result as { _meta: { disclaimer: string } })._meta.disclaimer).toContain('SPC');
  });
});
