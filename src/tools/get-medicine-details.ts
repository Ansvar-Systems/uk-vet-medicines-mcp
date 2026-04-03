import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface MedicineDetailsArgs {
  medicine_id: string;
  jurisdiction?: string;
}

export function handleGetMedicineDetails(db: Database, args: MedicineDetailsArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const medicine = db.get<{
    id: string; product_name: string; ma_number: string; active_substances: string;
    species_authorised: string; pharmaceutical_form: string; legal_category: string;
    ma_holder: string; spc_url: string; status: string; jurisdiction: string;
  }>(
    'SELECT * FROM medicines WHERE id = ? AND jurisdiction = ?',
    [args.medicine_id, jv.jurisdiction]
  );

  if (!medicine) {
    return {
      error: 'not_found',
      message: `Medicine '${args.medicine_id}' not found. Use search_authorised_medicines to find valid IDs.`,
    };
  }

  const withdrawalPeriods = db.all<{
    species: string; product_type: string; period_days: number;
    notes: string; zero_day_allowed: number;
  }>(
    'SELECT species, product_type, period_days, notes, zero_day_allowed FROM withdrawal_periods WHERE medicine_id = ? AND jurisdiction = ?',
    [args.medicine_id, jv.jurisdiction]
  );

  return {
    ...medicine,
    withdrawal_periods: withdrawalPeriods.map(wp => ({
      species: wp.species,
      product_type: wp.product_type,
      period_days: wp.period_days,
      zero_day_allowed: wp.zero_day_allowed === 1,
      notes: wp.notes,
    })),
    _meta: buildMeta({
      source_url: medicine.spc_url || 'https://www.vmd.defra.gov.uk/productinformationdatabase/',
    }),
  };
}
