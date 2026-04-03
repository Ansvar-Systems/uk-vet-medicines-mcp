import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleGetWithdrawalPeriod } from '../../src/tools/get-withdrawal-period.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-withdrawal.db';

describe('get_withdrawal_period tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns correct meat withdrawal for Engemycin LA cattle', () => {
    const result = handleGetWithdrawalPeriod(db, {
      medicine_id: 'engemycin-la',
      species: 'Cattle',
      product_type: 'Meat',
    });
    expect(result).toHaveProperty('withdrawal_periods');
    const periods = (result as { withdrawal_periods: { period_days: number }[] }).withdrawal_periods;
    expect(periods).toHaveLength(1);
    expect(periods[0].period_days).toBe(31);
  });

  test('returns correct milk withdrawal for Engemycin LA cattle', () => {
    const result = handleGetWithdrawalPeriod(db, {
      medicine_id: 'engemycin-la',
      species: 'Cattle',
      product_type: 'Milk',
    });
    const periods = (result as { withdrawal_periods: { period_days: number }[] }).withdrawal_periods;
    expect(periods).toHaveLength(1);
    expect(periods[0].period_days).toBe(7);
  });

  test('returns correct sheep meat withdrawal for Engemycin LA', () => {
    const result = handleGetWithdrawalPeriod(db, {
      medicine_id: 'engemycin-la',
      species: 'Sheep',
      product_type: 'Meat',
    });
    const periods = (result as { withdrawal_periods: { period_days: number }[] }).withdrawal_periods;
    expect(periods).toHaveLength(1);
    expect(periods[0].period_days).toBe(21);
  });

  test('returns zero-day withdrawal for Excenel RTU milk', () => {
    const result = handleGetWithdrawalPeriod(db, {
      medicine_id: 'excenel-rtu',
      species: 'Cattle',
      product_type: 'Milk',
    });
    const periods = (result as { withdrawal_periods: { period_days: number; zero_day_allowed: boolean }[] }).withdrawal_periods;
    expect(periods).toHaveLength(1);
    expect(periods[0].period_days).toBe(0);
    expect(periods[0].zero_day_allowed).toBe(true);
  });

  test('returns zero-day for vaccine (Covexin 8)', () => {
    const result = handleGetWithdrawalPeriod(db, {
      medicine_id: 'covexin-8',
      species: 'Cattle',
      product_type: 'Meat',
    });
    const periods = (result as { withdrawal_periods: { period_days: number; zero_day_allowed: boolean }[] }).withdrawal_periods;
    expect(periods).toHaveLength(1);
    expect(periods[0].period_days).toBe(0);
    expect(periods[0].zero_day_allowed).toBe(true);
  });

  test('ALWAYS includes SPC warning', () => {
    const result = handleGetWithdrawalPeriod(db, {
      medicine_id: 'engemycin-la',
      species: 'Cattle',
    });
    expect(result).toHaveProperty('warning');
    const warning = (result as { warning: string }).warning;
    expect(warning).toContain('SPC');
    expect(warning).toContain('food chain');
  });

  test('returns not_found for invalid medicine', () => {
    const result = handleGetWithdrawalPeriod(db, {
      medicine_id: 'nonexistent',
      species: 'Cattle',
    });
    expect(result).toHaveProperty('error', 'not_found');
  });

  test('returns no_withdrawal_period for unmatched species', () => {
    const result = handleGetWithdrawalPeriod(db, {
      medicine_id: 'excenel-rtu',
      species: 'Sheep',
    });
    expect(result).toHaveProperty('error', 'no_withdrawal_period');
    expect(result).toHaveProperty('available_species');
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleGetWithdrawalPeriod(db, {
      medicine_id: 'engemycin-la',
      species: 'Cattle',
      jurisdiction: 'DE',
    });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });
});
