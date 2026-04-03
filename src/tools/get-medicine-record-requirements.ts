import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface RecordRequirementsArgs {
  species?: string;
  holding_type?: string;
  jurisdiction?: string;
}

export function handleGetMedicineRecordRequirements(db: Database, args: RecordRequirementsArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const conditions: string[] = ['jurisdiction = ?'];
  const params: unknown[] = [jv.jurisdiction];

  if (args.species) {
    conditions.push('(species IS NULL OR LOWER(species) LIKE ?)');
    params.push(`%${args.species.toLowerCase()}%`);
  }

  if (args.holding_type) {
    conditions.push('(holding_type IS NULL OR LOWER(holding_type) LIKE ?)');
    params.push(`%${args.holding_type.toLowerCase()}%`);
  }

  const requirements = db.all<{
    holding_type: string; species: string; requirement: string;
    retention_period: string; regulation_ref: string;
  }>(
    `SELECT holding_type, species, requirement, retention_period, regulation_ref
     FROM record_requirements WHERE ${conditions.join(' AND ')}`,
    params
  );

  return {
    species: args.species ?? 'all',
    holding_type: args.holding_type ?? 'all',
    jurisdiction: jv.jurisdiction,
    requirements_count: requirements.length,
    requirements: requirements.map(r => ({
      holding_type: r.holding_type,
      species: r.species,
      requirement: r.requirement,
      retention_period: r.retention_period,
      regulation_ref: r.regulation_ref,
    })),
    _meta: buildMeta({
      source_url: 'https://www.legislation.gov.uk/uksi/2013/2033/contents',
    }),
  };
}
