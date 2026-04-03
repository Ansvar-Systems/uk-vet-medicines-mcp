import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleCheckCascadeRules } from '../../src/tools/check-cascade-rules.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-cascade.db';

describe('check_cascade_rules tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns cascade steps in order', () => {
    const result = handleCheckCascadeRules(db, {
      species: 'cattle',
      condition: 'respiratory infection',
    });
    expect(result).toHaveProperty('cascade_steps');
    const steps = (result as { cascade_steps: { step: number }[] }).cascade_steps;
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].step).toBe(1);
  });

  test('step 2 has default withdrawal periods', () => {
    const result = handleCheckCascadeRules(db, {
      species: 'sheep',
      condition: 'footrot',
    });
    const steps = (result as { cascade_steps: { step: number; default_withdrawal_periods: { meat_days: number; milk_days: number } }[] }).cascade_steps;
    const step2 = steps.find(s => s.step === 2);
    expect(step2).toBeDefined();
    expect(step2!.default_withdrawal_periods.meat_days).toBe(28);
    expect(step2!.default_withdrawal_periods.milk_days).toBe(7);
  });

  test('includes guidance text with species and condition', () => {
    const result = handleCheckCascadeRules(db, {
      species: 'cattle',
      condition: 'mastitis',
    });
    expect(result).toHaveProperty('guidance');
    const guidance = (result as { guidance: string }).guidance;
    expect(guidance).toContain('cattle');
    expect(guidance).toContain('mastitis');
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleCheckCascadeRules(db, {
      species: 'cattle',
      condition: 'test',
      jurisdiction: 'IE',
    });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });

  test('includes _meta', () => {
    const result = handleCheckCascadeRules(db, {
      species: 'cattle',
      condition: 'lameness',
    });
    expect(result).toHaveProperty('_meta');
  });
});
