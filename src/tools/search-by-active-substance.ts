import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface ActiveSubstanceArgs {
  active_substance: string;
  species?: string;
  jurisdiction?: string;
}

export function handleSearchByActiveSubstance(db: Database, args: ActiveSubstanceArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const conditions: string[] = [
    'jurisdiction = ?',
    'LOWER(active_substances) LIKE ?',
  ];
  const params: unknown[] = [jv.jurisdiction, `%${args.active_substance.toLowerCase()}%`];

  if (args.species) {
    conditions.push('LOWER(species_authorised) LIKE ?');
    params.push(`%${args.species.toLowerCase()}%`);
  }

  const medicines = db.all<{
    id: string; product_name: string; ma_number: string; active_substances: string;
    species_authorised: string; pharmaceutical_form: string; legal_category: string;
    ma_holder: string; status: string;
  }>(
    `SELECT id, product_name, ma_number, active_substances, species_authorised,
            pharmaceutical_form, legal_category, ma_holder, status
     FROM medicines WHERE ${conditions.join(' AND ')}`,
    params
  );

  // Check if substance is banned
  const banned = db.get<{ substance: string; category: string; applies_to: string; regulation_ref: string }>(
    'SELECT substance, category, applies_to, regulation_ref FROM banned_substances WHERE LOWER(substance) LIKE ? AND jurisdiction = ?',
    [`%${args.active_substance.toLowerCase()}%`, jv.jurisdiction]
  );

  return {
    active_substance: args.active_substance,
    jurisdiction: jv.jurisdiction,
    results_count: medicines.length,
    banned_status: banned ? {
      is_banned: true,
      substance: banned.substance,
      category: banned.category,
      applies_to: banned.applies_to,
      regulation_ref: banned.regulation_ref,
    } : { is_banned: false },
    medicines: medicines.map(m => ({
      id: m.id,
      product_name: m.product_name,
      ma_number: m.ma_number,
      active_substances: m.active_substances,
      species_authorised: m.species_authorised,
      pharmaceutical_form: m.pharmaceutical_form,
      legal_category: m.legal_category,
      ma_holder: m.ma_holder,
      status: m.status,
    })),
    _meta: buildMeta(),
  };
}
