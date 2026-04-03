import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import { ftsSearch, type Database } from '../db.js';

interface SearchArgs {
  query: string;
  species?: string;
  pharmaceutical_form?: string;
  active_substance?: string;
  jurisdiction?: string;
  limit?: number;
}

export function handleSearchAuthorisedMedicines(db: Database, args: SearchArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const limit = Math.min(args.limit ?? 20, 50);

  // Try FTS5 first
  let ftsResults = ftsSearch(db, args.query, limit);

  if (args.species) {
    ftsResults = ftsResults.filter(r =>
      r.species.toLowerCase().includes(args.species!.toLowerCase())
    );
  }

  // Also do a direct SQL search on the medicines table for structured queries
  const conditions: string[] = ['jurisdiction = ?'];
  const params: unknown[] = [jv.jurisdiction];

  if (args.active_substance) {
    conditions.push('LOWER(active_substances) LIKE ?');
    params.push(`%${args.active_substance.toLowerCase()}%`);
  }
  if (args.species) {
    conditions.push('LOWER(species_authorised) LIKE ?');
    params.push(`%${args.species.toLowerCase()}%`);
  }
  if (args.pharmaceutical_form) {
    conditions.push('LOWER(pharmaceutical_form) LIKE ?');
    params.push(`%${args.pharmaceutical_form.toLowerCase()}%`);
  }

  // Free text match on product name
  conditions.push('(LOWER(product_name) LIKE ? OR LOWER(active_substances) LIKE ?)');
  params.push(`%${args.query.toLowerCase()}%`, `%${args.query.toLowerCase()}%`);

  params.push(limit);

  const sqlResults = db.all<{
    id: string; product_name: string; ma_number: string; active_substances: string;
    species_authorised: string; pharmaceutical_form: string; legal_category: string;
    ma_holder: string; status: string;
  }>(
    `SELECT id, product_name, ma_number, active_substances, species_authorised,
            pharmaceutical_form, legal_category, ma_holder, status
     FROM medicines WHERE ${conditions.join(' AND ')}
     LIMIT ?`,
    params
  );

  return {
    query: args.query,
    jurisdiction: jv.jurisdiction,
    results_count: sqlResults.length + ftsResults.length,
    medicines: sqlResults.map(m => ({
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
    fts_results: ftsResults.map(r => ({
      title: r.title,
      body: r.body,
      species: r.species,
      relevance_rank: r.rank,
    })),
    _meta: buildMeta(),
  };
}
