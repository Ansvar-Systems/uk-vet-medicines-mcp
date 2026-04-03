import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface BannedSubstancesArgs {
  species?: string;
  production_type?: string;
  jurisdiction?: string;
}

export function handleGetBannedSubstances(db: Database, args: BannedSubstancesArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const conditions: string[] = ['jurisdiction = ?'];
  const params: unknown[] = [jv.jurisdiction];

  if (args.species) {
    conditions.push('(LOWER(applies_to) LIKE ? OR LOWER(applies_to) LIKE ?)');
    params.push(`%${args.species.toLowerCase()}%`, '%all%');
  }

  if (args.production_type) {
    conditions.push('LOWER(applies_to) LIKE ?');
    params.push(`%${args.production_type.toLowerCase()}%`);
  }

  const substances = db.all<{
    substance: string; category: string; applies_to: string; regulation_ref: string;
  }>(
    `SELECT substance, category, applies_to, regulation_ref
     FROM banned_substances WHERE ${conditions.join(' AND ')}`,
    params
  );

  return {
    jurisdiction: jv.jurisdiction,
    filter: {
      species: args.species ?? 'all',
      production_type: args.production_type ?? 'all',
    },
    results_count: substances.length,
    banned_substances: substances.map(s => ({
      substance: s.substance,
      category: s.category,
      applies_to: s.applies_to,
      regulation_ref: s.regulation_ref,
    })),
    warning: 'Use of banned substances in food-producing animals is a criminal offence under ' +
      'the Veterinary Medicines Regulations 2013 and EU-derived retained legislation. ' +
      'Penalties include prosecution, product recalls, and holding movement restrictions.',
    _meta: buildMeta({
      source_url: 'https://www.legislation.gov.uk/uksi/2013/2033/contents',
    }),
  };
}
