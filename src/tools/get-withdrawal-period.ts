import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface WithdrawalPeriodArgs {
  medicine_id: string;
  species: string;
  product_type?: string;
  jurisdiction?: string;
}

const WITHDRAWAL_DISCLAIMER =
  'IMPORTANT: These withdrawal periods are for standard dosing as stated in the SPC. ' +
  'If a different dose, route, or frequency was used (including under the cascade), ' +
  'minimum statutory withdrawal periods apply instead. ALWAYS check the actual Summary ' +
  'of Product Characteristics (SPC) for your specific product, dose, and route before ' +
  'sending animals or animal products into the food chain. Errors in withdrawal period ' +
  'compliance can result in medicine residues in food — a food safety and legal offence.';

export function handleGetWithdrawalPeriod(db: Database, args: WithdrawalPeriodArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  // Check medicine exists
  const medicine = db.get<{ id: string; product_name: string; spc_url: string }>(
    'SELECT id, product_name, spc_url FROM medicines WHERE id = ? AND jurisdiction = ?',
    [args.medicine_id, jv.jurisdiction]
  );

  if (!medicine) {
    return {
      error: 'not_found',
      message: `Medicine '${args.medicine_id}' not found. Use search_authorised_medicines to find valid IDs.`,
    };
  }

  // Build query
  const conditions: string[] = ['medicine_id = ?', 'LOWER(species) = LOWER(?)', 'jurisdiction = ?'];
  const params: unknown[] = [args.medicine_id, args.species, jv.jurisdiction];

  if (args.product_type) {
    conditions.push('LOWER(product_type) = LOWER(?)');
    params.push(args.product_type);
  }

  const periods = db.all<{
    species: string; product_type: string; period_days: number;
    notes: string; zero_day_allowed: number;
  }>(
    `SELECT species, product_type, period_days, notes, zero_day_allowed
     FROM withdrawal_periods
     WHERE ${conditions.join(' AND ')}`,
    params
  );

  if (periods.length === 0) {
    // Check if there are any withdrawal periods for this medicine at all
    const anyPeriods = db.all<{ species: string; product_type: string }>(
      'SELECT DISTINCT species, product_type FROM withdrawal_periods WHERE medicine_id = ? AND jurisdiction = ?',
      [args.medicine_id, jv.jurisdiction]
    );

    return {
      error: 'no_withdrawal_period',
      message: `No withdrawal period found for '${medicine.product_name}' in species '${args.species}'.`,
      available_species: anyPeriods.map(p => ({ species: p.species, product_type: p.product_type })),
      spc_url: medicine.spc_url,
      warning: WITHDRAWAL_DISCLAIMER,
      _meta: buildMeta(),
    };
  }

  return {
    medicine_id: args.medicine_id,
    product_name: medicine.product_name,
    species: args.species,
    jurisdiction: jv.jurisdiction,
    withdrawal_periods: periods.map(p => ({
      product_type: p.product_type,
      period_days: p.period_days,
      zero_day_allowed: p.zero_day_allowed === 1,
      notes: p.notes,
    })),
    spc_url: medicine.spc_url,
    warning: WITHDRAWAL_DISCLAIMER,
    _meta: buildMeta({
      source_url: medicine.spc_url || 'https://www.vmd.defra.gov.uk/productinformationdatabase/',
    }),
  };
}
